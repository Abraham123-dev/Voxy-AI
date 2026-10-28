import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  console.log('🚀 Starting Voxy Performance & Observability Migration...');
  
  try {
    // 1. Core Analytics: AI Usage Logs (High Latency Observability)
    console.log('--- Setting up ai_usage_logs...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_usage_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
        request_type TEXT NOT NULL CHECK (request_type IN ('chat', 'voice', 'system', 'audit')),
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        input_size INTEGER DEFAULT 0,
        output_size INTEGER DEFAULT 0,
        latency INTEGER DEFAULT 0,
        cost_estimate DECIMAL(10, 6) DEFAULT 0,
        status TEXT NOT NULL CHECK (status IN ('success', 'error')),
        error_message TEXT,
        was_sanitized BOOLEAN DEFAULT FALSE,
        risk_level TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_ai_usage_business_id ON ai_usage_logs(business_id);
      CREATE INDEX IF NOT EXISTS idx_ai_usage_created_at ON ai_usage_logs(created_at);
      CREATE INDEX IF NOT EXISTS idx_ai_usage_status ON ai_usage_logs(status);
    `);

    // 2. Platform Audit Registry
    console.log('--- Setting up audit_logs...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_email TEXT DEFAULT 'system@voxy.ai',
        action TEXT NOT NULL,
        severity TEXT DEFAULT 'info',
        entity_type TEXT,
        entity_id TEXT,
        details TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at);
    `);

    // 3. Transactions & Points
    console.log('--- Setting up transactions...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        amount INTEGER NOT NULL,
        reference TEXT UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_transactions_business_id ON transactions(business_id);
    `);

    // 4. Ensure Business Balances
    console.log('--- Refining businesses table...');
    await pool.query(`
      ALTER TABLE businesses ADD COLUMN IF NOT EXISTS credit_balance INTEGER DEFAULT 0;
    `);

    console.log('✅ Migration successful! Voxy Performance Engine is live.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
