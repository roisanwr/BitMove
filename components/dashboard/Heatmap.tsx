"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { X, Dumbbell, CheckSquare, CalendarDays } from "lucide-react";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKS = 52;
const CELL_SIZE = 12; // px
const CELL_GAP = 3;   // px

type DayDetail = { tasks: string[]; exercises: string[] };

type Cell = {
  isoDate: string;
  dateLabel: string;
  count: number;
  future: boolean;
};

type TooltipState = {
  x: number;
  y: number;
  date: string;
  count: number;
} | null;

type SelectedDay = {
  isoDate: string;
  dateLabel: string;
  count: number;
} | null;

/**
 * Format Date ke string YYYY-MM-DD menggunakan komponen lokal
 * (menghindari konversi UTC dari toISOString() yang bisa geser tanggal)
 */
function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Warna sel berdasarkan ratio count/maxCount (5 level, dinamis)
 */
function getCellStyle(count: number, maxCount: number): React.CSSProperties {
  if (count <= 0) return { backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" };
  const ratio = count / Math.max(maxCount, 1);
  if (ratio <= 0.15) return { backgroundColor: "#0d3b1f" };
  if (ratio <= 0.35) return { backgroundColor: "#1a5e33" };
  if (ratio <= 0.60) return { backgroundColor: "#26874b" };
  if (ratio <= 0.85) return { backgroundColor: "#39b860" };
  return {
    backgroundColor: "#8eff71",
    boxShadow: "0 0 6px rgba(142,255,113,0.55)",
  };
}

function getLegendStyle(level: number): React.CSSProperties {
  const styles = [
    { backgroundColor: "#1a1a1a", border: "1px solid #2a2a2a" },
    { backgroundColor: "#0d3b1f" },
    { backgroundColor: "#26874b" },
    { backgroundColor: "#39b860" },
    { backgroundColor: "#8eff71", boxShadow: "0 0 5px rgba(142,255,113,0.55)" },
  ];
  return styles[level] ?? styles[0];
}

// ── Day Detail Modal ──────────────────────────────────────────────────────────
function DayDetailModal({
  selectedDay,
  detail,
  onClose,
}: {
  selectedDay: SelectedDay;
  detail: DayDetail | undefined;
  onClose: () => void;
}) {
  // Tutup modal jika tekan Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!selectedDay) return null;

  const tasks = detail?.tasks ?? [];
  const exercises = detail?.exercises ?? [];
  const total = tasks.length + exercises.length;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
      onClick={onClose}
    >
      {/* Panel */}
      <div
        className="relative w-full max-w-sm bg-[#111] border border-[#2a2a2a] shadow-2xl"
        style={{ boxShadow: "0 0 40px rgba(142,255,113,0.08)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-[#2a2a2a]">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <CalendarDays className="w-3.5 h-3.5 text-primary" />
              <span className="font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">
                ACTIVITY LOG
              </span>
            </div>
            <h3 className="font-headline font-black text-base text-white uppercase tracking-tighter">
              {selectedDay.dateLabel}
            </h3>
            <p className="font-headline text-[10px] text-on-surface-variant mt-0.5 uppercase tracking-widest">
              {total} AKSI TERCATAT
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 max-h-80 overflow-y-auto">
          {/* Tasks */}
          {tasks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckSquare className="w-3.5 h-3.5 text-primary" />
                <span className="font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">
                  QUEST SELESAI ({tasks.length})
                </span>
              </div>
              <ul className="space-y-1.5">
                {tasks.map((t, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span className="font-body text-sm text-white leading-tight">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Exercises */}
          {exercises.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Dumbbell className="w-3.5 h-3.5 text-secondary" />
                <span className="font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">
                  TRAINING SELESAI ({exercises.length})
                </span>
              </div>
              <ul className="space-y-1.5">
                {exercises.map((ex, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
                    <span className="font-body text-sm text-white leading-tight">{ex}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Kosong */}
          {total === 0 && (
            <p className="font-body text-sm text-on-surface-variant text-center py-4">
              Tidak ada data aktivitas untuk hari ini.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#2a2a2a] flex justify-between items-center">
          <span className="font-headline text-[10px] uppercase tracking-widest text-on-surface-variant">
            {selectedDay.count} TOTAL ACTION{selectedDay.count !== 1 ? "S" : ""}
          </span>
          <button
            onClick={onClose}
            className="font-headline font-black text-[10px] uppercase tracking-widest text-primary hover:text-white transition-colors px-3 py-1.5 border border-primary/30 hover:border-primary hover:bg-primary/10"
          >
            TUTUP
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function Heatmap({
  activityMap = {},
  dayDetails = {},
  streakMax = 0,
}: {
  activityMap?: Record<string, number>;
  dayDetails?: Record<string, DayDetail>;
  streakMax?: number;
}) {
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const [selectedDay, setSelectedDay] = useState<SelectedDay>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { grid, monthLabels, stats, maxCount } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Anchor: Senin dari minggu saat ini
    const dow = today.getDay(); // 0=Sun
    const daysToMon = dow === 0 ? 6 : dow - 1;

    // Start: 52 minggu ke belakang dari Senin ini
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - daysToMon - (WEEKS - 1) * 7);

    // Cari tanggal aktivitas pertama untuk fix Ghost Misses
    const activityKeys = Object.keys(activityMap).sort();
    const firstActiveDate = activityKeys.length > 0
      ? new Date(activityKeys[0] + "T00:00:00")
      : null;

    const grid: Cell[][] = [];
    const monthLabels: { label: string; weekIdx: number }[] = [];

    let maxCount = 0;
    let totalMisses = 0;
    let totalActions = 0;
    let activeDays = 0;
    let lastMonth = -1;

    for (let w = 0; w < WEEKS; w++) {
      const col: Cell[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + w * 7 + d);

        if (date > today) {
          col.push({ isoDate: "", dateLabel: "", count: -1, future: true });
          continue;
        }

        // Fix timezone bug: gunakan komponen lokal, bukan toISOString()
        const isoDate = formatLocalDate(date);
        const dateLabel = date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        const count = activityMap[isoDate] || 0;
        maxCount = Math.max(maxCount, count);
        totalActions += count;

        // Fix Ghost Misses: hanya hitung miss dari first activity date
        const isBeforeFirstActivity = firstActiveDate !== null && date < firstActiveDate;
        if (!isBeforeFirstActivity) {
          if (count === 0) totalMisses++;
          else activeDays++;
        }

        // Label bulan: hanya tampil di baris Senin (d===0) saat bulan berganti
        if (d === 0 && date.getMonth() !== lastMonth) {
          monthLabels.push({ label: MONTH_NAMES[date.getMonth()], weekIdx: w });
          lastMonth = date.getMonth();
        }

        col.push({ isoDate, dateLabel, count, future: false });
      }
      grid.push(col);
    }

    const total = activeDays + totalMisses;
    const compRate = total > 0 ? (activeDays / total).toFixed(2) : "0.00";
    const avgFocus = total > 0 ? Math.min(100, Math.round((totalActions / (total * 5)) * 100)) : 0;

    return { grid, monthLabels, stats: { totalMisses, avgFocus, compRate }, maxCount };
  }, [activityMap]);

  const handleMouseEnter = (cell: Cell, e: React.MouseEvent) => {
    if (cell.future || !cell.isoDate) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      date: cell.dateLabel,
      count: cell.count,
    });
  };

  const handleCellClick = (cell: Cell) => {
    // Hanya bisa diklik jika ada aktivitas
    if (cell.future || !cell.isoDate || cell.count <= 0) return;
    setTooltip(null);
    setSelectedDay({
      isoDate: cell.isoDate,
      dateLabel: cell.dateLabel,
      count: cell.count,
    });
  };

  const totalCellWidth = CELL_SIZE + CELL_GAP;

  return (
    <>
      {/* Day Detail Modal */}
      <DayDetailModal
        selectedDay={selectedDay}
        detail={selectedDay ? dayDetails[selectedDay.isoDate] : undefined}
        onClose={() => setSelectedDay(null)}
      />

      <div className="bg-surface-container p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
          <div>
            <h2 className="font-headline font-black text-xl uppercase tracking-tighter">DISCIPLINE HEATMAP</h2>
            <p className="font-headline font-bold text-[10px] text-on-surface-variant uppercase tracking-widest">
              ANNUAL CONSISTENCY LOG [YEAR: {new Date().getFullYear()}] — KLIK KOTAK UNTUK DETAIL
            </p>
          </div>
          {/* Legend — GitHub-style */}
          <div className="flex items-center gap-1.5">
            <span className="font-headline text-[10px] uppercase text-on-surface-variant mr-1">Less</span>
            {[0, 1, 2, 3, 4].map((lvl) => (
              <div
                key={lvl}
                style={{ ...getLegendStyle(lvl), width: 12, height: 12, borderRadius: 2 }}
              />
            ))}
            <span className="font-headline text-[10px] uppercase text-on-surface-variant ml-1">More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div
          ref={containerRef}
          className="relative overflow-x-auto select-none"
          onMouseLeave={() => setTooltip(null)}
        >
          {/* Month labels row */}
          <div className="relative ml-8" style={{ height: 20, marginBottom: 4 }}>
            {monthLabels.map((m) => (
              <span
                key={`${m.label}-${m.weekIdx}`}
                className="absolute font-headline text-[10px] uppercase text-on-surface-variant"
                style={{ left: m.weekIdx * totalCellWidth }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Grid body: day labels + cells */}
          <div className="flex gap-0">
            {/* Day labels column */}
            <div
              className="flex flex-col shrink-0"
              style={{ gap: CELL_GAP, marginRight: CELL_GAP + 2 }}
            >
              {DAY_LABELS.map((day, i) => (
                <div
                  key={day}
                  className="font-headline text-[10px] text-on-surface-variant flex items-center"
                  style={{
                    height: CELL_SIZE,
                    visibility: [0, 2, 4].includes(i) ? "visible" : "hidden",
                    width: 26,
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Weeks × Days cells */}
            <div className="flex" style={{ gap: CELL_GAP }}>
              {grid.map((week, wIdx) => (
                <div
                  key={wIdx}
                  className="flex flex-col"
                  style={{ gap: CELL_GAP }}
                >
                  {week.map((cell, dIdx) => {
                    const isClickable = !cell.future && !!cell.isoDate && cell.count > 0;
                    return (
                      <div
                        key={dIdx}
                        title={isClickable ? `${cell.dateLabel} — klik untuk detail` : undefined}
                        style={{
                          width: CELL_SIZE,
                          height: CELL_SIZE,
                          borderRadius: 2,
                          flexShrink: 0,
                          cursor: isClickable ? "pointer" : "default",
                          transition: "transform 0.1s, box-shadow 0.1s",
                          ...(cell.future || !cell.isoDate
                            ? { backgroundColor: "transparent" }
                            : getCellStyle(cell.count, maxCount)),
                        }}
                        onMouseEnter={(e) => handleMouseEnter(cell, e)}
                        onMouseMove={(e) => handleMouseEnter(cell, e)}
                        onClick={() => handleCellClick(cell)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Hover Tooltip */}
          {tooltip && (
            <div
              className="pointer-events-none absolute z-40 bg-surface-container-high border border-outline-variant/50 px-3 py-2 shadow-xl"
              style={{
                left: tooltip.x + 12,
                top: tooltip.y - 48,
                transform: "translateY(-50%)",
                whiteSpace: "nowrap",
              }}
            >
              <div className="font-headline font-bold text-white text-xs">{tooltip.date}</div>
              <div className="font-body text-[11px] text-on-surface-variant mt-0.5">
                {tooltip.count === 0
                  ? "Tidak ada aktivitas"
                  : `${tooltip.count} aksi — klik untuk detail`}
              </div>
            </div>
          )}
        </div>

        {/* Stats bar */}
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
    </>
  );
}
