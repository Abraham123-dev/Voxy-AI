import db from '../src/lib/db.js';

async function checkSchema() {
  try {
    const res = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'conversations'
    `);
    console.log('Conversations columns:', res.rows.map(r => r.column_name));
    
    const resUsers = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
    console.log('Users columns:', resUsers.rows.map(r => r.column_name));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
