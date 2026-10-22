import { User } from '../types';

export const mockUsers: User[] = [
  {
    _id: 'usr_001',
    name: 'Alex',
    username: 'alex_owner',
    email: 'alex@smarthome.io',
    role: 'owner',
    createdAt: '2025-01-15T08:00:00.000Z',
  },
  {
    _id: 'usr_002',
    name: 'Sarah',
    username: 'sarah_resident',
    email: 'sarah.j@smarthome.io',
    role: 'resident',
    createdAt: '2025-02-01T10:30:00.000Z',
  },
  {
    _id: 'usr_003',
    name: 'Guest',
    username: 'guest_user',
    email: 'guest@smarthome.io',
    role: 'guest',
    createdAt: '2025-03-01T10:30:00.000Z',
  },
];

export const defaultUser = mockUsers[0];

