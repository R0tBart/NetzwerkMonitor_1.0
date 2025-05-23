import { devices, bandwidthMetrics, systemMetrics, securityEvents, idsRules, type Device, type InsertDevice, type BandwidthMetric, type InsertBandwidthMetric, type SystemMetric, type InsertSystemMetric, type SecurityEvent, type InsertSecurityEvent, type IdsRule, type InsertIdsRule } from "@shared/schema";

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
  
  // Security events operations (IDS)
  getSecurityEvents(limit?: number): Promise<SecurityEvent[]>;
  getSecurityEventsByStatus(status: string, limit?: number): Promise<SecurityEvent[]>;
  createSecurityEvent(event: InsertSecurityEvent): Promise<SecurityEvent>;
  updateSecurityEvent(id: number, event: Partial<InsertSecurityEvent>): Promise<SecurityEvent | undefined>;
  deleteSecurityEvent(id: number): Promise<boolean>;
  
  // IDS rules operations
  getIdsRules(): Promise<IdsRule[]>;
  getIdsRule(id: number): Promise<IdsRule | undefined>;
  createIdsRule(rule: InsertIdsRule): Promise<IdsRule>;
  updateIdsRule(id: number, rule: Partial<InsertIdsRule>): Promise<IdsRule | undefined>;
  deleteIdsRule(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private devices: Map<number, Device>;
  private bandwidthMetrics: Map<number, BandwidthMetric>;
  private systemMetrics: Map<number, SystemMetric>;
  private securityEvents: Map<number, SecurityEvent>;
  private idsRules: Map<number, IdsRule>;
  private currentDeviceId: number;
  private currentBandwidthMetricId: number;
  private currentSystemMetricId: number;
  private currentSecurityEventId: number;
  private currentIdsRuleId: number;

  constructor() {
    this.devices = new Map();
    this.bandwidthMetrics = new Map();
    this.systemMetrics = new Map();
    this.securityEvents = new Map();
    this.idsRules = new Map();
    this.currentDeviceId = 1;
    this.currentBandwidthMetricId = 1;
    this.currentSystemMetricId = 1;
    this.currentSecurityEventId = 1;
    this.currentIdsRuleId = 1;
    
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

    // Initialize sample IDS rules
    const sampleIdsRules: InsertIdsRule[] = [
      {
        name: "SSH Brute Force Detection",
        description: "Erkennt wiederholte SSH-Anmeldeversuche von derselben IP",
        pattern: "^.*sshd.*Failed password.*from\\s+(\\d+\\.\\d+\\.\\d+\\.\\d+)",
        severity: "high",
        enabled: true,
      },
      {
        name: "Port Scan Detection",
        description: "Erkennt verdächtige Port-Scanning-Aktivitäten",
        pattern: "TCP.*SYN.*multiple_ports",
        severity: "medium",
        enabled: true,
      },
      {
        name: "Malware Communication",
        description: "Erkennt bekannte Malware-Kommunikationsmuster",
        pattern: ".*\\.exe.*suspicious_domain\\.com",
        severity: "critical",
        enabled: true,
      },
      {
        name: "Unusual Traffic Volume",
        description: "Erkennt ungewöhnlich hohe Datenübertragung",
        pattern: "bandwidth_threshold_exceeded",
        severity: "medium",
        enabled: true,
      },
    ];

    sampleIdsRules.forEach(rule => {
      const id = this.currentIdsRuleId++;
      const fullRule: IdsRule = {
        ...rule,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.idsRules.set(id, fullRule);
    });

    // Initialize sample security events
    const sampleSecurityEvents: InsertSecurityEvent[] = [
      {
        eventType: "brute_force",
        severity: "high",
        sourceIp: "45.123.45.67",
        targetIp: "192.168.1.1",
        description: "Mehrfache fehlgeschlagene SSH-Anmeldeversuche erkannt",
        status: "new",
        deviceId: 1,
      },
      {
        eventType: "port_scan",
        severity: "medium",
        sourceIp: "178.62.199.34",
        targetIp: "192.168.1.10",
        description: "Port-Scan-Aktivität von externer IP erkannt",
        status: "investigating",
        deviceId: 2,
      },
      {
        eventType: "unusual_traffic",
        severity: "medium",
        sourceIp: "192.168.1.20",
        targetIp: "203.0.113.5",
        description: "Ungewöhnlich hoher ausgehender Datenverkehr",
        status: "new",
        deviceId: 3,
      },
      {
        eventType: "intrusion_attempt",
        severity: "critical",
        sourceIp: "198.51.100.23",
        targetIp: "192.168.1.5",
        description: "Verdächtiger Einbruchsversuch in Firewall erkannt",
        status: "resolved",
        deviceId: 4,
      },
    ];

    sampleSecurityEvents.forEach(event => {
      const id = this.currentSecurityEventId++;
      const fullEvent: SecurityEvent = {
        ...event,
        id,
        timestamp: new Date(Date.now() - Math.random() * 86400000), // Random time within last 24h
      };
      this.securityEvents.set(id, fullEvent);
    });
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

  // Security events operations (IDS)
  async getSecurityEvents(limit: number = 50): Promise<SecurityEvent[]> {
    return Array.from(this.securityEvents.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getSecurityEventsByStatus(status: string, limit: number = 50): Promise<SecurityEvent[]> {
    return Array.from(this.securityEvents.values())
      .filter(event => event.status === status)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async createSecurityEvent(insertEvent: InsertSecurityEvent): Promise<SecurityEvent> {
    const id = this.currentSecurityEventId++;
    const event: SecurityEvent = {
      ...insertEvent,
      id,
      timestamp: new Date(),
    };
    this.securityEvents.set(id, event);
    return event;
  }

  async updateSecurityEvent(id: number, updates: Partial<InsertSecurityEvent>): Promise<SecurityEvent | undefined> {
    const event = this.securityEvents.get(id);
    if (!event) return undefined;

    const updatedEvent: SecurityEvent = {
      ...event,
      ...updates,
    };
    this.securityEvents.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteSecurityEvent(id: number): Promise<boolean> {
    return this.securityEvents.delete(id);
  }

  // IDS rules operations
  async getIdsRules(): Promise<IdsRule[]> {
    return Array.from(this.idsRules.values());
  }

  async getIdsRule(id: number): Promise<IdsRule | undefined> {
    return this.idsRules.get(id);
  }

  async createIdsRule(insertRule: InsertIdsRule): Promise<IdsRule> {
    const id = this.currentIdsRuleId++;
    const rule: IdsRule = {
      ...insertRule,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.idsRules.set(id, rule);
    return rule;
  }

  async updateIdsRule(id: number, updates: Partial<InsertIdsRule>): Promise<IdsRule | undefined> {
    const rule = this.idsRules.get(id);
    if (!rule) return undefined;

    const updatedRule: IdsRule = {
      ...rule,
      ...updates,
      updatedAt: new Date(),
    };
    this.idsRules.set(id, updatedRule);
    return updatedRule;
  }

  async deleteIdsRule(id: number): Promise<boolean> {
    return this.idsRules.delete(id);
  }
}

export const storage = new MemStorage();
