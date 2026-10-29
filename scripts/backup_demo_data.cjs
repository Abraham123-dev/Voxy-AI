const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync('.env.local', 'utf8');
const dbUrlLine = envContent.split('\n').find(l => l.startsWith('DATABASE_URL='));
const dbUrl = dbUrlLine.split('=')[1].replace(/["']/g, '').trim();

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

const BIZ_ID = '000b26b9-6842-443d-a848-20273a131d05';
const BACKUP_PATH = path.join(process.cwd(), 'scripts', 'backup_elo_canteen_original.json');

async function backup() {
  console.log('📦 Creating snapshot backup for Elo Canteen (ifemafiaa@gmail.com)...');
  const snapshot = {
    businessId: BIZ_ID,
    timestamp: new Date().toISOString(),
    data: {}
  };

  const tables = [
    'Business',
    'Product',
    'Customer',
    'Conversation',
    'Order',
    'OrderItem',
    'Payment',
    'Receipt',
    'LedgerTransaction',
    'BusinessWallet',
    'Alert',
    'AuditLog',
    'AgentActivity'
  ];

  for (const table of tables) {
    let query = '';
    let params = [];
    if (table === 'Business' || table === 'BusinessWallet') {
      query = `SELECT * FROM "${table}" WHERE id = $1`;
      params = [BIZ_ID];
    } else if (table === 'OrderItem') {
      query = `SELECT * FROM "OrderItem" WHERE "orderId" IN (SELECT id FROM "Order" WHERE "businessId" = $1)`;
      params = [BIZ_ID];
    } else if (table === 'Receipt') {
      query = `SELECT * FROM "Receipt" WHERE "orderId" IN (SELECT id FROM "Order" WHERE "businessId" = $1)`;
      params = [BIZ_ID];
    } else {
      query = `SELECT * FROM "${table}" WHERE "businessId" = $1`;
      params = [BIZ_ID];
    }

    const res = await pool.query(query, params);
    snapshot.data[table] = res.rows;
    console.log(`  ✓ Backed up ${table}: ${res.rows.length} rows`);
  }

  fs.writeFileSync(BACKUP_PATH, JSON.stringify(snapshot, null, 2), 'utf8');
  console.log(`💾 Snapshot successfully written to: ${BACKUP_PATH}`);
}

backup().then(() => pool.end()).catch(err => {
  console.error('Backup failed:', err);
  pool.end();
  process.exit(1);
});

