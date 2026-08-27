/**
 * One-time migration: fix absolute loopback image URLs stored in the database.
 *
 * Replaces URLs like:
 *   http://127.0.0.1:3000/uploads/orig-xxx.jpg  →  /uploads/orig-xxx.jpg
 *   http://localhost:3000/uploads/orig-xxx.jpg   →  /uploads/orig-xxx.jpg
 *
 * Safe to run multiple times (idempotent).
 *
 * Usage (from the server/ directory):
 *   node scripts/fix-image-urls.js
 */

import pool from '../src/db/pool.js';

const LOOPBACK_PATTERN = /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?(\/.*)/i;

/**
 * Replace loopback absolute URLs with root-relative paths.
 * Returns null if the value is already fine or empty.
 */
function fixUrl(url) {
  if (!url) return null;
  const match = LOOPBACK_PATTERN.exec(url);
  if (!match) return null; // already fine
  return match[3]; // just the path part, e.g. /uploads/orig-xxx.jpg
}

async function migrateTable(table, column) {
  const { rows } = await pool.query(
    `SELECT id, ${column} FROM ${table} WHERE ${column} ~ '^https?://(127\\.0\\.0\\.1|localhost)'`
  );

  if (rows.length === 0) {
    console.log(`  ${table}.${column}: nothing to fix`);
    return 0;
  }

  let fixed = 0;
  for (const row of rows) {
    const newUrl = fixUrl(row[column]);
    if (!newUrl) continue;
    await pool.query(`UPDATE ${table} SET ${column} = $1 WHERE id = $2`, [newUrl, row.id]);
    console.log(`  ${table}[${row.id}]: "${row[column]}" → "${newUrl}"`);
    fixed++;
  }
  return fixed;
}

async function main() {
  console.log('Starting image URL migration…\n');

  let total = 0;

  // Tables and columns that may store image URLs
  const targets = [
    { table: 'dishes',           column: 'image_url'  },
    { table: 'menu_categories',  column: 'image_url'  },
    { table: 'promotions',       column: 'image_url'  },
    { table: 'media',            column: 'file_url'   },
    { table: 'users',            column: 'avatar_url' },
  ];

  for (const { table, column } of targets) {
    // Skip if column doesn't exist in this DB
    const { rows: cols } = await pool.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_name = $1 AND column_name = $2`,
      [table, column]
    );
    if (cols.length === 0) {
      console.log(`  ${table}.${column}: column not found, skipping`);
      continue;
    }

    const fixed = await migrateTable(table, column);
    total += fixed;
  }

  console.log(`\nDone. Fixed ${total} URL(s).`);
  await pool.end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
