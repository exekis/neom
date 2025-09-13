// simple sqlite wrapper using better-sqlite3 for storing uploaded loops
// this file ensures the table exists on first import and exposes helpers

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// resolve db file in project root so it persists on the vm
const dbFile = path.join(process.cwd(), 'neom.db');

// ensure file exists
try {
  if (!fs.existsSync(dbFile)) {
    fs.writeFileSync(dbFile, ''); // create empty file
  }
} catch {}

export const db = new Database(dbFile);

// create table if not exists
db.exec(`
  create table if not exists loops (
    id integer primary key autoincrement,
    filename text not null,
    url text not null,
    mime text,
    size integer,
    created_at text default (datetime('now'))
  );
`);

export function insertLoop(row: { filename: string; url: string; mime?: string; size?: number }) {
  const stmt = db.prepare(
    'insert into loops (filename, url, mime, size) values (@filename, @url, @mime, @size)'
  );
  const info = stmt.run(row);
  return info.lastInsertRowid as number;
}

export function listLoops(limit = 50) {
  const stmt = db.prepare('select * from loops order by id desc limit ?');
  return stmt.all(limit);
}
