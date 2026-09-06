import { and, asc, count, desc, eq, inArray, ne } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  communityComments,
  communityLikes,
  communityPosts,
  conversationMembers,
  conversations,
  diagnoses,
  farmerFollows,
  farmTasks,
  farms,
  fields,
  messages,
  InsertFarm,
  InsertUser,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

function requireDb() {
  if (!_db && process.env.DATABASE_URL) {
    _db = drizzle(process.env.DATABASE_URL);
  }
  if (!_db) throw new Error("Database is not configured");
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  values.lastSignedIn ??= new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listFarms(ownerId: number) {
  const db = requireDb();
  return db.select().from(farms).where(eq(farms.ownerId, ownerId)).orderBy(desc(farms.createdAt));
}

export async function createFarm(ownerId: number, input: Omit<InsertFarm, "ownerId">) {
  const db = requireDb();
  const result = await db.insert(farms).values({ ...input, ownerId }).$returningId();
  return db.select().from(farms).where(eq(farms.id, result[0]!.id)).limit(1).then((rows) => rows[0]);
}

export async function listFields(ownerId: number) {
  const db = requireDb();
  return db.select({ field: fields, farmName: farms.name })
    .from(fields)
    .innerJoin(farms, eq(fields.farmId, farms.id))
    .where(eq(farms.ownerId, ownerId))
    .orderBy(desc(fields.createdAt));
}

export async function createField(ownerId: number, input: { farmId: number; name: string; variety?: string; acreage?: string; plantedAt?: Date; healthScore?: number }) {
  const db = requireDb();
  const farm = await db.select({ id: farms.id }).from(farms).where(and(eq(farms.id, input.farmId), eq(farms.ownerId, ownerId))).limit(1);
  if (!farm[0]) throw new Error("Farm not found");
  const result = await db.insert(fields).values(input).$returningId();
  return db.select().from(fields).where(eq(fields.id, result[0]!.id)).limit(1).then((rows) => rows[0]);
}

export async function listTasks(ownerId: number) {
  const db = requireDb();
  return db.select().from(farmTasks).where(eq(farmTasks.ownerId, ownerId)).orderBy(asc(farmTasks.completed), asc(farmTasks.dueAt));
}

export async function createTask(ownerId: number, input: { farmId?: number; title: string; description?: string; dueAt?: Date }) {
  const db = requireDb();
  const result = await db.insert(farmTasks).values({ ...input, ownerId }).$returningId();
  return db.select().from(farmTasks).where(eq(farmTasks.id, result[0]!.id)).limit(1).then((rows) => rows[0]);
}

export async function toggleTask(ownerId: number, id: number, completed: boolean) {
  const db = requireDb();
  await db.update(farmTasks).set({ completed, updatedAt: new Date() }).where(and(eq(farmTasks.id, id), eq(farmTasks.ownerId, ownerId)));
  return db.select().from(farmTasks).where(and(eq(farmTasks.id, id), eq(farmTasks.ownerId, ownerId))).limit(1).then((rows) => rows[0]);
}

export async function listDiagnoses(ownerId: number) {
  const db = requireDb();
  return db.select().from(diagnoses).where(eq(diagnoses.ownerId, ownerId)).orderBy(desc(diagnoses.createdAt));
}

export async function saveDiagnosis(ownerId: number, input: {
  farmId?: number; fieldId?: number; imageUrl?: string; imageKey?: string; diseaseName: string; diseaseNameSwahili?: string;
  confidence: number; symptoms?: string; organicTreatment?: string; chemicalTreatment?: string; estimatedCost?: string;
}) {
  const db = requireDb();
  const result = await db.insert(diagnoses).values({ ...input, ownerId }).$returningId();
  return db.select().from(diagnoses).where(eq(diagnoses.id, result[0]!.id)).limit(1).then((rows) => rows[0]);
}

export async function listCommunityPosts(userId: number, limit = 30) {
  const db = requireDb();
  const posts = await db.select({
    id: communityPosts.id,
    body: communityPosts.body,
    imageUrl: communityPosts.imageUrl,
    createdAt: communityPosts.createdAt,
    authorId: users.id,
    authorName: users.name,
  }).from(communityPosts).innerJoin(users, eq(communityPosts.authorId, users.id)).orderBy(desc(communityPosts.createdAt)).limit(limit);

  if (posts.length === 0) return [];
  const postIds = posts.map((post) => post.id);
  const likes = await db.select({ postId: communityLikes.postId, total: count() }).from(communityLikes).where(inArray(communityLikes.postId, postIds)).groupBy(communityLikes.postId);
  const comments = await db.select({ postId: communityComments.postId, total: count() }).from(communityComments).where(inArray(communityComments.postId, postIds)).groupBy(communityComments.postId);
  const liked = await db.select({ postId: communityLikes.postId }).from(communityLikes).where(and(eq(communityLikes.userId, userId), inArray(communityLikes.postId, postIds)));
  const likedIds = new Set(liked.map((item) => item.postId));
  const likeCounts = new Map(likes.map((item) => [item.postId, Number(item.total)]));
  const commentCounts = new Map(comments.map((item) => [item.postId, Number(item.total)]));

  return posts.map((post) => ({ ...post, likes: likeCounts.get(post.id) ?? 0, comments: commentCounts.get(post.id) ?? 0, isLiked: likedIds.has(post.id) }));
}

export async function createCommunityPost(authorId: number, body: string, imageUrl?: string) {
  const db = requireDb();
  const result = await db.insert(communityPosts).values({ authorId, body, imageUrl }).$returningId();
  return db.select().from(communityPosts).where(eq(communityPosts.id, result[0]!.id)).limit(1).then((rows) => rows[0]);
}

export async function toggleCommunityLike(userId: number, postId: number) {
  const db = requireDb();
  const existing = await db.select().from(communityLikes).where(and(eq(communityLikes.userId, userId), eq(communityLikes.postId, postId))).limit(1);
  if (existing[0]) {
    await db.delete(communityLikes).where(and(eq(communityLikes.userId, userId), eq(communityLikes.postId, postId)));
    return { liked: false };
  }
  await db.insert(communityLikes).values({ userId, postId });
  return { liked: true };
}

export async function addCommunityComment(authorId: number, postId: number, body: string) {
  const db = requireDb();
  const result = await db.insert(communityComments).values({ authorId, postId, body }).$returningId();
  return db.select().from(communityComments).where(eq(communityComments.id, result[0]!.id)).limit(1).then((rows) => rows[0]);
}

export async function listSuggestedFarmers(userId: number) {
  const db = requireDb();
  return db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(ne(users.id, userId)).orderBy(desc(users.lastSignedIn)).limit(10);
}

export async function toggleFollow(followerId: number, followingId: number) {
  const db = requireDb();
  if (followerId === followingId) throw new Error("You cannot follow yourself");
  const existing = await db.select().from(farmerFollows).where(and(eq(farmerFollows.followerId, followerId), eq(farmerFollows.followingId, followingId))).limit(1);
  if (existing[0]) {
    await db.delete(farmerFollows).where(and(eq(farmerFollows.followerId, followerId), eq(farmerFollows.followingId, followingId)));
    return { following: false };
  }
  await db.insert(farmerFollows).values({ followerId, followingId });
  return { following: true };
}

async function assertConversationMember(userId: number, conversationId: number) {
  const db = requireDb();
  const member = await db.select().from(conversationMembers).where(and(eq(conversationMembers.userId, userId), eq(conversationMembers.conversationId, conversationId))).limit(1);
  if (!member[0]) throw new Error("Conversation not found");
}

export async function listConversations(userId: number) {
  const db = requireDb();
  const memberships = await db.select({ conversationId: conversationMembers.conversationId }).from(conversationMembers).where(eq(conversationMembers.userId, userId));
  if (memberships.length === 0) return [];
  const ids = memberships.map((item) => item.conversationId);
  return db.select({ conversationId: conversations.id, updatedAt: conversations.updatedAt, memberId: users.id, memberName: users.name })
    .from(conversations)
    .innerJoin(conversationMembers, eq(conversations.id, conversationMembers.conversationId))
    .innerJoin(users, eq(conversationMembers.userId, users.id))
    .where(and(inArray(conversations.id, ids), ne(conversationMembers.userId, userId)))
    .orderBy(desc(conversations.updatedAt));
}

export async function createConversation(userId: number, recipientId: number) {
  const db = requireDb();
  const result = await db.insert(conversations).values({}).$returningId();
  const conversationId = result[0]!.id;
  await db.insert(conversationMembers).values([{ conversationId, userId }, { conversationId, userId: recipientId }]);
  return { id: conversationId };
}

export async function listMessages(userId: number, conversationId: number) {
  await assertConversationMember(userId, conversationId);
  const db = requireDb();
  return db.select({ id: messages.id, body: messages.body, createdAt: messages.createdAt, senderId: messages.senderId, senderName: users.name })
    .from(messages)
    .innerJoin(users, eq(messages.senderId, users.id))
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));
}

export async function sendMessage(userId: number, conversationId: number, body: string) {
  await assertConversationMember(userId, conversationId);
  const db = requireDb();
  const result = await db.insert(messages).values({ conversationId, senderId: userId, body }).$returningId();
  await db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, conversationId));
  return db.select().from(messages).where(eq(messages.id, result[0]!.id)).limit(1).then((rows) => rows[0]);
}
