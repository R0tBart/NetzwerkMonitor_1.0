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

export const securityEvents = pgTable("security_events", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  eventType: text("event_type").notNull(), // intrusion_attempt, malware_detected, unusual_traffic, port_scan, brute_force
  severity: text("severity").notNull(), // low, medium, high, critical
  sourceIp: text("source_ip").notNull(),
  targetIp: text("target_ip"),
  description: text("description").notNull(),
  status: text("status").notNull().default("new"), // new, investigating, resolved, false_positive
  deviceId: integer("device_id").references(() => devices.id),
});

export const idsRules = pgTable("ids_rules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  pattern: text("pattern").notNull(), // regex or signature pattern
  severity: text("severity").notNull(), // low, medium, high, critical
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Password Manager Tables
export const passwordVaults = pgTable("password_vaults", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const passwordEntries = pgTable("password_entries", {
  id: serial("id").primaryKey(),
  vaultId: integer("vault_id").references(() => passwordVaults.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  username: text("username"),
  email: text("email"),
  encryptedPassword: text("encrypted_password").notNull(),
  website: text("website"),
  notes: text("notes"),
  category: text("category"),
  isFavorite: boolean("is_favorite").notNull().default(false),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
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

export const insertSecurityEventSchema = createInsertSchema(securityEvents).pick({
  eventType: true,
  severity: true,
  sourceIp: true,
  targetIp: true,
  description: true,
  status: true,
  deviceId: true,
});

export const insertIdsRuleSchema = createInsertSchema(idsRules).pick({
  name: true,
  description: true,
  pattern: true,
  severity: true,
  enabled: true,
});

export const insertPasswordVaultSchema = createInsertSchema(passwordVaults).pick({
  name: true,
  description: true,
});

export const insertPasswordEntrySchema = createInsertSchema(passwordEntries).pick({
  vaultId: true,
  title: true,
  username: true,
  email: true,
  encryptedPassword: true,
  website: true,
  notes: true,
  category: true,
  isFavorite: true,
});

export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Device = typeof devices.$inferSelect;
export type InsertBandwidthMetric = z.infer<typeof insertBandwidthMetricSchema>;
export type BandwidthMetric = typeof bandwidthMetrics.$inferSelect;
export type InsertSystemMetric = z.infer<typeof insertSystemMetricSchema>;
export type SystemMetric = typeof systemMetrics.$inferSelect;
export type InsertSecurityEvent = z.infer<typeof insertSecurityEventSchema>;
export type SecurityEvent = typeof securityEvents.$inferSelect;
export type InsertIdsRule = z.infer<typeof insertIdsRuleSchema>;
export type IdsRule = typeof idsRules.$inferSelect;
export type InsertPasswordVault = z.infer<typeof insertPasswordVaultSchema>;
export type PasswordVault = typeof passwordVaults.$inferSelect;
export type InsertPasswordEntry = z.infer<typeof insertPasswordEntrySchema>;
export type PasswordEntry = typeof passwordEntries.$inferSelect;
