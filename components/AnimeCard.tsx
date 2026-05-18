'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Bookmark,
  Clock,
  ExternalLink,
  Heart,
  MoreVertical,
  Pencil,
  Trash2,
  Tv,
} from 'lucide-react';
import type { AnimeEntry } from '@/lib/types';
import { useConfirm } from './ConfirmDialog';

interface Props {
  entry: AnimeEntry;
  onEdit: (entry: AnimeEntry) => void;
  onDelete: (id: string) => void;
  onToggleFavorite?: (entry: AnimeEntry) => void;
  onToggleInterested?: (entry: AnimeEntry) => void;
  isFavorited?: boolean;
  isInterested?: boolean;
  isToday?: boolean;
  isAired?: boolean;
}

function CardActionMenu({
  onEdit,
  onDelete,
  onToggleFavorite,
  onToggleInterested,
  isFavorited,
  isInterested,
  canFavorite,
}: {
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite?: () => void;
  onToggleInterested?: () => void;
  isFavorited?: boolean;
  isInterested?: boolean;
  canFavorite: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 rounded-full bg-black/70 backdrop-blur text-zinc-200 hover:bg-zinc-700"
        title="More actions"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden z-20">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-200 hover:bg-indigo-500 hover:text-white text-left"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
          {canFavorite && onToggleFavorite && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onToggleFavorite();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-200 hover:bg-rose-500 hover:text-white text-left border-t border-zinc-800"
            >
              <Heart
                className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current text-rose-400' : ''}`}
              />
              {isFavorited ? 'Unfavorite' : 'Favorite'}
            </button>
          )}
          {canFavorite && onToggleInterested && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onToggleInterested();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-200 hover:bg-sky-500 hover:text-white text-left border-t border-zinc-800"
            >
              <Bookmark
                className={`w-3.5 h-3.5 ${isInterested ? 'fill-current text-sky-400' : ''}`}
              />
              {isInterested ? 'Not interested' : 'Interested'}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-200 hover:bg-red-500 hover:text-white text-left border-t border-zinc-800"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function CoverWrap({
  url,
  className,
  children,
}: {
  url: string;
  className: string;
  children: React.ReactNode;
}) {
  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return <div className={className}>{children}</div>;
}

export function AnimeCard({
  entry,
  onEdit,
  onDelete,
  onToggleFavorite,
  onToggleInterested,
  isFavorited,
  isInterested,
  isToday,
  isAired,
}: Props) {
  const confirm = useConfirm();
  const cardOuter =
    isToday && isAired
      ? 'border-amber-500/60 ring-1 ring-amber-500/30 shadow-amber-500/10'
      : isToday
        ? 'border-indigo-500/70 ring-1 ring-indigo-500/40 shadow-indigo-500/10'
        : 'border-zinc-800 hover:border-zinc-700';

  const showEnglish =
    entry.titleEnglish && entry.titleEnglish.trim() && entry.titleEnglish !== entry.title;

  return (
    <div
      className={`group relative bg-zinc-900 rounded-xl overflow-hidden border transition-all hover:-translate-y-0.5 shadow-lg shadow-black/20 flex flex-col ${cardOuter}`}
    >
      <CoverWrap
        url={entry.platformUrl}
        className="block aspect-[2/3] overflow-hidden bg-zinc-800 relative"
      >
        {entry.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.imageUrl}
            alt={entry.title}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              isAired ? 'opacity-70 saturate-75' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600">
            <Tv className="w-10 h-10" />
          </div>
        )}
        {entry.status && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium bg-black/70 backdrop-blur text-indigo-200 border border-indigo-500/30">
            {entry.status}
          </span>
        )}
        {isToday && !isAired && (
          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-indigo-500 text-white shadow">
            Today
          </span>
        )}
        {isAired && (
          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-500 text-zinc-950 shadow">
            Aired
          </span>
        )}
        <div className="absolute bottom-2 right-2 flex gap-1">
          {isInterested && (
            <span
              className="w-6 h-6 rounded-full bg-black/70 backdrop-blur flex items-center justify-center text-sky-400 shadow"
              title="In your Interested list"
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
            </span>
          )}
          {isFavorited && (
            <span
              className="w-6 h-6 rounded-full bg-black/70 backdrop-blur flex items-center justify-center text-rose-400 shadow"
              title="In your Favorites"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
            </span>
          )}
        </div>
      </CoverWrap>

      <div className="p-3 pb-9 flex-1 flex flex-col gap-0.5">
        <h3 className="font-bold text-sm leading-tight line-clamp-2" title={entry.title}>
          {entry.title}
        </h3>
        {showEnglish && (
          <p
            className="text-[11px] text-zinc-500 leading-tight line-clamp-1"
            title={entry.titleEnglish}
          >
            {entry.titleEnglish}
          </p>
        )}

        <div
          className={`flex items-center gap-1.5 text-xs mt-1.5 ${
            isAired
              ? 'text-amber-400 font-semibold'
              : isToday
                ? 'text-indigo-300 font-semibold'
                : 'text-zinc-400'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span className={isAired ? 'line-through opacity-80' : ''}>
            {entry.time || '—'}
          </span>
        </div>

        {entry.platform && (
          <div className="text-xs text-zinc-500 truncate" title={entry.platform}>
            {entry.platform}
          </div>
        )}
      </div>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <CardActionMenu
          onEdit={() => onEdit(entry)}
          onDelete={async () => {
            if (
              await confirm({
                title: 'Remove anime',
                message: `Remove "${entry.title}" from this season?`,
                kind: 'danger',
                confirmText: 'Remove',
              })
            ) {
              onDelete(entry.id);
            }
          }}
          onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(entry) : undefined}
          onToggleInterested={
            onToggleInterested ? () => onToggleInterested(entry) : undefined
          }
          isFavorited={isFavorited}
          isInterested={isInterested}
          canFavorite={entry.anilistId > 0}
        />
      </div>

      {entry.anilistId > 0 && (
        <a
          href={`https://anilist.co/anime/${entry.anilistId}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zinc-800/90 backdrop-blur text-[10px] font-semibold text-zinc-300 hover:bg-indigo-500 hover:text-white transition-colors"
          title="View on AniList"
        >
          AL
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      )}
    </div>
  );
}
