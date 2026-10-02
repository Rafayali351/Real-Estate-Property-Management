'use client';

import React from 'react';
import { DailyBookingStat } from '@/lib/types';

interface BarChartProps {
  data: DailyBookingStat[];
  title?: string;
}

export function BarChart({ data, title = '30-Day Private Viewing Demand' }: BarChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const chartHeight = 160;

  return (
    <div className="p-6 rounded-2xl bg-obsidian-card border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-serif text-base font-bold text-white tracking-wide">
            {title}
          </h3>
          <p className="text-xs text-slate-muted mt-0.5">
            Tour bookings initiated across the last 30 days
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gold/15 text-gold border border-gold/30">
          Total: {data.reduce((acc, curr) => acc + curr.count, 0)} Tours
        </span>
      </div>

      {/* SVG Bar Chart */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[600px] h-[190px] flex items-end gap-2 pt-6 pb-2">
          {data.map((item, idx) => {
            const heightPercent = (item.count / maxCount) * 100;
            const barHeight = Math.max((heightPercent / 100) * chartHeight, item.count > 0 ? 8 : 2);
            const dateObj = new Date(item.date);
            const dateLabel = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center gap-2 group relative"
              >
                {/* Tooltip */}
                <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-gold/40 text-[10px] text-gold px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-10">
                  {item.count} Tours ({item.date})
                </div>

                {/* Bar */}
                <div
                  style={{ height: `${barHeight}px` }}
                  className={`w-full rounded-t-sm transition-all duration-300 ${
                    item.count > 0
                      ? 'bg-gradient-to-t from-gold-dark to-gold group-hover:brightness-125'
                      : 'bg-white/5'
                  }`}
                />

                {/* Date Label on select intervals */}
                {idx % 5 === 0 && (
                  <span className="text-[9px] text-slate-sub font-mono truncate">
                    {dateLabel}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
