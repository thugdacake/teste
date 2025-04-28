import { pgTable, text, serial, integer, timestamp, boolean, json, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  discordId: text("discord_id").unique(),
  discordUsername: text("discord_username"),
  avatar: text("avatar"),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  coverImage: text("cover_image").notNull(),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  authorId: integer("author_id").references(() => users.id),
  categoryId: integer("category_id").references(() => newsCategories.id),
  published: boolean("published").default(true).notNull(),
});

export const insertNewsSchema = createInsertSchema(news).omit({
  id: true,
});

export const newsCategories = pgTable("news_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  color: text("color").notNull().default("#00E5FF"),
});

export const insertNewsCategorySchema = createInsertSchema(newsCategories).omit({
  id: true,
});

export const staffApplications = pgTable("staff_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  age: integer("age").notNull(),
  timezone: text("timezone").notNull(),
  languages: text("languages").notNull(),
  availability: integer("availability").notNull(),
  rpExperience: text("rp_experience").notNull(),
  moderationExperience: text("moderation_experience").notNull(),
  serverFamiliarity: text("server_familiarity").notNull(),
  whyJoin: text("why_join").notNull(),
  scenario: text("scenario").notNull(),
  contribution: text("contribution").notNull(),
  additionalInfo: text("additional_info"),
  status: text("status").default("pending").notNull(),
  adminNotes: text("admin_notes"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertStaffApplicationSchema = createInsertSchema(staffApplications).omit({
  id: true,
  status: true,
  adminNotes: true,
  reviewedBy: true,
  createdAt: true,
  updatedAt: true,
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 50 }).notNull().unique(),
  value: text("value").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
});

export const staffMembers = pgTable("staff_members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  role: text("role").notNull(),
  position: text("position").notNull(),
  avatar: text("avatar"),
  bio: text("bio"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  displayOrder: integer("display_order").default(999),
  isActive: boolean("is_active").default(true),
  socialLinks: json("social_links").$type<{
    discord?: string;
    twitter?: string;
    instagram?: string;
    twitch?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertStaffMemberSchema = createInsertSchema(staffMembers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;

export type NewsCategory = typeof newsCategories.$inferSelect;
export type InsertNewsCategory = z.infer<typeof insertNewsCategorySchema>;

export type StaffApplication = typeof staffApplications.$inferSelect;
export type InsertStaffApplication = z.infer<typeof insertStaffApplicationSchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;

export type StaffMember = typeof staffMembers.$inferSelect;
export type InsertStaffMember = z.infer<typeof insertStaffMemberSchema>;
