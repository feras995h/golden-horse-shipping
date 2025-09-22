const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const migrationPath = path.join(__dirname, 'migrations', 'create-customer-accounts.sql');

console.log('Running customer accounts migration...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    return;
  }
  console.log('Connected to SQLite database.');
});

// Read the migration file
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

// Split the SQL into individual statements
const statements = migrationSQL
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0);

// Execute each statement
let completed = 0;
statements.forEach((statement, index) => {
  db.run(statement, (err) => {
    if (err) {
      console.error(`Error executing statement ${index + 1}:`, err.message);
      console.error('Statement:', statement);
    } else {
      console.log(`Statement ${index + 1} executed successfully`);
    }
    
    completed++;
    if (completed === statements.length) {
      console.log('Migration completed successfully!');
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('Database connection closed.');
        }
      });
    }
  });
});
