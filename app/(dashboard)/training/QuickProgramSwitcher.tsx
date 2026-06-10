"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { ChevronDown, Loader2, Zap } from "lucide-react";
import { setActiveProgramAction } from "./builder/actions";

export function QuickProgramSwitcher({ 
  activeProgramId, 
  programs 
}: { 
  activeProgramId: string;
  programs: any[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter out the currently active program
  const otherPrograms = programs.filter(p => p.id !== activeProgramId);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (otherPrograms.length === 0) return null;

  const handleSelect = (id: string) => {
    setIsOpen(false);
    startTransition(async () => {
      await setActiveProgramAction(id);
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-white border border-outline-variant/30 px-3 py-2 hover:border-outline-variant transition-colors flex items-center gap-1 disabled:opacity-50"
        title="Ganti Program"
      >
        Ganti
        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-surface-container border border-outline-variant/30 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-outline-variant/30 bg-surface-container-high">
            <div className="font-headline font-black text-[10px] uppercase tracking-widest text-secondary flex items-center gap-1">
              <Zap className="w-3 h-3" /> PILIH PROGRAM AKTIF
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {otherPrograms.map(p => (
              <button
                key={p.id}
                onClick={() => handleSelect(p.id)}
                className="w-full text-left p-3 hover:bg-surface-bright border-l-2 border-transparent hover:border-secondary transition-colors"
              >
                <div className="font-headline font-black text-sm uppercase text-white truncate">
                  {p.title}
                </div>
                <div className="font-headline font-bold text-[9px] uppercase tracking-widest text-on-surface-variant mt-0.5">
                  {p.total_weeks} MINGGU
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
