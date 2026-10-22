import React from 'react';

export const Energy: React.FC = () => {
  const past7Days = [
    { label: 'Mon', value: 12.4, isToday: false },
    { label: 'Tue', value: 14.1, isToday: false },
    { label: 'Wed', value: 11.8, isToday: false },
    { label: 'Thu', value: 15.2, isToday: false },
    { label: 'Fri', value: 13.6, isToday: false },
    { label: 'Sat', value: 17.8, isToday: false },
    { label: 'Today', value: 10.2, isToday: true },
  ];

  const maxVal = 20; // scale reference for 17.8 max height

  const suggestions = [
    {
      title: 'Standby Load Vampire',
      desc: 'Unplug kitchen coffee maker during off-hours',
      savings: '✓ Save $4.20/mo',
    },
    {
      title: 'AC Setpoint Optimization',
      desc: 'Increase bedroom AC by 1.5°C during night',
      savings: '✓ Save $11.80/mo',
    },
    {
      title: 'Water Heater Standby',
      desc: 'Schedule timer 30 mins before morning bath',
      savings: '✓ Save $8.50/mo',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Energy Telemetry & Tariff Projections
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Granular consumption analysis and automated eco-savings recommendations
        </p>
      </div>

      {/* Main 2-Column Grid matching Figure 5.5 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Bar Chart & Budget Progress (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            {/* Chart Title */}
            <h2 className="text-sm font-bold text-slate-900 tracking-tight mb-8">
              Past 7-Day Energy Consumption (kWh)
            </h2>

            {/* Bar Chart Area */}
            <div className="h-56 flex items-end justify-between gap-3 sm:gap-6 px-2 sm:px-4 pb-2 border-b border-slate-100">
              {past7Days.map((day) => {
                const heightPercent = (day.value / maxVal) * 100;
                return (
                  <div
                    key={day.label}
                    className="flex-1 flex flex-col items-center justify-end h-full group"
                  >
                    {/* Value Label above Bar */}
                    <span className="text-[11px] sm:text-xs font-bold text-slate-700 mb-1.5 transition-transform group-hover:-translate-y-0.5">
                      {day.value.toFixed(1)}
                    </span>

                    {/* Bar */}
                    <div
                      className="w-full max-w-[46px] rounded-t-sm transition-all shadow-xs"
                      style={{
                        height: `${heightPercent}%`,
                        backgroundColor: day.isToday ? '#0284c7' : '#38bdf8',
                      }}
                    />

                    {/* Day Label below Bar */}
                    <span className="text-[11px] sm:text-xs text-slate-500 mt-3 font-medium">
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Monthly Budget Progress Section */}
            <div className="mt-8">
              <div className="text-xs font-bold text-slate-800 mb-2">
                Monthly Budget Progress: 284 / 450 kWh (45.44/72.00)
              </div>

              {/* Progress Bar Container */}
              <div className="w-full h-8 bg-slate-200/70 rounded-md overflow-hidden relative">
                <div
                  className="h-full bg-[#10b981] flex items-center justify-center text-white text-xs font-bold tracking-wide transition-all shadow-xs"
                  style={{ width: '63%' }}
                >
                  63% Utilized • On Track
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Algorithmic Eco Suggestions (5 cols) */}
        <div className="lg:col-span-5">
          <h2 className="text-base font-bold text-slate-900 mb-3 tracking-tight">
            Algorithmic Eco Suggestions
          </h2>

          <div className="space-y-4">
            {suggestions.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-5 shadow-xs hover:border-emerald-400 transition-all"
              >
                <h3 className="text-sm font-bold text-[#15803d]">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {item.desc}
                </p>
                <div className="text-xs font-bold text-[#16a34a] mt-3">
                  {item.savings}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
