const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

console.log('Checking clients table schema...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to SQLite database.');
});

// Get table schema
db.all("PRAGMA table_info(clients)", (err, rows) => {
  if (err) {
    console.error('Error getting table info:', err.message);
  } else {
    console.log('\n📋 Clients table schema:');
    console.log('Column Name | Type | Not Null | Default | Primary Key');
    console.log('------------|------|----------|---------|------------');
    rows.forEach(row => {
      console.log(`${row.name.padEnd(11)} | ${row.type.padEnd(4)} | ${row.notnull.toString().padEnd(8)} | ${(row.dflt_value || 'NULL').toString().padEnd(7)} | ${row.pk}`);
    });
  }
  
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('\nDatabase connection closed.');
    }
  });
});