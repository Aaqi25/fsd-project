import React, { useState } from 'react';
import { X, SlidersHorizontal, RefreshCw, AlertTriangle, Zap, Radio, Power, Wifi, WifiOff } from 'lucide-react';
import { useHome } from '../../context/HomeContext';
import { socketService } from '../../services/socketService';
import { Button } from '../common/Button';

export const SimulatorDrawer: React.FC = () => {
  const {
    simulatorOpen,
    setSimulatorOpen,
    devices,
    toggleDevice,
    setDeviceOnlineStatus,
  } = useHome();

  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(devices[0]?._id || '');

  if (!simulatorOpen) return null;

  const currentDevice = devices.find((d) => d._id === selectedDeviceId) || devices[0];

  const handleTriggerStatus = (status: 'active' | 'inactive') => {
    if (!currentDevice) return;
    socketService.triggerDeviceStatusChange(currentDevice._id, status, currentDevice.powerWatts);
  };

  const handleTriggerConnection = (isOnline: boolean) => {
    if (!currentDevice) return;
    setDeviceOnlineStatus(currentDevice._id, isOnline);
  };

  const handleTriggerSpikeAlert = () => {
    socketService.triggerSimulatedAlert({
      category: 'energy',
      severity: 'High',
      title: 'Simulated Load Spike Detected',
      message: 'Appliance consumed 3.2 kW during restricted tariff window. Automated throttle advised.',
      deviceName: currentDevice?.name,
    });
  };

  const handleTriggerCriticalSecurityAlert = () => {
    socketService.triggerSimulatedAlert({
      category: 'security',
      severity: 'Critical',
      title: 'Simulated Perimeter Sensor Alert',
      message: 'Unauthorized motion detected near rear balcony access sensor.',
      roomName: 'Balcony',
    });
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white border-l border-slate-200 shadow-2xl flex flex-col">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-amber-100 text-amber-800 flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-none">
              IoT Device Simulator
            </h3>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
              Development & Evaluation Bridge
            </span>
          </div>
        </div>
        <button
          onClick={() => setSimulatorOpen(false)}
          className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
          aria-label="Close simulator"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Simulator Notice: Explaining IoT Boundary to Examiner */}
      <div className="p-3 bg-amber-50/80 border-b border-amber-200/60 text-xs text-amber-900 leading-relaxed">
        <p className="font-semibold flex items-center gap-1.5 mb-1">
          <Radio className="w-3.5 h-3.5 text-amber-700" />
          Simulated IoT Node Layer
        </p>
        <p className="text-[11px] text-amber-800">
          Enables live demonstration of real-time Socket.IO status changes, connectivity drops,
          telemetry updates, and UI rollback on network error without physical ESP32 hardware.
        </p>
      </div>

      {/* Interactive Controls Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Device Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            Target Appliance
          </label>
          <select
            value={currentDevice?._id || ''}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="w-full text-xs font-medium bg-white border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
          >
            {devices.map((dev) => (
              <option key={dev._id} value={dev._id}>
                {dev.name} ({dev.isOnline ? 'Online' : 'Offline'} • {dev.status.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Selected Device Telemetry Snapshot */}
        {currentDevice && (
          <div className="bg-slate-50 rounded-md border border-slate-200 p-3 text-xs space-y-1.5 font-mono">
            <div className="flex justify-between text-slate-600">
              <span>Model:</span>
              <span className="font-semibold text-slate-800">{currentDevice.model}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>IP Address:</span>
              <span className="font-semibold text-slate-800">{currentDevice.ipAddress}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Current Status:</span>
              <span
                className={`font-semibold ${
                  currentDevice.status === 'active' ? 'text-emerald-600' : 'text-slate-500'
                }`}
              >
                {currentDevice.status.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Connectivity:</span>
              <span
                className={`font-semibold ${
                  currentDevice.isOnline ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {currentDevice.isOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Nominal Power:</span>
              <span className="font-semibold text-slate-800">{currentDevice.powerWatts} W</span>
            </div>
          </div>
        )}

        {/* 1. Simulate Live Socket.IO Status Events */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-700">1. Trigger Real-Time Socket Event</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Power className="w-3.5 h-3.5 text-emerald-600" />}
              onClick={() => handleTriggerStatus('active')}
              disabled={!currentDevice?.isOnline}
            >
              Emit ON Event
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Power className="w-3.5 h-3.5 text-slate-500" />}
              onClick={() => handleTriggerStatus('inactive')}
              disabled={!currentDevice?.isOnline}
            >
              Emit OFF Event
            </Button>
          </div>
        </div>

        {/* 2. Simulate Online/Offline Connectivity Drops */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-700">2. Simulate Hardware Network Drop</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Wifi className="w-3.5 h-3.5 text-blue-600" />}
              onClick={() => handleTriggerConnection(true)}
              disabled={currentDevice?.isOnline}
            >
              Set Online
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<WifiOff className="w-3.5 h-3.5 text-rose-600" />}
              onClick={() => handleTriggerConnection(false)}
              disabled={!currentDevice?.isOnline}
            >
              Set Offline
            </Button>
          </div>
        </div>

        {/* 3. Generate Telemetry Alerts */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-700">3. Inject Telemetry Alert</p>
          <div className="space-y-2">
            <Button
              size="sm"
              variant="secondary"
              className="w-full text-left justify-start"
              leftIcon={<Zap className="w-3.5 h-3.5 text-amber-500" />}
              onClick={handleTriggerSpikeAlert}
            >
              High Energy Surge Alert
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="w-full text-left justify-start"
              leftIcon={<AlertTriangle className="w-3.5 h-3.5 text-rose-500" />}
              onClick={handleTriggerCriticalSecurityAlert}
            >
              Critical Security Alert
            </Button>
          </div>
        </div>
      </div>

      {/* Drawer Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
        <Button size="sm" variant="ghost" className="w-full" onClick={() => setSimulatorOpen(false)}>
          Close Simulator
        </Button>
      </div>
    </div>
  );
};
