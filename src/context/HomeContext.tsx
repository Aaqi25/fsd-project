import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Home,
  Room,
  Device,
  DeviceStatus,
  Alert,
  Schedule,
  EnergySummaryData,
  ActivityLog,
  DeviceAttributes,
} from '../types';
import { defaultHome } from '../data/homes';
import { mockActivityLogs } from '../data/activity';
import { deviceService } from '../services/deviceService';
import { roomService } from '../services/roomService';
import { alertService } from '../services/alertService';
import { scheduleService } from '../services/scheduleService';
import { energyService } from '../services/energyService';
import { socketService } from '../services/socketService';
import { useAuth } from './AuthContext';

interface HomeContextType {
  home: Home;
  rooms: Room[];
  devices: Device[];
  alerts: Alert[];
  schedules: Schedule[];
  energySummary: EnergySummaryData | null;
  activityLogs: ActivityLog[];
  loading: boolean;
  togglePending: Record<string, boolean>;
  feedbackMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  simulatorOpen: boolean;
  setSimulatorOpen: (open: boolean) => void;
  clearFeedback: () => void;

  // Actions
  toggleDevice: (deviceId: string) => Promise<boolean>;
  updateDeviceAttributes: (deviceId: string, attributes: Partial<DeviceAttributes>) => Promise<void>;
  addDevice: (deviceData: Omit<Device, '_id' | 'createdAt' | 'lastToggledAt'>) => Promise<Device>;
  deleteDevice: (deviceId: string) => Promise<void>;
  setDeviceOnlineStatus: (deviceId: string, isOnline: boolean) => Promise<void>;

  addRoom: (roomData: { name: string; type: any; floor: number; targetTemp?: number }) => Promise<Room>;
  updateRoom: (roomId: string, updates: any) => Promise<void>;
  deleteRoom: (roomId: string) => Promise<void>;

  acknowledgeAlert: (alertId: string) => Promise<void>;
  toggleSchedule: (scheduleId: string) => Promise<void>;
  createSchedule: (scheduleData: Omit<Schedule, '_id' | 'createdAt'>) => Promise<Schedule>;
  deleteSchedule: (scheduleId: string) => Promise<void>;

  refreshData: () => Promise<void>;
}

const HomeContext = createContext<HomeContextType | undefined>(undefined);

export const HomeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [home] = useState<Home>(defaultHome);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [energySummary, setEnergySummary] = useState<EnergySummaryData | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(mockActivityLogs);
  const [loading, setLoading] = useState<boolean>(true);
  const [togglePending, setTogglePending] = useState<Record<string, boolean>>({});
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [simulatorOpen, setSimulatorOpen] = useState<boolean>(false);

  const clearFeedback = () => setFeedbackMessage(null);

  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => {
        setFeedbackMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  const loadAll = useCallback(async () => {
    try {
      const [r, d, a, s, e] = await Promise.all([
        roomService.getAll(),
        deviceService.getAll(),
        alertService.getAll(),
        scheduleService.getAll(),
        energyService.getSummary(),
      ]);

      setRooms(r);
      setDevices(d);
      setAlerts(a);
      setSchedules(s);
      setEnergySummary(e);
    } catch (err) {
      console.error('Failed to load initial smart home state:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadAll();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, loadAll]);

  // Subscribe to real-time events via Socket.IO abstraction
  useEffect(() => {
    const unsubDeviceStatus = socketService.on('device_status_changed', (payload) => {
      setDevices((prev) =>
        prev.map((dev) =>
          dev._id === payload.deviceId
            ? {
                ...dev,
                status: payload.status,
                lastToggledAt: payload.timestamp || new Date().toISOString(),
              }
            : dev
        )
      );

      // Append real-time activity log
      setDevices((prev) => {
        const found = prev.find((d) => d._id === payload.deviceId);
        if (found) {
          const room = rooms.find((r) => r._id === found.roomId);
          setActivityLogs((currLogs) => [
            {
              _id: 'act_' + Date.now().toString(36),
              homeId: defaultHome._id,
              deviceId: found._id,
              deviceName: found.name,
              roomName: room ? room.name : 'Unknown Room',
              action: `Device turned ${payload.status === 'active' ? 'ON' : 'OFF'} via Socket event`,
              triggeredBy: 'Simulator',
              timestamp: new Date().toISOString(),
            },
            ...currLogs.slice(0, 19),
          ]);
        }
        return prev;
      });
    });

    const unsubDeviceOnline = socketService.on('device_connected', (payload) => {
      setDevices((prev) =>
        prev.map((dev) => (dev._id === payload.deviceId ? { ...dev, isOnline: true } : dev))
      );
    });

    const unsubDeviceOffline = socketService.on('device_disconnected', (payload) => {
      setDevices((prev) =>
        prev.map((dev) => (dev._id === payload.deviceId ? { ...dev, isOnline: false, status: 'inactive' } : dev))
      );
    });

    const unsubAlert = socketService.on('new_alert', (newAlert) => {
      setAlerts((prev) => [newAlert, ...prev]);
      setFeedbackMessage({
        text: `New Alert: ${newAlert.title}`,
        type: newAlert.severity === 'Critical' ? 'error' : 'info',
      });
    });

    const unsubEnergy = socketService.on('energy_updated', (payload) => {
      setEnergySummary((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          currentPowerWatts: payload.currentPowerWatts ?? prev.currentPowerWatts,
          todayKwh: +(prev.todayKwh + (payload.deltaKwh || 0)).toFixed(2),
        };
      });
    });

    return () => {
      unsubDeviceStatus();
      unsubDeviceOnline();
      unsubDeviceOffline();
      unsubAlert();
      unsubEnergy();
    };
  }, [rooms]);

  /**
   * Device Toggle with strict rollback on failure (Rule #11)
   */
  const toggleDevice = async (deviceId: string): Promise<boolean> => {
    const targetDev = devices.find((d) => d._id === deviceId);
    if (!targetDev) return false;

    const previousStatus = targetDev.status;
    const targetStatus: DeviceStatus = previousStatus === 'active' ? 'inactive' : 'active';

    // 1. Optimistic UI update
    setDevices((prev) =>
      prev.map((d) =>
        d._id === deviceId
          ? {
              ...d,
              status: targetStatus,
              lastToggledAt: new Date().toISOString(),
            }
          : d
      )
    );

    // 2. Show loading/processing state for this specific device
    setTogglePending((prev) => ({ ...prev, [deviceId]: true }));

    try {
      // 3. Call service layer
      const updated = await deviceService.toggleStatus(deviceId, targetStatus);

      // 4. Handle success
      setDevices((prev) => prev.map((d) => (d._id === deviceId ? updated : d)));

      // Add to activity log
      const room = rooms.find((r) => r._id === targetDev.roomId);
      setActivityLogs((prev) => [
        {
          _id: 'act_' + Date.now().toString(36),
          homeId: defaultHome._id,
          deviceId: targetDev._id,
          deviceName: targetDev.name,
          roomName: room ? room.name : 'Unknown Room',
          action: `Turned ${targetStatus === 'active' ? 'ON' : 'OFF'}`,
          triggeredBy: 'User',
          timestamp: new Date().toISOString(),
        },
        ...prev.slice(0, 19),
      ]);

      // Dynamically adjust current power watts on energy summary
      setEnergySummary((prev) => {
        if (!prev) return null;
        const delta = targetStatus === 'active' ? targetDev.powerWatts : -targetDev.powerWatts;
        return {
          ...prev,
          currentPowerWatts: Math.max(0, prev.currentPowerWatts + delta),
        };
      });

      return true;
    } catch (err: any) {
      // 5. Handle failure & 6. Revert UI if request fails
      console.error('Toggle failed, reverting UI state:', err);
      setDevices((prev) =>
        prev.map((d) => (d._id === deviceId ? { ...d, status: previousStatus } : d))
      );
      setFeedbackMessage({
        text: err.message || `Failed to switch ${targetDev.name}. State reverted.`,
        type: 'error',
      });
      return false;
    } finally {
      setTogglePending((prev) => {
        const next = { ...prev };
        delete next[deviceId];
        return next;
      });
    }
  };

  const updateDeviceAttributes = async (deviceId: string, attributes: Partial<DeviceAttributes>) => {
    try {
      const updated = await deviceService.updateAttributes(deviceId, attributes);
      setDevices((prev) => prev.map((d) => (d._id === deviceId ? updated : d)));
      setFeedbackMessage({ text: 'Device settings updated', type: 'success' });
    } catch (err: any) {
      setFeedbackMessage({ text: err.message || 'Failed to update device settings', type: 'error' });
    }
  };

  const setDeviceOnlineStatus = async (deviceId: string, isOnline: boolean) => {
    try {
      const updated = await deviceService.setOnlineStatus(deviceId, isOnline);
      setDevices((prev) => prev.map((d) => (d._id === deviceId ? updated : d)));
      socketService.triggerDeviceConnection(deviceId, isOnline);
    } catch (err: any) {
      setFeedbackMessage({ text: err.message || 'Failed to change connectivity', type: 'error' });
    }
  };

  const addDevice = async (deviceData: Omit<Device, '_id' | 'createdAt' | 'lastToggledAt'>) => {
    const created = await deviceService.create(deviceData);
    setDevices((prev) => [created, ...prev]);
    setFeedbackMessage({ text: `Device "${created.name}" added successfully`, type: 'success' });
    return created;
  };

  const deleteDevice = async (deviceId: string) => {
    await deviceService.delete(deviceId);
    setDevices((prev) => prev.filter((d) => d._id !== deviceId));
    setFeedbackMessage({ text: 'Device removed', type: 'info' });
  };

  const addRoom = async (roomData: { name: string; type: any; floor: number; targetTemp?: number }) => {
    const created = await roomService.create(roomData);
    setRooms((prev) => [...prev, created]);
    setFeedbackMessage({ text: `Room "${created.name}" created`, type: 'success' });
    return created;
  };

  const updateRoom = async (roomId: string, updates: any) => {
    const updated = await roomService.update(roomId, updates);
    setRooms((prev) => prev.map((r) => (r._id === roomId ? updated : r)));
    setFeedbackMessage({ text: 'Room updated', type: 'success' });
  };

  const deleteRoom = async (roomId: string) => {
    await roomService.delete(roomId);
    setRooms((prev) => prev.filter((r) => r._id !== roomId));
    setFeedbackMessage({ text: 'Room deleted', type: 'info' });
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const updated = await alertService.acknowledge(alertId);
      setAlerts((prev) => prev.map((a) => (a._id === alertId ? updated : a)));
      setFeedbackMessage({ text: 'Alert acknowledged', type: 'info' });
    } catch (err: any) {
      setFeedbackMessage({ text: 'Failed to acknowledge alert', type: 'error' });
    }
  };

  const toggleSchedule = async (scheduleId: string) => {
    const target = schedules.find((s) => s._id === scheduleId);
    if (!target) return;
    const nextState = !target.isActive;

    try {
      const updated = await scheduleService.toggleActive(scheduleId, nextState);
      setSchedules((prev) => prev.map((s) => (s._id === scheduleId ? updated : s)));
    } catch (err: any) {
      setFeedbackMessage({ text: 'Failed to update schedule status', type: 'error' });
    }
  };

  const createSchedule = async (scheduleData: Omit<Schedule, '_id' | 'createdAt'>) => {
    const created = await scheduleService.create(scheduleData);
    setSchedules((prev) => [created, ...prev]);
    setFeedbackMessage({ text: `Schedule "${created.name}" configured`, type: 'success' });
    return created;
  };

  const deleteSchedule = async (scheduleId: string) => {
    await scheduleService.delete(scheduleId);
    setSchedules((prev) => prev.filter((s) => s._id !== scheduleId));
    setFeedbackMessage({ text: 'Schedule deleted', type: 'info' });
  };

  return (
    <HomeContext.Provider
      value={{
        home,
        rooms,
        devices,
        alerts,
        schedules,
        energySummary,
        activityLogs,
        loading,
        togglePending,
        feedbackMessage,
        simulatorOpen,
        setSimulatorOpen,
        clearFeedback,
        toggleDevice,
        updateDeviceAttributes,
        addDevice,
        deleteDevice,
        setDeviceOnlineStatus,
        addRoom,
        updateRoom,
        deleteRoom,
        acknowledgeAlert,
        toggleSchedule,
        createSchedule,
        deleteSchedule,
        refreshData: loadAll,
      }}
    >
      {children}
    </HomeContext.Provider>
  );
};

export function useHome() {
  const context = useContext(HomeContext);
  if (!context) {
    throw new Error('useHome must be used within a HomeProvider');
  }
  return context;
}
