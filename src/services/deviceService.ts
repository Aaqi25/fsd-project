import { Device, DeviceStatus, DeviceAttributes } from '../types';
import { mockDevices } from '../data/devices';
import { api } from './api';

const STORAGE_KEY = 'smarthome_devices_state_v3';

// In-memory / persistent mock repository for interactive demonstration
function loadLocalDevices(): Device[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading local devices:', e);
  }
  return [...mockDevices];
}

function saveLocalDevices(devices: Device[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
  } catch (e) {
    console.warn('Error saving local devices:', e);
  }
}

export const deviceService = {
  async getAll(): Promise<Device[]> {
    const hasBackend = !!import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('smarthome_token');
    if (hasBackend && token) {
      try {
        const res = await api.get<Device[]>('/devices');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) return res.data;
      } catch (err) {
        console.warn('Backend /devices failed, using local mock state:', err);
      }
    }
    return loadLocalDevices();
  },

  async getById(deviceId: string): Promise<Device | null> {
    const devices = await this.getAll();
    return devices.find((d) => d._id === deviceId) || null;
  },

  async toggleStatus(deviceId: string, targetStatus: DeviceStatus): Promise<Device> {
    // Artificial latency for realistic async feedback & loading indicator
    await new Promise((resolve) => setTimeout(resolve, 350));

    const hasBackend = !!import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('smarthome_token');
    if (hasBackend && token) {
      const res = await api.patch<Device>(`/devices/${deviceId}/toggle`, { status: targetStatus });
      if (res.data) {
        // Synchronize local cache with persisted MongoDB device
        const devices = loadLocalDevices();
        const idx = devices.findIndex((d) => d._id === deviceId);
        if (idx !== -1) {
          devices[idx] = res.data;
          saveLocalDevices(devices);
        }
        return res.data;
      }
      throw new Error(res.message || 'Failed to toggle device on backend server');
    }

    const devices = loadLocalDevices();
    const index = devices.findIndex((d) => d._id === deviceId);
    if (index === -1) {
      throw new Error(`Device not found: ${deviceId}`);
    }

    const updated: Device = {
      ...devices[index],
      status: targetStatus,
      lastToggledAt: new Date().toISOString(),
    };

    devices[index] = updated;
    saveLocalDevices(devices);
    return updated;
  },

  async updateAttributes(deviceId: string, attributes: Partial<DeviceAttributes>): Promise<Device> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const devices = loadLocalDevices();
    const index = devices.findIndex((d) => d._id === deviceId);
    if (index === -1) throw new Error('Device not found');

    const updated: Device = {
      ...devices[index],
      attributes: {
        ...devices[index].attributes,
        ...attributes,
      },
    };

    devices[index] = updated;
    saveLocalDevices(devices);
    return updated;
  },

  async setOnlineStatus(deviceId: string, isOnline: boolean): Promise<Device> {
    const devices = loadLocalDevices();
    const index = devices.findIndex((d) => d._id === deviceId);
    if (index === -1) throw new Error('Device not found');

    const updated: Device = {
      ...devices[index],
      isOnline,
      status: isOnline ? devices[index].status : 'inactive',
    };

    devices[index] = updated;
    saveLocalDevices(devices);
    return updated;
  },

  async create(deviceData: Omit<Device, '_id' | 'createdAt' | 'lastToggledAt'>): Promise<Device> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const newDevice: Device = {
      ...deviceData,
      _id: 'dev_' + Date.now().toString(36),
      lastToggledAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const devices = loadLocalDevices();
    devices.unshift(newDevice);
    saveLocalDevices(devices);
    return newDevice;
  },

  async delete(deviceId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const devices = loadLocalDevices().filter((d) => d._id !== deviceId);
    saveLocalDevices(devices);
  },

  resetMockState(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
