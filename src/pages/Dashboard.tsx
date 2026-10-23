import React, { useState } from 'react';
import { useHome } from '../context/HomeContext';
import { mockActivityLogs } from '../data/activity';

interface ZoneControl {
  id: string;
  name: string;
  temp: string;
  watts: number;
  info: string;
  isOn: boolean;
}

export const Dashboard: React.FC = () => {
  const { home, devices, alerts, activityLogs } = useHome();

  // Zone Quick Controls state matching Figure 5.2 exactly
  const [zones, setZones] = useState<ZoneControl[]>([
    {
      id: 'z1',
      name: 'Living Room',
      temp: '22.0°C',
      watts: 450,
      info: '3 Devices Active',
      isOn: true,
    },
    {
      id: 'z2',
      name: 'Master Bedroom',
      temp: '24.0°C',
      watts: 620,
      info: 'AC Running (Cool)',
      isOn: true,
    },
    {
      id: 'z3',
      name: 'Kitchen & Dining',
      temp: '25.2°C',
      watts: 180,
      info: 'Smart Plug Active',
      isOn: true,
    },
    {
      id: 'z4',
      name: 'Study & Office',
      temp: '23.0°C',
      watts: 90,
      info: 'Lighting 80%',
      isOn: false,
    },
  ]);

  const [recentZoneLogs, setRecentZoneLogs] = useState<any[]>([]);

  const handleToggleZone = (id: string) => {
    const target = zones.find((z) => z.id === id);
    if (target) {
      const nextStatus = !target.isOn;
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setRecentZoneLogs((prev) => [
        {
          _id: 'act_' + Date.now(),
          timestamp: nowStr,
          action: `${target.name} zone turned ${nextStatus ? 'ON' : 'OFF'} via Quick Controls`,
          dotColor: nextStatus ? '#10b981' : '#f59e0b',
        },
        ...prev,
      ]);
    }
    setZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, isOn: !z.isOn } : z))
    );
  };

  // Base draw is 590W, sum of z1(450) + z2(620) + z3(180) + 590 = exactly 1,840 W!
  const totalWatts = zones.reduce((sum, z) => sum + (z.isOn ? z.watts : 0), 590);
  const percentVsAvg = Math.round(((totalWatts - 1640) / 1640) * 100);

  // Dynamic Standby Calculation linked to zones & devices
  const zoneStandbyDelta =
    (zones.find((z) => z.id === 'z1')?.isOn ? 0 : 3) +
    (zones.find((z) => z.id === 'z2')?.isOn ? 0 : 3) +
    (zones.find((z) => z.id === 'z3')?.isOn ? 0 : 2) +
    (zones.find((z) => z.id === 'z4')?.isOn ? -2 : 0);

  const baseStandby = devices.length > 0 ? devices.filter((d) => d.status !== 'active').length : 2;
  const standbyCount = Math.max(0, baseStandby + zoneStandbyDelta);
  const totalDeviceCount = devices.length > 0 ? devices.length : 16;
  const onlineCount = devices.length > 0 ? devices.filter((d) => d.isOnline).length : 14;
  const openAlertsCount = alerts.filter((a) => !a.isAcknowledged).length;

  return (
    <div className="space-y-6">
      {/* 1. Operational Status Banner */}
      <div className="border border-[#86efac] bg-[#f0fdf4] rounded-xl px-5 py-4">
        <h2 className="text-[#15803d] font-bold text-base tracking-tight">
          {home.name || 'Riverside Villa'} • All Systems Operational
        </h2>
        <p className="text-[#16a34a] text-xs font-medium mt-1">
          Network: Stable (Wi-Fi 6) • Tariff: Off-Peak ($0.16/kWh) • Security: Armed (Home Mode)
        </p>
      </div>

      {/* 2. Four KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Draw */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-bold text-slate-700 tracking-wide">
            Active Draw
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {totalWatts.toLocaleString()} W
          </div>
          <div className={`text-xs font-semibold mt-1 ${percentVsAvg >= 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
            {percentVsAvg >= 0 ? `+${percentVsAvg}% vs avg` : `${percentVsAvg}% vs avg`}
          </div>
        </div>

        {/* Online Devices */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-bold text-slate-700 tracking-wide">
            Online Devices
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {onlineCount} / {totalDeviceCount}
          </div>
          <div className="text-xs font-semibold text-blue-600 mt-1">
            {standbyCount} Standby
          </div>
        </div>

        {/* Avg Climate */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-bold text-slate-700 tracking-wide">
            Avg Climate
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            23.5 °C
          </div>
          <div className="text-xs font-semibold text-teal-600 mt-1">
            48% Humidity
          </div>
        </div>

        {/* Open Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="text-xs font-bold text-slate-700 tracking-wide">
            Open Alerts
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {openAlertsCount > 0 ? `${openAlertsCount} Warning${openAlertsCount > 1 ? 's' : ''}` : '0 Warnings'}
          </div>
          <div className="text-xs font-semibold text-amber-500 mt-1">
            {openAlertsCount > 0 ? 'Action required' : 'All clear'}
          </div>
        </div>
      </div>

      {/* 3. Main Two-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Spatial Zones & Quick Controls (7 cols) */}
        <div className="lg:col-span-7">
          <h3 className="text-base font-bold text-slate-900 mb-3 tracking-tight">
            Spatial Zones & Quick Controls
          </h3>

          <div className="space-y-3">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex items-center justify-between shadow-xs hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    {zone.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {zone.temp} | {zone.isOn ? `${zone.watts} W` : '0 W (Standby)'} •{' '}
                    <span className={zone.isOn ? 'text-slate-600' : 'text-amber-600 font-semibold'}>
                      {zone.isOn ? zone.info : 'Zone in Standby'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleZone(zone.id)}
                  className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs ${
                    zone.isOn
                      ? 'bg-[#0284c7] hover:bg-[#0369a1] text-white'
                      : 'bg-[#cbd5e1] hover:bg-slate-300 text-slate-600'
                  }`}
                >
                  {zone.isOn ? 'ON' : 'OFF'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Activity & Audit Feed (5 cols) */}
        <div className="lg:col-span-5">
          <h3 className="text-base font-bold text-slate-900 mb-3 tracking-tight">
            Live Activity & Audit Feed
          </h3>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            {([
              ...recentZoneLogs,
              ...(activityLogs && activityLogs.length > 0 ? activityLogs : mockActivityLogs),
            ]).slice(0, 5).map((log) => (
              <div key={log._id} className="flex items-center gap-3">
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: log.dotColor || '#3b82f6' }}
                />
                <span className="text-xs font-medium text-slate-700 leading-relaxed">
                  [{log.timestamp ? log.timestamp.split('T')[1]?.slice(0, 8) || log.timestamp : 'Just now'}] {log.action}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
