"use client";

import { useState } from "react";
import { PlaySquare, CheckCircle, PlusSquare, ArrowRight } from "lucide-react";

export function ActiveWorkoutUI({ workout }: { workout: any }) {
  // In future we use server actions to add exercises, log sets etc.
  
  return (
    <div className="bg-surface-container-low border border-secondary shadow-[0_0_15px_rgba(213,117,255,0.1)] p-6 md:p-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-outline-variant/30 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse-fast"></span>
            <span className="font-headline font-bold text-[10px] text-secondary uppercase tracking-widest">
              DEPLOYED: COMBAT SIMULATION
            </span>
          </div>
          <h2 className="font-headline font-black text-2xl uppercase tracking-tighter text-white">
            ACTIVE TRAINING SESSION
          </h2>
        </div>
        
        <div className="font-headline text-3xl font-black text-primary glitch-effect">
          00:14:22
        </div>
      </div>

      <div className="space-y-6">
        {workout.workout_exercises?.length === 0 ? (
          <div className="p-10 border border-dashed border-outline-variant flex flex-col items-center justify-center text-center">
            <p className="font-headline uppercase text-sm text-on-surface-variant tracking-widest font-bold mb-4">
              NO EXERCISES IN QUEUE
            </p>
            <button className="bg-surface-container-high border border-secondary text-secondary font-headline font-black uppercase text-xs py-2 px-6 hover:bg-secondary/20 transition-colors">
              ADD EXERCISE FROM LIBRARY
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* List mapped exercises here */}
          </div>
        )}
      </div>

      <div className="mt-10 flex justify-end">
        <button className="bg-error text-black font-headline font-black uppercase text-sm px-8 py-3 tracking-widest flex items-center gap-2 hover:shadow-[0_0_15px_#ff7351] transition-shadow">
          <CheckCircle className="w-5 h-5" />
          TERMINATE SESSION
        </button>
      </div>
    </div>
  );
}
