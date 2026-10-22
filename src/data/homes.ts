import { Home } from '../types';

export const mockHomes: Home[] = [
  {
    _id: 'home_001',
    name: 'Riverside Villa',
    address: '428 Highland Avenue, Oakridge, CA',
    ownerId: 'usr_001',
    timezone: 'America/Los_Angeles',
    energyBudgetKwhPerMonth: 450,
    costPerKwh: 0.16,
    createdAt: '2025-01-15T08:30:00.000Z',
  },
];

export const defaultHome = mockHomes[0];

