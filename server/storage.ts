import { devices, bandwidthMetrics, systemMetrics, type Device, type InsertDevice, type BandwidthMetric, type InsertBandwidthMetric, type SystemMetric, type InsertSystemMetric } from "@shared/schema";

export interface IStorage {
  // Device operations
  getDevices(): Promise<Device[]>;
  getDevice(id: number): Promise<Device | undefined>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDevice(id: number, device: Partial<InsertDevice>): Promise<Device | undefined>;
  deleteDevice(id: number): Promise<boolean>;
  
  // Bandwidth metrics operations
  getBandwidthMetrics(deviceId?: number, limit?: number): Promise<BandwidthMetric[]>;
  createBandwidthMetric(metric: InsertBandwidthMetric): Promise<BandwidthMetric>;
  
  // System metrics operations
  getLatestSystemMetrics(): Promise<SystemMetric | undefined>;
  createSystemMetric(metric: InsertSystemMetric): Promise<SystemMetric>;
  getSystemMetricsHistory(limit?: number): Promise<SystemMetric[]>;
}

export class MemStorage implements IStorage {
  private devices: Map<number, Device>;
  private bandwidthMetrics: Map<number, BandwidthMetric>;
  private systemMetrics: Map<number, SystemMetric>;
  private currentDeviceId: number;
  private currentBandwidthMetricId: number;
  private currentSystemMetricId: number;

  constructor() {
    this.devices = new Map();
    this.bandwidthMetrics = new Map();
    this.systemMetrics = new Map();
    this.currentDeviceId = 1;
    this.currentBandwidthMetricId = 1;
    this.currentSystemMetricId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample devices
    const sampleDevices: InsertDevice[] = [
      {
        name: "Core Router R1",
        type: "router",
        ipAddress: "192.168.1.1",
        status: "online",
        bandwidth: 450,
        maxBandwidth: 1000,
        model: "Cisco ASR 1000",
        location: "Data Center A",
      },
      {
        name: "Switch SW-01",
        type: "switch",
        ipAddress: "192.168.1.10",
        status: "online",
        bandwidth: 320,
        maxBandwidth: 600,
        model: "HP ProCurve 2920",
        location: "Floor 1",
      },
      {
        name: "Access Point AP-01",
        type: "access_point",
        ipAddress: "192.168.1.20",
        status: "warning",
        bandwidth: 890,
        maxBandwidth: 1000,
        model: "Ubiquiti UniFi",
        location: "Floor 2",
      },
      {
        name: "Firewall FW-01",
        type: "firewall",
        ipAddress: "192.168.1.5",
        status: "offline",
        bandwidth: 0,
        maxBandwidth: 500,
        model: "Fortinet FortiGate",
        location: "DMZ",
      },
    ];

    sampleDevices.forEach(device => {
      const id = this.currentDeviceId++;
      const fullDevice: Device = {
        ...device,
        id,
        lastActivity: new Date(),
      };
      this.devices.set(id, fullDevice);
    });

    // Create initial system metrics
    const initialMetrics: InsertSystemMetric = {
      activeDevices: 127,
      totalBandwidth: 2.4,
      warnings: 3,
      uptime: 99.9,
    };
    
    const systemMetric: SystemMetric = {
      ...initialMetrics,
      id: this.currentSystemMetricId++,
      timestamp: new Date(),
    };
    this.systemMetrics.set(systemMetric.id, systemMetric);
  }

  async getDevices(): Promise<Device[]> {
    return Array.from(this.devices.values());
  }

  async getDevice(id: number): Promise<Device | undefined> {
    return this.devices.get(id);
  }

  async createDevice(insertDevice: InsertDevice): Promise<Device> {
    const id = this.currentDeviceId++;
    const device: Device = {
      ...insertDevice,
      id,
      lastActivity: new Date(),
    };
    this.devices.set(id, device);
    return device;
  }

  async updateDevice(id: number, updates: Partial<InsertDevice>): Promise<Device | undefined> {
    const device = this.devices.get(id);
    if (!device) return undefined;

    const updatedDevice: Device = {
      ...device,
      ...updates,
      lastActivity: new Date(),
    };
    this.devices.set(id, updatedDevice);
    return updatedDevice;
  }

  async deleteDevice(id: number): Promise<boolean> {
    return this.devices.delete(id);
  }

  async getBandwidthMetrics(deviceId?: number, limit: number = 50): Promise<BandwidthMetric[]> {
    let metrics = Array.from(this.bandwidthMetrics.values());
    
    if (deviceId) {
      metrics = metrics.filter(m => m.deviceId === deviceId);
    }
    
    return metrics
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async createBandwidthMetric(insertMetric: InsertBandwidthMetric): Promise<BandwidthMetric> {
    const id = this.currentBandwidthMetricId++;
    const metric: BandwidthMetric = {
      ...insertMetric,
      id,
      timestamp: new Date(),
    };
    this.bandwidthMetrics.set(id, metric);
    return metric;
  }

  async getLatestSystemMetrics(): Promise<SystemMetric | undefined> {
    const metrics = Array.from(this.systemMetrics.values());
    return metrics.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
  }

  async createSystemMetric(insertMetric: InsertSystemMetric): Promise<SystemMetric> {
    const id = this.currentSystemMetricId++;
    const metric: SystemMetric = {
      ...insertMetric,
      id,
      timestamp: new Date(),
    };
    this.systemMetrics.set(id, metric);
    return metric;
  }

  async getSystemMetricsHistory(limit: number = 24): Promise<SystemMetric[]> {
    return Array.from(this.systemMetrics.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
