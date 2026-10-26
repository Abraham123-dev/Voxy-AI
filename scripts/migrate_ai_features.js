import { config } from 'dotenv';
import pg from 'pg';
const { Pool } = pg;

config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function runMigration() {
  console.log('Running migration to add ai_enabled and hidden_for columns...');
  try {
    await pool.query('ALTER TABLE conversations ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN DEFAULT TRUE');
    await pool.query('ALTER TABLE messages ADD COLUMN IF NOT EXISTS hidden_for UUID[] DEFAULT \'{}\'');
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

runMigration();
