import React, { useState, useEffect } from 'react';
import { useHome } from '../context/HomeContext';
import { mockDevices } from '../data/devices';
import { Device } from '../types';

export const Devices: React.FC = () => {
  const { devices, toggleDevice, togglePending, updateDeviceAttributes } = useHome();

  const [activeTab, setActiveTab] = useState<'all' | 'lights' | 'climate' | 'plugs'>('all');

  const [setpoints, setSetpoints] = useState<Record<string, number>>({
    dev_001: 75,
    dev_002: 75,
    dev_003: 75,
  });

  const handleToggleDevice = async (id: string) => {
    await toggleDevice(id);
  };

  const handleSetpointChange = (id: string, val: number) => {
    setSetpoints((prev) => ({ ...prev, [id]: val }));
    updateDeviceAttributes(id, { brightness: val });
  };

  const deviceList = devices && devices.length > 0 ? devices : mockDevices;

  // Filter based on active tab
  const filteredDevices = deviceList.filter((dev) => {
    if (activeTab === 'lights') return dev.type === 'light';
    if (activeTab === 'climate') return dev.type === 'ac' || dev.type === 'fan' || dev.type === 'heater';
    if (activeTab === 'plugs') return dev.type === 'smart_plug';
    return true;
  });

  const lightCount = deviceList.filter((d) => d.type === 'light').length;
  const climateCount = deviceList.filter((d) => d.type === 'ac' || d.type === 'fan' || d.type === 'heater').length;
  const plugCount = deviceList.filter((d) => d.type === 'smart_plug').length;


  return (
    <div className="space-y-6">
      {/* Header and Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Appliance Inventory & Telemetry Controls
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, filter, and actuate connected residential hardware
          </p>
        </div>

        {/* Filter Pills matching Figure 5.3 */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#0284c7] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70 bg-transparent'
            }`}
          >
            All ({deviceList.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('lights')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'lights'
                ? 'bg-[#0284c7] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70 bg-transparent'
            }`}
          >
            Lights ({lightCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('climate')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'climate'
                ? 'bg-[#0284c7] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70 bg-transparent'
            }`}
          >
            Climate ({climateCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('plugs')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'plugs'
                ? 'bg-[#0284c7] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70 bg-transparent'
            }`}
          >
            Plugs ({plugCount})
          </button>
        </div>
      </div>

      {/* 3-Column Grid of Appliance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDevices.map((device) => {
          const isActived = device.status === 'active';
          const currentSetpoint = setpoints[device._id] ?? (device.attributes.brightness || 75);

          // Subtitle formatting
          let roomName = 'Living Room';
          if (device.roomId === 'room_bedroom') roomName = 'Master Bedroom';
          if (device.roomId === 'room_kitchen') roomName = 'Kitchen';
          if (device.roomId === 'room_office') roomName = 'Study & Office';

          let liveLoadText = isActived
            ? `Live Load: ${device.powerWatts} W (Active)`
            : 'Live Load: 0 W (Standby)';

          return (
            <div
              key={device._id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                {/* Title & Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    {device.name}
                  </h3>
                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-semibold border transition-all ${
                      isActived
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {isActived ? 'Active' : 'Standby'}
                  </span>
                </div>

                {/* Subtitle */}
                <div className="text-xs text-slate-500 mt-1">
                  {roomName} • {device.model}
                </div>

                {/* Live Load */}
                <div className={`text-sm font-bold mt-5 ${isActived ? 'text-sky-700' : 'text-slate-400'}`}>
                  {liveLoadText}
                </div>

                {/* IP & Firmware */}
                <div className="text-xs text-slate-500 mt-2 space-y-0.5 font-sans">
                  <div>IP: {device.ipAddress}</div>
                  <div>Firmware: {device.firmware}</div>
                </div>

                {/* Actuation Setpoint Controls */}
                <div className="mt-5">
                  <div className="text-xs font-bold text-slate-800 mb-2">
                    Actuation Setpoint Controls:
                  </div>

                  <div className="relative flex items-center">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={currentSetpoint}
                      onChange={(e) =>
                        handleSetpointChange(device._id, parseInt(e.target.value))
                      }
                      className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0284c7]"
                    />
                    <span className="ml-3 text-xs font-bold text-sky-700 min-w-[36px]">
                      {currentSetpoint}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Toggle State Button */}
              <button
                type="button"
                disabled={togglePending[device._id]}
                onClick={() => handleToggleDevice(device._id)}
                className={`w-full mt-6 py-2.5 px-4 rounded-lg text-xs font-bold text-white transition-colors cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed ${
                  isActived
                    ? 'bg-slate-800 hover:bg-slate-900 border border-slate-700'
                    : 'bg-[#0284c7] hover:bg-[#0369a1]'
                }`}
              >
                {togglePending[device._id]
                  ? 'Updating State...'
                  : isActived
                  ? 'Turn OFF (Switch to Standby)'
                  : 'Turn ON (Activate Appliance)'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
