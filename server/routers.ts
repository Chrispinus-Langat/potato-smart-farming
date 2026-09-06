import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import {
  addCommunityComment,
  createCommunityPost,
  createConversation,
  createFarm,
  createField,
  createTask,
  getFarmDetails,
  listCommunityPosts,
  listConversations,
  listDiagnoses,
  listFields,
  listFarms,
  listMessages,
  listSuggestedFarmers,
  listTasks,
  saveDiagnosis,
  sendMessage,
  toggleCommunityLike,
  toggleFollow,
  toggleTask,
} from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { storageGetSignedUrl, storagePut } from "./storage";

const optionalDate = z.coerce.date().optional();
const diagnosisImageMime = z.enum(["image/jpeg", "image/png", "image/webp"]);

const diagnosisSchema = {
  name: "potato_crop_diagnosis",
  strict: true,
  schema: {
    type: "object",
    properties: {
      diseaseName: { type: "string", description: "Best-supported disease or Healthy crop when no disease is visible." },
      diseaseNameSwahili: { type: "string", description: "Common Swahili name when known, otherwise an empty string." },
      confidence: { type: "integer", minimum: 0, maximum: 100 },
      symptoms: { type: "string" },
      organicTreatment: { type: "string" },
      chemicalTreatment: { type: "string" },
      estimatedCost: { type: "string" },
      needsExpertReview: { type: "boolean" },
    },
    required: ["diseaseName", "diseaseNameSwahili", "confidence", "symptoms", "organicTreatment", "chemicalTreatment", "estimatedCost", "needsExpertReview"],
    additionalProperties: false,
  },
} as const;

function sanitizeFileName(fileName: string) {
  return fileName.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").slice(-120) || "crop-photo";
}

function contentToText(content: unknown) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map((part) => (typeof part === "string" ? part : "text" in part ? part.text : "")).join("\n");
  return "";
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  farms: router({
    list: protectedProcedure.query(({ ctx }) => listFarms(ctx.user.id)),
    details: protectedProcedure.input(z.object({ farmId: z.number().int().positive() })).query(({ ctx, input }) => getFarmDetails(ctx.user.id, input.farmId)),
    create: protectedProcedure.input(z.object({ name: z.string().trim().min(2).max(160), location: z.string().trim().max(160).optional(), acreage: z.string().trim().max(32).optional() })).mutation(({ ctx, input }) => createFarm(ctx.user.id, input)),
    fields: protectedProcedure.query(({ ctx }) => listFields(ctx.user.id)),
    addField: protectedProcedure.input(z.object({ farmId: z.number().int().positive(), name: z.string().trim().min(2).max(160), variety: z.string().trim().max(80).optional(), acreage: z.string().trim().max(32).optional(), plantedAt: optionalDate, healthScore: z.number().int().min(0).max(100).optional() })).mutation(({ ctx, input }) => createField(ctx.user.id, input)),
    tasks: protectedProcedure.query(({ ctx }) => listTasks(ctx.user.id)),
    addTask: protectedProcedure.input(z.object({ farmId: z.number().int().positive().optional(), title: z.string().trim().min(2).max(160), description: z.string().trim().max(5000).optional(), dueAt: optionalDate })).mutation(({ ctx, input }) => createTask(ctx.user.id, input)),
    toggleTask: protectedProcedure.input(z.object({ id: z.number().int().positive(), completed: z.boolean() })).mutation(({ ctx, input }) => toggleTask(ctx.user.id, input.id, input.completed)),
  }),

  diagnosis: router({
    history: protectedProcedure.query(({ ctx }) => listDiagnoses(ctx.user.id)),
    save: protectedProcedure.input(z.object({ farmId: z.number().int().positive().optional(), fieldId: z.number().int().positive().optional(), imageUrl: z.string().url().optional(), imageKey: z.string().max(512).optional(), diseaseName: z.string().trim().min(2).max(160), diseaseNameSwahili: z.string().trim().max(160).optional(), confidence: z.number().int().min(0).max(100), symptoms: z.string().max(10000).optional(), organicTreatment: z.string().max(10000).optional(), chemicalTreatment: z.string().max(10000).optional(), estimatedCost: z.string().max(32).optional() })).mutation(({ ctx, input }) => saveDiagnosis(ctx.user.id, input)),
    analyze: protectedProcedure.input(z.object({ fileName: z.string().min(1).max(200), mimeType: diagnosisImageMime, dataBase64: z.string().min(100).max(12_000_000), farmId: z.number().int().positive().optional(), fieldId: z.number().int().positive().optional() })).mutation(async ({ ctx, input }) => {
      const imageBytes = Buffer.from(input.dataBase64, "base64");
      if (imageBytes.length === 0 || imageBytes.length > 8 * 1024 * 1024) throw new Error("Crop image must be between 1 byte and 8 MB");
      const uploaded = await storagePut(`diagnoses/${ctx.user.id}/${Date.now()}-${sanitizeFileName(input.fileName)}`, imageBytes, input.mimeType);
      const signedImageUrl = await storageGetSignedUrl(uploaded.key);
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a cautious potato crop health assistant. Analyze only visible evidence in the image. If evidence is insufficient, set needsExpertReview true, reduce confidence, and use Unknown or Healthy crop rather than inventing a disease. Give practical, region-agnostic advice and clearly separate organic and chemical options." },
          { role: "user", content: [{ type: "text", text: "Analyze this potato leaf or tuber photo for disease signs. Return the requested structured diagnosis." }, { type: "image_url", image_url: { url: signedImageUrl, detail: "high" } }] },
        ],
        response_format: { type: "json_schema", json_schema: diagnosisSchema },
      });
      const raw = contentToText(response.choices[0]?.message.content);
      const result = JSON.parse(raw) as { diseaseName: string; diseaseNameSwahili: string; confidence: number; symptoms: string; organicTreatment: string; chemicalTreatment: string; estimatedCost: string; needsExpertReview: boolean };
      const saved = await saveDiagnosis(ctx.user.id, { farmId: input.farmId, fieldId: input.fieldId, imageUrl: uploaded.url, imageKey: uploaded.key, diseaseName: result.diseaseName, diseaseNameSwahili: result.diseaseNameSwahili || undefined, confidence: result.confidence, symptoms: result.symptoms, organicTreatment: result.organicTreatment, chemicalTreatment: result.chemicalTreatment, estimatedCost: result.estimatedCost });
      return { diagnosis: result, record: saved, imageUrl: uploaded.url };
    }),
  }),

  community: router({
    list: protectedProcedure.input(z.object({ limit: z.number().int().min(1).max(50).default(30) }).optional()).query(({ ctx, input }) => listCommunityPosts(ctx.user.id, input?.limit ?? 30)),
    create: protectedProcedure.input(z.object({ body: z.string().trim().min(1).max(5000), imageUrl: z.string().url().optional() })).mutation(({ ctx, input }) => createCommunityPost(ctx.user.id, input.body, input.imageUrl)),
    like: protectedProcedure.input(z.object({ postId: z.number().int().positive() })).mutation(({ ctx, input }) => toggleCommunityLike(ctx.user.id, input.postId)),
    comment: protectedProcedure.input(z.object({ postId: z.number().int().positive(), body: z.string().trim().min(1).max(2000) })).mutation(({ ctx, input }) => addCommunityComment(ctx.user.id, input.postId, input.body)),
    suggested: protectedProcedure.query(({ ctx }) => listSuggestedFarmers(ctx.user.id)),
    follow: protectedProcedure.input(z.object({ userId: z.number().int().positive() })).mutation(({ ctx, input }) => toggleFollow(ctx.user.id, input.userId)),
  }),

  messaging: router({
    conversations: protectedProcedure.query(({ ctx }) => listConversations(ctx.user.id)),
    start: protectedProcedure.input(z.object({ recipientId: z.number().int().positive() })).mutation(({ ctx, input }) => createConversation(ctx.user.id, input.recipientId)),
    messages: protectedProcedure.input(z.object({ conversationId: z.number().int().positive() })).query(({ ctx, input }) => listMessages(ctx.user.id, input.conversationId)),
    send: protectedProcedure.input(z.object({ conversationId: z.number().int().positive(), body: z.string().trim().min(1).max(5000) })).mutation(({ ctx, input }) => sendMessage(ctx.user.id, input.conversationId, input.body)),
  }),
});

export type AppRouter = typeof appRouter;
