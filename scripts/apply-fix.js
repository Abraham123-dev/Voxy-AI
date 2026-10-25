const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function applyFix() {
  try {
    console.log('Applying migration fix...');
    
    // Add columns if they don't exist
    await pool.query(`
      ALTER TABLE businesses 
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS category TEXT,
      ADD COLUMN IF NOT EXISTS business_hours JSONB,
      ADD COLUMN IF NOT EXISTS assistant_tone TEXT,
      ADD COLUMN IF NOT EXISTS assistant_instructions TEXT,
      ADD COLUMN IF NOT EXISTS custom_category TEXT,
      ADD COLUMN IF NOT EXISTS profile_completion INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT FALSE;
    `);

    console.log('Migration fix applied successfully! ✅');
    process.exit(0);
  } catch (err) {
    console.error('Error applying fix:', err);
    process.exit(1);
  }
}

applyFix();
