import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const dataPoints = pgTable("data_points", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  value: integer("value").notNull(),
});

export const insertDataPointSchema = createInsertSchema(dataPoints).pick({
  label: true,
  value: true,
});

export type DataPoint = typeof dataPoints.$inferSelect;
export type InsertDataPoint = z.infer<typeof insertDataPointSchema>;
