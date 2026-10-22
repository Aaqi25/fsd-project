import { Room, RoomType } from '../types';
import { mockRooms } from '../data/rooms';
import { api } from './api';

const STORAGE_KEY = 'smarthome_rooms_state_v2';

function loadLocalRooms(): Room[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading local rooms:', e);
  }
  return [...mockRooms];
}

function saveLocalRooms(rooms: Room[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
  } catch (e) {
    console.warn('Error saving local rooms:', e);
  }
}

export const roomService = {
  async getAll(): Promise<Room[]> {
    const hasBackend = !!import.meta.env.VITE_API_URL;
    if (hasBackend) {
      try {
        const res = await api.get<Room[]>('/rooms');
        if (res.data) return res.data;
      } catch (err) {
        console.warn('Backend /rooms failed, using local mock state:', err);
      }
    }
    return loadLocalRooms();
  },

  async getById(roomId: string): Promise<Room | null> {
    const rooms = await this.getAll();
    return rooms.find((r) => r._id === roomId) || null;
  },

  async create(data: { name: string; type: RoomType; floor: number; targetTemp?: number }): Promise<Room> {
    await new Promise((resolve) => setTimeout(resolve, 250));

    const newRoom: Room = {
      _id: 'room_' + Date.now().toString(36),
      homeId: 'home_001',
      name: data.name.trim(),
      type: data.type,
      floor: Number(data.floor) || 1,
      targetTemp: data.targetTemp ? Number(data.targetTemp) : undefined,
      createdAt: new Date().toISOString(),
    };

    const rooms = loadLocalRooms();
    rooms.push(newRoom);
    saveLocalRooms(rooms);
    return newRoom;
  },

  async update(roomId: string, updates: Partial<Omit<Room, '_id' | 'homeId' | 'createdAt'>>): Promise<Room> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const rooms = loadLocalRooms();
    const index = rooms.findIndex((r) => r._id === roomId);
    if (index === -1) throw new Error('Room not found');

    const updated = {
      ...rooms[index],
      ...updates,
    };

    rooms[index] = updated;
    saveLocalRooms(rooms);
    return updated;
  },

  async delete(roomId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const rooms = loadLocalRooms().filter((r) => r._id !== roomId);
    saveLocalRooms(rooms);
  },

  resetMockState(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
