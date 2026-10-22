export type DeviceType = 'light' | 'fan' | 'ac' | 'smart_plug' | 'sensor' | 'heater' | 'camera';
export type DeviceStatus = 'active' | 'inactive';
export type RoomType = 'living_room' | 'bedroom' | 'kitchen' | 'hall' | 'office' | 'bathroom' | 'balcony' | 'other';
export type AlertSeverity = 'Low' | 'High' | 'Critical';
export type AlertCategory = 'energy' | 'device' | 'security' | 'system';
export type ScheduleRepeat = 'once' | 'daily' | 'weekdays' | 'weekends' | 'custom';
export type ScheduleAction = 'TURN_ON' | 'TURN_OFF' | 'SET_TEMPERATURE' | 'SET_BRIGHTNESS';

export interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  role: 'owner' | 'resident' | 'guest';
  avatarUrl?: string;
  createdAt: string;
}

export interface Home {
  _id: string;
  name: string;
  address: string;
  ownerId: string;
  timezone: string;
  energyBudgetKwhPerMonth: number;
  costPerKwh: number;
  createdAt: string;
}

export interface Room {
  _id: string;
  homeId: string;
  name: string;
  type: RoomType;
  floor: number;
  targetTemp?: number;
  createdAt: string;
}

export interface DeviceAttributes {
  brightness?: number; // 0 - 100 %
  targetTemperature?: number; // degrees Celsius
  fanSpeed?: number; // 1 - 5
  colorTemperature?: number; // 2700K - 6500K
  motionDetected?: boolean;
  batteryLevel?: number; // 0 - 100 %
  currentTemperature?: number; // sensor reading
  currentHumidity?: number; // sensor reading
}

export interface Device {
  _id: string;
  homeId: string;
  roomId: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus; // 'active' (ON) or 'inactive' (OFF)
  isOnline: boolean;
  powerWatts: number; // nominal or live wattage when active
  currentUsageKwh: number; // accumulated today
  ipAddress: string;
  firmware: string;
  model: string;
  attributes: DeviceAttributes;
  lastToggledAt: string;
  createdAt: string;
}

export interface Schedule {
  _id: string;
  homeId: string;
  deviceId: string;
  name: string;
  action: ScheduleAction;
  value?: number | string;
  time: string; // HH:mm format, e.g. "18:30"
  repeatType: ScheduleRepeat;
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
  isActive: boolean;
  createdAt: string;
}

export interface EnergyDataPoint {
  timestamp: string;
  label: string;
  kwh: number;
  cost: number;
  peakKwh?: number;
}

export interface DeviceEnergyBreakdown {
  deviceId: string;
  deviceName: string;
  deviceType: DeviceType;
  roomName: string;
  todayKwh: number;
  monthlyKwh: number;
  cost: number;
  percentage: number;
  isHighConsumer: boolean;
}

export interface EnergySummaryData {
  currentPowerWatts: number;
  todayKwh: number;
  yesterdayKwh: number;
  weekKwh: number;
  monthKwh: number;
  monthlyBudgetKwh: number;
  estimatedMonthlyCost: number;
  hourlyToday: EnergyDataPoint[];
  dailyLast7Days: EnergyDataPoint[];
  monthlyTrend: EnergyDataPoint[];
  deviceBreakdown: DeviceEnergyBreakdown[];
}

export interface Alert {
  _id: string;
  homeId: string;
  deviceId?: string;
  deviceName?: string;
  roomName?: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: string;
  isAcknowledged: boolean;
  actionRequired?: string;
}

export interface EnergyRecommendation {
  _id: string;
  deviceId?: string;
  deviceName?: string;
  roomName?: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  estimatedSavingsKwhMonth: number;
  estimatedSavingsCostMonth: number;
  suggestedAction: string;
  actionType: 'create_schedule' | 'adjust_temperature' | 'turn_off_now' | 'view_device';
}

export interface ActivityLog {
  _id: string;
  homeId: string;
  deviceId?: string;
  deviceName: string;
  roomName: string;
  action: string;
  triggeredBy: 'User' | 'Schedule' | 'Automation' | 'Sensor' | 'Simulator';
  timestamp: string;
  dotColor?: string;
}
