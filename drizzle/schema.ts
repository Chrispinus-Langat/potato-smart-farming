import {
  boolean,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const farms = mysqlTable(
  "farms",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    location: varchar("location", { length: 160 }),
    acreage: varchar("acreage", { length: 32 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({ ownerIdx: index("farms_owner_idx").on(table.ownerId) }),
);

export const fields = mysqlTable(
  "fields",
  {
    id: int("id").autoincrement().primaryKey(),
    farmId: int("farmId").notNull().references(() => farms.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    variety: varchar("variety", { length: 80 }),
    acreage: varchar("acreage", { length: 32 }),
    plantedAt: timestamp("plantedAt"),
    healthScore: int("healthScore").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({ farmIdx: index("fields_farm_idx").on(table.farmId) }),
);

export const farmTasks = mysqlTable(
  "farm_tasks",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
    farmId: int("farmId").references(() => farms.id, { onDelete: "set null" }),
    title: varchar("title", { length: 160 }).notNull(),
    description: text("description"),
    dueAt: timestamp("dueAt"),
    completed: boolean("completed").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({ ownerDueIdx: index("farm_tasks_owner_due_idx").on(table.ownerId, table.dueAt) }),
);

export const diagnoses = mysqlTable(
  "diagnoses",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
    farmId: int("farmId").references(() => farms.id, { onDelete: "set null" }),
    fieldId: int("fieldId").references(() => fields.id, { onDelete: "set null" }),
    imageUrl: text("imageUrl"),
    imageKey: varchar("imageKey", { length: 512 }),
    diseaseName: varchar("diseaseName", { length: 160 }).notNull(),
    diseaseNameSwahili: varchar("diseaseNameSwahili", { length: 160 }),
    confidence: int("confidence").default(0).notNull(),
    symptoms: text("symptoms"),
    organicTreatment: text("organicTreatment"),
    chemicalTreatment: text("chemicalTreatment"),
    estimatedCost: varchar("estimatedCost", { length: 32 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({ ownerCreatedIdx: index("diagnoses_owner_created_idx").on(table.ownerId, table.createdAt) }),
);

export const communityPosts = mysqlTable(
  "community_posts",
  {
    id: int("id").autoincrement().primaryKey(),
    authorId: int("authorId").notNull().references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    imageUrl: text("imageUrl"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({ createdIdx: index("community_posts_created_idx").on(table.createdAt) }),
);

export const communityLikes = mysqlTable(
  "community_likes",
  {
    postId: int("postId").notNull().references(() => communityPosts.id, { onDelete: "cascade" }),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.postId, table.userId] }),
    userPostIdx: uniqueIndex("community_likes_user_post_idx").on(table.userId, table.postId),
    postIdx: index("community_likes_post_idx").on(table.postId),
  }),
);

export const communityComments = mysqlTable(
  "community_comments",
  {
    id: int("id").autoincrement().primaryKey(),
    postId: int("postId").notNull().references(() => communityPosts.id, { onDelete: "cascade" }),
    authorId: int("authorId").notNull().references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({ postCreatedIdx: index("community_comments_post_created_idx").on(table.postId, table.createdAt) }),
);

export const farmerFollows = mysqlTable(
  "farmer_follows",
  {
    followerId: int("followerId").notNull().references(() => users.id, { onDelete: "cascade" }),
    followingId: int("followingId").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.followerId, table.followingId] }),
    followerFollowingIdx: uniqueIndex("farmer_follows_pair_idx").on(table.followerId, table.followingId),
  }),
);

export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const conversationMembers = mysqlTable(
  "conversation_members",
  {
    conversationId: int("conversationId").notNull().references(() => conversations.id, { onDelete: "cascade" }),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.conversationId, table.userId] }),
    userConversationIdx: index("conversation_members_user_idx").on(table.userId),
  }),
);

export const messages = mysqlTable(
  "messages",
  {
    id: int("id").autoincrement().primaryKey(),
    conversationId: int("conversationId").notNull().references(() => conversations.id, { onDelete: "cascade" }),
    senderId: int("senderId").notNull().references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    readAt: timestamp("readAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({ conversationCreatedIdx: index("messages_conversation_created_idx").on(table.conversationId, table.createdAt) }),
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Farm = typeof farms.$inferSelect;
export type InsertFarm = typeof farms.$inferInsert;
export type Field = typeof fields.$inferSelect;
export type Diagnosis = typeof diagnoses.$inferSelect;
export type CommunityPost = typeof communityPosts.$inferSelect;
export type Message = typeof messages.$inferSelect;
