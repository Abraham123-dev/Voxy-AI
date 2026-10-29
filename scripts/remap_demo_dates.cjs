const { Pool } = require('pg');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const dbUrlLine = envContent.split('\n').find(l => l.startsWith('DATABASE_URL='));
const dbUrl = dbUrlLine.split('=')[1].replace(/["']/g, '').trim();

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

const BIZ_ID = '000b26b9-6842-443d-a848-20273a131d05';
const TARGET_START = new Date('2026-10-25T09:00:00Z').getTime();
const TARGET_END = new Date('2026-10-28T21:00:00Z').getTime();
const HACKATHON_START = new Date('2026-10-24T00:00:00Z').getTime();

// Pre-hackathon anchor dates from existing data
const OLD_MIN = new Date('2026-09-05T20:45:00Z').getTime();
const OLD_MAX = new Date('2026-10-21T18:00:00Z').getTime();

function remapDate(d) {
  if (!d) return d;
  const time = new Date(d).getTime();
  if (isNaN(time) || time >= HACKATHON_START) {
    return d; // already in hackathon period
  }
  const progress = Math.max(0, Math.min(1, (time - OLD_MIN) / (OLD_MAX - OLD_MIN || 1)));
  const newTime = TARGET_START + progress * (TARGET_END - TARGET_START);
  return new Date(newTime).toISOString();
}

async function remap() {
  console.log('🚀 Starting date migration for Elo Canteen (ifemafiaa@gmail.com)...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Business
    await client.query(
      `UPDATE "Business" 
       SET "createdAt" = '2026-10-24T14:30:00.000Z', 
           "updatedAt" = '2026-10-28T22:00:00.000Z' 
       WHERE id = $1`,
      [BIZ_ID]
    );
    console.log('  ✓ Updated Business registration date to Oct 24, 2026');

    // 2. Products
    const prods = await client.query('SELECT id, "createdAt" FROM "Product" WHERE "businessId" = $1', [BIZ_ID]);
    let prodMinutes = 0;
    for (const p of prods.rows) {
      const pDate = new Date(new Date('2026-10-25T10:00:00.000Z').getTime() + prodMinutes * 15 * 60 * 1000).toISOString();
      await client.query('UPDATE "Product" SET "createdAt" = $1, "updatedAt" = $1 WHERE id = $2', [pDate, p.id]);
      prodMinutes++;
    }
    console.log(`  ✓ Updated ${prods.rows.length} Products to Oct 25, 2026`);

    // 3. Customers
    const custs = await client.query('SELECT id, "createdAt", "updatedAt" FROM "Customer" WHERE "businessId" = $1', [BIZ_ID]);
    for (const c of custs.rows) {
      const newCreated = remapDate(c.createdAt);
      const newUpdated = remapDate(c.updatedAt || c.createdAt);
      await client.query('UPDATE "Customer" SET "createdAt" = $1, "updatedAt" = $2 WHERE id = $3', [newCreated, newUpdated, c.id]);
    }
    console.log(`  ✓ Updated ${custs.rows.length} Customers`);

    // 4. Conversations & Message JSONB
    const convs = await client.query('SELECT id, "createdAt", "updatedAt", messages FROM "Conversation" WHERE "businessId" = $1', [BIZ_ID]);
    for (const conv of convs.rows) {
      const newCreated = remapDate(conv.createdAt);
      const newUpdated = remapDate(conv.updatedAt || conv.createdAt);

      let updatedMessages = conv.messages;
      if (Array.isArray(conv.messages)) {
        updatedMessages = conv.messages.map(m => {
          if (!m.createdAt) return m;
          return {
            ...m,
            createdAt: remapDate(m.createdAt)
          };
        });
      }

      await client.query(
        'UPDATE "Conversation" SET "createdAt" = $1, "updatedAt" = $2, messages = $3 WHERE id = $4',
        [newCreated, newUpdated, JSON.stringify(updatedMessages), conv.id]
      );
    }
    console.log(`  ✓ Updated ${convs.rows.length} Conversations and JSONB chat message arrays`);

    // 5. Orders
    const orders = await client.query('SELECT id, "createdAt", "updatedAt" FROM "Order" WHERE "businessId" = $1', [BIZ_ID]);
    for (const o of orders.rows) {
      const newCreated = remapDate(o.createdAt);
      const newUpdated = remapDate(o.updatedAt || o.createdAt);
      await client.query('UPDATE "Order" SET "createdAt" = $1, "updatedAt" = $2 WHERE id = $3', [newCreated, newUpdated, o.id]);
    }
    console.log(`  ✓ Updated ${orders.rows.length} Orders`);

    // 6. OrderItems
    const orderItems = await client.query(
      `SELECT oi.id, oi."createdAt", o."createdAt" as order_created 
       FROM "OrderItem" oi 
       JOIN "Order" o ON oi."orderId" = o.id 
       WHERE o."businessId" = $1`,
      [BIZ_ID]
    );
    for (const oi of orderItems.rows) {
      const newCreated = remapDate(oi.createdAt || oi.order_created);
      await client.query('UPDATE "OrderItem" SET "createdAt" = $1 WHERE id = $2', [newCreated, oi.id]);
    }
    console.log(`  ✓ Updated ${orderItems.rows.length} OrderItems`);

    // 7. Payments
    const payments = await client.query('SELECT id, "createdAt", "updatedAt" FROM "Payment" WHERE "businessId" = $1', [BIZ_ID]);
    for (const p of payments.rows) {
      const newCreated = remapDate(p.createdAt);
      const newUpdated = remapDate(p.updatedAt || p.createdAt);
      await client.query('UPDATE "Payment" SET "createdAt" = $1, "updatedAt" = $2 WHERE id = $3', [newCreated, newUpdated, p.id]);
    }
    console.log(`  ✓ Updated ${payments.rows.length} Payments`);

    // 8. Receipts
    const receipts = await client.query(
      `SELECT r.id, r."createdAt", o."createdAt" as order_created 
       FROM "Receipt" r 
       JOIN "Order" o ON r."orderId" = o.id 
       WHERE o."businessId" = $1`,
      [BIZ_ID]
    );
    for (const r of receipts.rows) {
      const newCreated = remapDate(r.createdAt || r.order_created);
      await client.query('UPDATE "Receipt" SET "createdAt" = $1 WHERE id = $2', [newCreated, r.id]);
    }
    console.log(`  ✓ Updated ${receipts.rows.length} Receipts`);

    // 9. LedgerTransactions
    const ledgers = await client.query('SELECT id, "createdAt" FROM "LedgerTransaction" WHERE "businessId" = $1', [BIZ_ID]);
    for (const l of ledgers.rows) {
      const newCreated = remapDate(l.createdAt);
      await client.query('UPDATE "LedgerTransaction" SET "createdAt" = $1 WHERE id = $2', [newCreated, l.id]);
    }
    console.log(`  ✓ Updated ${ledgers.rows.length} LedgerTransactions`);

    // 10. Alerts
    const alerts = await client.query('SELECT id, "createdAt" FROM "Alert" WHERE "businessId" = $1', [BIZ_ID]);
    for (const a of alerts.rows) {
      const newCreated = remapDate(a.createdAt);
      await client.query('UPDATE "Alert" SET "createdAt" = $1 WHERE id = $2', [newCreated, a.id]);
    }
    console.log(`  ✓ Updated ${alerts.rows.length} Alerts`);

    // 11. AuditLogs
    const audits = await client.query('SELECT id, "createdAt" FROM "AuditLog" WHERE "businessId" = $1', [BIZ_ID]);
    for (const al of audits.rows) {
      const newCreated = remapDate(al.createdAt);
      await client.query('UPDATE "AuditLog" SET "createdAt" = $1 WHERE id = $2', [newCreated, al.id]);
    }
    console.log(`  ✓ Updated ${audits.rows.length} AuditLogs`);

    // 12. AgentActivity
    const activities = await client.query('SELECT id, "createdAt" FROM "AgentActivity" WHERE "businessId" = $1', [BIZ_ID]);
    for (const act of activities.rows) {
      const newCreated = remapDate(act.createdAt);
      await client.query('UPDATE "AgentActivity" SET "createdAt" = $1 WHERE id = $2', [newCreated, act.id]);
    }
    console.log(`  ✓ Updated ${activities.rows.length} AgentActivities`);

    await client.query('COMMIT');
    console.log('🎉 SUCCESS: All Elo Canteen records have been updated to October 24–29, 2026!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Date migration failed, rolled back:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

remap();

