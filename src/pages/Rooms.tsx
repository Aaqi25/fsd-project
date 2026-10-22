import React, { useState } from 'react';

interface RoomLayoutCard {
  id: string;
  name: string;
  floor: number;
  appliancesCount: number;
  temp: number;
  humidity: number;
  powerWatts: number;
  stripeColor: string;
  isAllOff: boolean;
}

export const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<RoomLayoutCard[]>([
    {
      id: 'room_1',
      name: 'Living Room',
      floor: 1,
      appliancesCount: 4,
      temp: 22.5,
      humidity: 48,
      powerWatts: 620,
      stripeColor: '#3b82f6', // blue
      isAllOff: false,
    },
    {
      id: 'room_2',
      name: 'Master Bedroom',
      floor: 2,
      appliancesCount: 3,
      temp: 24.0,
      humidity: 45,
      powerWatts: 980,
      stripeColor: '#a855f7', // purple
      isAllOff: false,
    },
    {
      id: 'room_3',
      name: 'Kitchen & Pantry',
      floor: 1,
      appliancesCount: 5,
      temp: 25.0,
      humidity: 52,
      powerWatts: 240,
      stripeColor: '#f59e0b', // amber
      isAllOff: false,
    },
    {
      id: 'room_4',
      name: 'Study & Home Lab',
      floor: 2,
      appliancesCount: 4,
      temp: 23.0,
      humidity: 46,
      powerWatts: 110,
      stripeColor: '#10b981', // green
      isAllOff: false,
    },
  ]);

  const handleToggleAllOff = (id: string) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, isAllOff: !r.isAllOff } : r
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Spatial Zones & Architectural Floor Layouts
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Aggregate power metering and climate status grouped by residential zones
        </p>
      </div>

      {/* 2x2 Grid matching Figure 5.4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rooms.map((room) => {
          const displayedWatts = room.isAllOff ? 0 : room.powerWatts;

          return (
            <div
              key={room.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              {/* Top Colored Stripe Bar */}
              <div
                className="h-2 w-full"
                style={{ backgroundColor: room.stripeColor }}
              />

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    {room.name}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Floor {room.floor} • {room.appliancesCount} Appliances
                  </div>

                  <div className="text-xs text-slate-600 mt-4">
                    Climate: {room.temp.toFixed(1)} °C • {room.humidity}% RH
                  </div>

                  <div className="text-sm font-bold text-[#0284c7] mt-1.5">
                    Power Draw: {displayedWatts} W Total Load
                  </div>
                </div>

                {/* Bottom Right: All Off Button */}
                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => handleToggleAllOff(room.id)}
                    className={`px-6 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                      room.isAllOff
                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                        : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {room.isAllOff ? 'Turn On' : 'All Off'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
