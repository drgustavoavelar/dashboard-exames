import { dataPoints, type InsertDataPoint, type DataPoint } from "@shared/schema";
import { db } from "./db";

export interface IStorage {
  getDataPoints(): Promise<DataPoint[]>;
  createDataPoint(point: InsertDataPoint): Promise<DataPoint>;
}

export class DatabaseStorage implements IStorage {
  async getDataPoints(): Promise<DataPoint[]> {
    return await db.select().from(dataPoints);
  }

  async createDataPoint(insertPoint: InsertDataPoint): Promise<DataPoint> {
    const [point] = await db.insert(dataPoints).values(insertPoint).returning();
    return point;
  }
}

export const storage = new DatabaseStorage();
