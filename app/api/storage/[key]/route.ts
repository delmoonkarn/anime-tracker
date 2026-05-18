import type { NextRequest } from 'next/server';
import { readByKey, writeByKey, type DbKey } from '@/lib/db';

const ALLOWED: ReadonlySet<DbKey> = new Set<DbKey>([
  'state',
  'collection',
  'discover-cache',
  'tags',
  'h-prefs',
  'h-favorites',
]);

function isAllowed(key: string): key is DbKey {
  return ALLOWED.has(key as DbKey);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  if (!isAllowed(key)) return new Response('Not allowed', { status: 400 });
  try {
    const value = readByKey(key);
    return new Response(JSON.stringify(value ?? null), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    console.error(`[api/storage] read ${key} failed`, err);
    return new Response('Read failed', { status: 500 });
  }
}

async function write(key: DbKey, raw: string): Promise<Response> {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }
  try {
    writeByKey(key, value);
    return new Response('OK');
  } catch (err) {
    console.error(`[api/storage] write ${key} failed`, err);
    return new Response('Write failed', { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  if (!isAllowed(key)) return new Response('Not allowed', { status: 400 });
  return write(key, await req.text());
}

// POST mirrors PUT — used by `navigator.sendBeacon` on page unload.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  if (!isAllowed(key)) return new Response('Not allowed', { status: 400 });
  return write(key, await req.text());
}
