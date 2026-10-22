import { ActivityLog } from '../types';

export const mockActivityLogs: (ActivityLog & { dotColor?: string })[] = [
  {
    _id: 'act_001',
    homeId: 'home_001',
    deviceName: 'Routine',
    roomName: 'System',
    action: "Routine: 'Night Sleep' triggered",
    triggeredBy: 'Automation',
    timestamp: '22:15',
    dotColor: '#3b82f6', // blue
  },
  {
    _id: 'act_002',
    homeId: 'home_001',
    deviceName: 'Inverter Split AC',
    roomName: 'Master Bedroom',
    action: 'AC Target adjusted to 24°C',
    triggeredBy: 'User',
    timestamp: '22:04',
    dotColor: '#10b981', // green
  },
  {
    _id: 'act_003',
    homeId: 'home_001',
    deviceName: 'Electrical Meter',
    roomName: 'Main Line',
    action: 'Power spike: 3.4 kW (Simulator)',
    triggeredBy: 'Simulator',
    timestamp: '21:40',
    dotColor: '#f59e0b', // amber
  },
  {
    _id: 'act_004',
    homeId: 'home_001',
    deviceName: 'Living Room Main Light',
    roomName: 'Living Room',
    action: 'Living Room Main Light ON (100%)',
    triggeredBy: 'User',
    timestamp: '21:15',
    dotColor: '#3b82f6', // blue
  },
  {
    _id: 'act_005',
    homeId: 'home_001',
    deviceName: 'Access Control',
    roomName: 'Gateway',
    action: 'Guest session authorized',
    triggeredBy: 'User',
    timestamp: '20:50',
    dotColor: '#64748b', // slate
  },
  {
    _id: 'act_006',
    homeId: 'home_001',
    deviceName: 'Balcony Motion Sensor',
    roomName: 'Living Room',
    action: 'Balcony motion sensor clear',
    triggeredBy: 'Sensor',
    timestamp: '20:12',
    dotColor: '#10b981', // green
  },
];
