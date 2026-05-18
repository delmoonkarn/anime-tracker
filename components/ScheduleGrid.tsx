'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ChevronDown,
  Loader2,
  Plus,
  Search,
  X,
} from 'lucide-react';
import type { AnimeEntry, DayOfWeek } from '@/lib/types';
import { DAY_LABELS, getTodayDay, timeToMinutes } from '@/lib/utils';
import { AnimeCard } from './AnimeCard';
import { useConfirm } from './ConfirmDialog';

interface Props {
  animes: AnimeEntry[];
  seasonName: string;
  onEdit: (entry: AnimeEntry) => void;
  onDelete: (id: string) => void;
  onAddAnime: () => void;
  onImport: (file: File) => void;
  onExport: () => void;
  onToggleFavorite?: (entry: AnimeEntry) => void;
  onToggleInterested?: (entry: AnimeEntry) => void;
  isFavorited?: (anilistId: number) => boolean;
  isInterested?: (anilistId: number) => boolean;
  importing?: boolean;
  exporting?: boolean;
}

function ImportExportMenu({
  onImport,
  onExport,
  importing,
  exporting,
}: {
  onImport: (file: File) => void;
  onExport: () => void;
  importing?: boolean;
  exporting?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const busy = importing || exporting;
  const confirm = useConfirm();

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (!f) return;
          const ok = await confirm({
            title: 'Import workbook',
            message: `Import "${f.name}"? New seasons are appended; existing seasons get their anime merged (duplicates skipped).`,
            confirmText: 'Import',
          });
          if (ok) onImport(f);
        }}
      />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={busy}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium disabled:opacity-50 disabled:cursor-wait"
        title="Import or export .xlsx"
      >
        {busy ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ArrowDownToLine className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">
          {importing ? 'Importing…' : exporting ? 'Exporting…' : 'I/O'}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden z-30">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              fileRef.current?.click();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800 text-left"
          >
            <ArrowUpFromLine className="w-4 h-4" />
            Import .xlsx
          </button>
          <button
            type="button"
            onClick={async () => {
              setOpen(false);
              const ok = await confirm({
                title: 'Export workbook',
                message: 'Export all your tracker seasons to a .xlsx workbook?',
                confirmText: 'Export',
              });
              if (ok) onExport();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800 text-left border-t border-zinc-800"
          >
            <ArrowDownToLine className="w-4 h-4" />
            Export .xlsx
          </button>
        </div>
      )}
    </div>
  );
}

const DAY_ORDER: Record<DayOfWeek, number> = {
  Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6,
};

function sortFlow(a: AnimeEntry, b: AnimeEntry): number {
  const da = a.day != null ? DAY_ORDER[a.day] : 99;
  const db = b.day != null ? DAY_ORDER[b.day] : 99;
  if (da !== db) return da - db;
  if (!a.time && !b.time) return a.title.localeCompare(b.title);
  if (!a.time) return 1;
  if (!b.time) return -1;
  return a.time.localeCompare(b.time);
}

// Must mirror the xl: column count in the grid below.
const XL_COLS = 6;

export function ScheduleGrid({
  animes,
  seasonName,
  onEdit,
  onDelete,
  onAddAnime,
  onImport,
  onExport,
  onToggleFavorite,
  onToggleInterested,
  isFavorited,
  isInterested,
  importing,
  exporting,
}: Props) {
  // Re-render once a minute so the "aired" highlight updates as time passes
  // without needing the user to refresh.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const [search, setSearch] = useState('');
  const q = search.trim().toLowerCase();
  const filtered = q
    ? animes.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.titleEnglish?.toLowerCase().includes(q) ?? false),
      )
    : animes;
  const sorted = [...filtered].sort(sortFlow);
  const today = getTodayDay();
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={onAddAnime}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium shrink-0"
          title="Add anime"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span>
        </button>
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${animes.length} anime…`}
            className="w-full pl-9 pr-9 py-2 rounded-lg bg-zinc-950 border border-zinc-800 focus:border-indigo-500 outline-none text-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <ImportExportMenu
          onImport={onImport}
          onExport={onExport}
          importing={importing}
          exporting={exporting}
        />
      </div>

      {q && sorted.length === 0 && animes.length > 0 && (
        <p className="text-center text-sm text-zinc-500 py-12">
          No titles match &quot;{search.trim()}&quot;.
        </p>
      )}

      {animes.length === 0 && (
        <div className="text-center py-16 max-w-md mx-auto">
          <h2 className="text-base font-semibold mb-1">
            No anime in &quot;{seasonName}&quot; yet
          </h2>
          <p className="text-sm text-zinc-400">
            Click <strong>Add</strong> above to search AniList, or import an .xlsx via
            the I/O menu.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-10 pt-7">
        {sorted.map((entry, i) => {
          const prev = i > 0 ? sorted[i - 1] : null;
          const isFirstOfDay = !prev || prev.day !== entry.day;
          const isXlRowStart = i > 0 && i % XL_COLS === 0;
          const dayName = entry.day ? DAY_LABELS[entry.day] : 'Unscheduled';
          const isUnscheduled = entry.day == null;
          const isToday = !isUnscheduled && entry.day === today;
          const airMin = isToday ? timeToMinutes(entry.time) : null;
          const isAired = isToday && airMin != null && nowMinutes >= airMin;

          return (
            <div key={entry.id} className="relative">
              {isFirstOfDay && (
                <span
                  className={`absolute -top-7 left-0 text-xs font-semibold whitespace-nowrap ${
                    isToday
                      ? 'px-2 py-0.5 rounded-full bg-indigo-500 text-white shadow shadow-indigo-500/30'
                      : isUnscheduled
                        ? 'text-zinc-500 italic'
                        : 'text-indigo-300'
                  }`}
                >
                  {dayName}
                  {isToday && ' · Today'}
                </span>
              )}
              {!isFirstOfDay && isXlRowStart && (
                <span
                  className={`hidden xl:inline absolute -top-7 left-0 text-xs font-semibold whitespace-nowrap ${
                    isToday ? 'text-indigo-300' : 'text-zinc-500'
                  }`}
                >
                  {dayName}
                  {isToday && ' · Today'}
                </span>
              )}
              <AnimeCard
                entry={entry}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleFavorite={onToggleFavorite}
                onToggleInterested={onToggleInterested}
                isFavorited={isFavorited ? isFavorited(entry.anilistId) : false}
                isInterested={isInterested ? isInterested(entry.anilistId) : false}
                isToday={isToday}
                isAired={isAired}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
