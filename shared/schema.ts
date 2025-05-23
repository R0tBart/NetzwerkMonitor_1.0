import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // router, switch, access_point, firewall
  ipAddress: text("ip_address").notNull().unique(),
  status: text("status").notNull().default("online"), // online, warning, offline, maintenance
  bandwidth: real("bandwidth").notNull().default(0), // in MB/s
  maxBandwidth: real("max_bandwidth").notNull().default(1000),
  lastActivity: timestamp("last_activity").notNull().defaultNow(),
  model: text("model"),
  location: text("location"),
});

export const bandwidthMetrics = pgTable("bandwidth_metrics", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").references(() => devices.id),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  incoming: real("incoming").notNull(), // GB/s
  outgoing: real("outgoing").notNull(), // GB/s
});

export const systemMetrics = pgTable("system_metrics", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  activeDevices: integer("active_devices").notNull(),
  totalBandwidth: real("total_bandwidth").notNull(),
  warnings: integer("warnings").notNull(),
  uptime: real("uptime").notNull(), // percentage
});

export const insertDeviceSchema = createInsertSchema(devices).pick({
  name: true,
  type: true,
  ipAddress: true,
  status: true,
  bandwidth: true,
  maxBandwidth: true,
  model: true,
  location: true,
});

export const insertBandwidthMetricSchema = createInsertSchema(bandwidthMetrics).pick({
  deviceId: true,
  incoming: true,
  outgoing: true,
});

export const insertSystemMetricSchema = createInsertSchema(systemMetrics).pick({
  activeDevices: true,
  totalBandwidth: true,
  warnings: true,
  uptime: true,
});

export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Device = typeof devices.$inferSelect;
export type InsertBandwidthMetric = z.infer<typeof insertBandwidthMetricSchema>;
export type BandwidthMetric = typeof bandwidthMetrics.$inferSelect;
export type InsertSystemMetric = z.infer<typeof insertSystemMetricSchema>;
export type SystemMetric = typeof systemMetrics.$inferSelect;
