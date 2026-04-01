"use client";

import { useMemo } from "react";

export function Heatmap({ 
  activityMap = {}, 
  streakMax = 0 
}: { 
  activityMap?: Record<string, number>;
  streakMax?: number;
}) {
  const { blocks, stats } = useMemo(() => {
    const items = [];
    const colors = [
      { class: 'bg-surface-container-highest', desc: '0 Actions', min: 0 },
      { class: 'bg-secondary-container/40', desc: 'Light Activity', min: 1 },
      { class: 'bg-secondary-container/70', desc: 'Moderate Activity', min: 3 },
      { class: 'bg-primary shadow-[0_0_5px_rgba(142,255,113,0.5)]', desc: 'Optimal Performance', min: 5 }
    ];
    
    let totalMisses = 0;
    let totalActions = 0;
    let activeDays = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Simulate 364 days backward
    for (let i = 363; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      
      const dateString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const isoDate = d.toISOString().split('T')[0];
      
      const count = activityMap[isoDate] || 0;
      
      let selectedColor = colors[0];
      if (count >= 5) selectedColor = colors[3];
      else if (count >= 3) selectedColor = colors[2];
      else if (count >= 1) selectedColor = colors[1];

      if (count === 0) totalMisses++;
      else activeDays++;

      totalActions += count;
      
      items.push(
        <div 
          key={i}
          className={`w-[10px] h-[10px] md:w-3 md:h-3 rounded-sm ${selectedColor.class} hover:scale-125 hover:z-10 transition-transform cursor-pointer hover:outline hover:outline-1 hover:outline-white`}
          title={`Date: ${dateString}\nStatus: ${count} Actions (${selectedColor.desc})`}
        />
      );
    }

    const compRate = (activeDays / 364).toFixed(2);
    const avgFocus = Math.round((totalActions / (364 * 5)) * 100); // simplistic assumption: 5 actions/day = 100% focus

    return { 
      blocks: items, 
      stats: { totalMisses, avgFocus: Math.min(100, avgFocus), compRate } 
    };
  }, [activityMap]);

  return (
    <div className="bg-surface-container p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="font-headline font-black text-xl uppercase tracking-tighter">DISCIPLINE HEATMAP</h2>
          <p className="font-headline font-bold text-[10px] text-on-surface-variant uppercase tracking-widest text-xs">
            ANNUAL CONSISTENCY LOG [YEAR: {new Date().getFullYear()}]
          </p>
        </div>
        <div className="flex gap-2 items-center bg-surface-container-low p-2 rounded">
          <span className="font-headline text-[10px] uppercase text-on-surface-variant mr-2">Intensity:</span>
          <div className="w-3 h-3 bg-surface-container-highest" title="0 Actions"></div>
          <div className="w-3 h-3 bg-secondary-container/40" title="1-2 Actions"></div>
          <div className="w-3 h-3 bg-secondary-container/70" title="3-4 Actions"></div>
          <div className="w-3 h-3 bg-primary shadow-[0_0_5px_#8eff71]" title="5+ Actions (Optimal)"></div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-[3px] md:gap-1 opacity-90 hover:opacity-100 transition-opacity">
        {blocks}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <div className="bg-surface-container-low p-4 border-t-2 border-primary">
          <div className="font-headline font-bold text-[10px] text-on-surface-variant uppercase mb-1">BEST STREAK</div>
          <div className="font-headline font-black text-xl text-primary">{streakMax} DAYS</div>
        </div>
        <div className="bg-surface-container-low p-4 border-t-2 border-error">
          <div className="font-headline font-bold text-[10px] text-on-surface-variant uppercase mb-1">TOTAL MISSES</div>
          <div className="font-headline font-black text-xl text-error">{stats.totalMisses} DAYS</div>
        </div>
        <div className="bg-surface-container-low p-4 border-t-2 border-secondary">
          <div className="font-headline font-bold text-[10px] text-on-surface-variant uppercase mb-1">AVERAGE FOCUS</div>
          <div className="font-headline font-black text-xl text-secondary">{stats.avgFocus}%</div>
        </div>
        <div className="bg-surface-container-low p-4 border-t-2 border-primary-dim">
          <div className="font-headline font-bold text-[10px] text-on-surface-variant uppercase mb-1">COMPLETION RATE</div>
          <div className="font-headline font-black text-xl text-primary-dim">{stats.compRate}</div>
        </div>
      </div>
    </div>
  );
}
