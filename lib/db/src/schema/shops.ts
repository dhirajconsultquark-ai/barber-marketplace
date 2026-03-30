import { pgTable, serial, text, timestamp, integer, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const shopStatusEnum = pgEnum("shop_status", ["pending", "approved", "rejected"]);

export const shopsTable = pgTable("shops", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  phone: text("phone").notNull(),
  imageUrl: text("image_url"),
  status: shopStatusEnum("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  averageRating: real("average_rating"),
  reviewCount: integer("review_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertShopSchema = createInsertSchema(shopsTable).omit({ id: true, createdAt: true, averageRating: true, reviewCount: true });
export type InsertShop = z.infer<typeof insertShopSchema>;
export type Shop = typeof shopsTable.$inferSelect;
