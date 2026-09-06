import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function unauthenticatedContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("protected product procedures", () => {
  it("requires authentication before loading farms", async () => {
    const caller = appRouter.createCaller(unauthenticatedContext());
    await expect(caller.farms.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("requires authentication before publishing a community story", async () => {
    const caller = appRouter.createCaller(unauthenticatedContext());
    await expect(caller.community.create({ body: "A practical potato-growing tip" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("requires authentication before opening messages", async () => {
    const caller = appRouter.createCaller(unauthenticatedContext());
    await expect(caller.messaging.conversations()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("requires authentication before analyzing a crop image", async () => {
    const caller = appRouter.createCaller(unauthenticatedContext());
    await expect(caller.diagnosis.analyze({ fileName: "leaf.jpg", mimeType: "image/jpeg", dataBase64: "a".repeat(120) })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("requires authentication before opening farm details", async () => {
    const caller = appRouter.createCaller(unauthenticatedContext());
    await expect(caller.farms.details({ farmId: 1 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
