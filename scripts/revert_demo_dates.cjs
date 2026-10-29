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

const BACKUP_PATH = path.join(process.cwd(), 'scripts', 'backup_elo_canteen_original.json');

async function revert() {
  if (!fs.existsSync(BACKUP_PATH)) {
    console.error(`Backup file not found at ${BACKUP_PATH}`);
    process.exit(1);
  }

  console.log('🔄 Reverting Elo Canteen records to original snapshot state...');
  const snapshot = JSON.parse(fs.readFileSync(BACKUP_PATH, 'utf8'));
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Revert Business
    if (snapshot.data.Business && snapshot.data.Business[0]) {
      const b = snapshot.data.Business[0];
      await client.query(
        'UPDATE "Business" SET "createdAt" = $1, "updatedAt" = $2 WHERE id = $3',
        [b.createdAt, b.updatedAt, b.id]
      );
      console.log('  ✓ Reverted Business timestamps');
    }

    // 2. Revert Products
    for (const p of snapshot.data.Product || []) {
      await client.query(
        'UPDATE "Product" SET "createdAt" = $1, "updatedAt" = $2 WHERE id = $3',
        [p.createdAt, p.updatedAt, p.id]
      );
    }
    console.log(`  ✓ Reverted ${snapshot.data.Product?.length || 0} Products`);

    // 3. Revert Customers
    for (const c of snapshot.data.Customer || []) {
      await client.query(
        'UPDATE "Customer" SET "createdAt" = $1, "updatedAt" = $2 WHERE id = $3',
        [c.createdAt, c.updatedAt, c.id]
      );
    }
    console.log(`  ✓ Reverted ${snapshot.data.Customer?.length || 0} Customers`);

    // 4. Revert Conversations and JSONB messages
    for (const conv of snapshot.data.Conversation || []) {
      await client.query(
        'UPDATE "Conversation" SET "createdAt" = $1, "updatedAt" = $2, messages = $3 WHERE id = $4',
        [conv.createdAt, conv.updatedAt, JSON.stringify(conv.messages), conv.id]
      );
    }
    console.log(`  ✓ Reverted ${snapshot.data.Conversation?.length || 0} Conversations & Message history`);

    // 5. Revert Orders
    for (const o of snapshot.data.Order || []) {
      await client.query(
        'UPDATE "Order" SET "createdAt" = $1, "updatedAt" = $2 WHERE id = $3',
        [o.createdAt, o.updatedAt, o.id]
      );
    }
    console.log(`  ✓ Reverted ${snapshot.data.Order?.length || 0} Orders`);

    // 6. Revert OrderItems
    for (const oi of snapshot.data.OrderItem || []) {
      await client.query(
        'UPDATE "OrderItem" SET "createdAt" = $1 WHERE id = $2',
        [oi.createdAt, oi.id]
      );
    }
    console.log(`  ✓ Reverted ${snapshot.data.OrderItem?.length || 0} OrderItems`);

    // 7. Revert Payments
    for (const pay of snapshot.data.Payment || []) {
      await client.query(
        'UPDATE "Payment" SET "createdAt" = $1, "updatedAt" = $2 WHERE id = $3',
        [pay.createdAt, pay.updatedAt, pay.id]
      );
    }
    console.log(`  ✓ Reverted ${snapshot.data.Payment?.length || 0} Payments`);

    // 8. Revert Receipts
    for (const r of snapshot.data.Receipt || []) {
      await client.query(
        'UPDATE "Receipt" SET "createdAt" = $1 WHERE id = $2',
        [r.createdAt, r.id]
      );
    }
    console.log(`  ✓ Reverted ${snapshot.data.Receipt?.length || 0} Receipts`);

    // 9. Revert LedgerTransactions
    for (const l of snapshot.data.LedgerTransaction || []) {
      await client.query(
        'UPDATE "LedgerTransaction" SET "createdAt" = $1 WHERE id = $2',
        [l.createdAt, l.id]
      );
    }
    console.log(`  ✓ Reverted ${snapshot.data.LedgerTransaction?.length || 0} LedgerTransactions`);

    // 10. Revert Alerts
    for (const a of snapshot.data.Alert || []) {
      await client.query(
        'UPDATE "Alert" SET "createdAt" = $1 WHERE id = $2',
        [a.createdAt, a.id]
      );
    }
    console.log(`  ✓ Reverted ${snapshot.data.Alert?.length || 0} Alerts`);

    // 11. Revert AuditLogs
    for (const al of snapshot.data.AuditLog || []) {
      await client.query(
        'UPDATE "AuditLog" SET "createdAt" = $1 WHERE id = $2',
        [al.createdAt, al.id]
      );
    }
    console.log(`  ✓ Reverted ${snapshot.data.AuditLog?.length || 0} AuditLogs`);

    // 12. Revert AgentActivity
    for (const act of snapshot.data.AgentActivity || []) {
      await client.query(
        'UPDATE "AgentActivity" SET "createdAt" = $1 WHERE id = $2',
        [act.createdAt, act.id]
      );
    }
    console.log(`  ✓ Reverted ${snapshot.data.AgentActivity?.length || 0} AgentActivities`);

    await client.query('COMMIT');
    console.log('✅ REVERT SUCCESSFUL! All records are back to original timestamps.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Revert failed, rolled back:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

revert();

