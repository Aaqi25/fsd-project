import { Room } from '../types';

export const mockRooms: Room[] = [
  {
    _id: 'room_living',
    homeId: 'home_001',
    name: 'Living Room',
    type: 'living_room',
    floor: 1,
    targetTemp: 22.5,
    createdAt: '2025-01-16T09:00:00.000Z',
  },
  {
    _id: 'room_bedroom',
    homeId: 'home_001',
    name: 'Master Bedroom',
    type: 'bedroom',
    floor: 2,
    targetTemp: 24.0,
    createdAt: '2025-01-16T09:05:00.000Z',
  },
  {
    _id: 'room_kitchen',
    homeId: 'home_001',
    name: 'Kitchen & Pantry',
    type: 'kitchen',
    floor: 1,
    targetTemp: 25.0,
    createdAt: '2025-01-16T09:10:00.000Z',
  },
  {
    _id: 'room_office',
    homeId: 'home_001',
    name: 'Study & Home Lab',
    type: 'office',
    floor: 2,
    targetTemp: 23.0,
    createdAt: '2025-01-16T09:20:00.000Z',
  },
];

