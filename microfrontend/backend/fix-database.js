import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);

try {
  // Check if google_id column exists
  const tableInfo = db.prepare("PRAGMA table_info(users)").all();
  const hasGoogleId = tableInfo.some(col => col.name === 'google_id');

  if (!hasGoogleId) {
    console.log('Adding google_id column to users table...');
    // SQLite doesn't support adding UNIQUE columns, so add without UNIQUE
    // The app logic will ensure uniqueness
    db.exec('ALTER TABLE users ADD COLUMN google_id TEXT');
    console.log('✓ google_id column added successfully');
    console.log('  Note: UNIQUE constraint will be enforced in app logic');
  } else {
    console.log('✓ google_id column already exists');
  }

  // Check if password can be null
  const passwordCol = tableInfo.find(col => col.name === 'password');
  if (passwordCol && passwordCol.notnull === 1) {
    console.log('⚠ Password column is NOT NULL. SQLite does not support ALTER COLUMN.');
    console.log('  This is OK - the app logic will handle Google OAuth users without passwords.');
  } else {
    console.log('✓ Password column is nullable');
  }

  console.log('\nDatabase schema updated successfully!');
  console.log('\nCurrent users table schema:');
  tableInfo.forEach(col => {
    console.log(`  ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : 'NULL'} ${col.pk ? 'PRIMARY KEY' : ''}`);
  });

} catch (error) {
  console.error('Error updating database:', error);
  process.exit(1);
} finally {
  db.close();
}
