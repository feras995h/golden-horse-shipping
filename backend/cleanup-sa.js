const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

(async () => {
  try {
    const dbPath = path.join(__dirname, 'database.sqlite');
    if (!fs.existsSync(dbPath)) {
      console.error('❌ لم يتم العثور على ملف قاعدة البيانات:', dbPath);
      process.exit(1);
    }

    // 1) Backup database
    const backupsDir = path.join(__dirname, 'backups');
    fs.mkdirSync(backupsDir, { recursive: true });
    const ts = new Date()
      .toISOString()
      .replace(/[-:T.Z]/g, '')
      .slice(0, 14);
    const backupPath = path.join(backupsDir, `database.${ts}.sqlite`);
    fs.copyFileSync(dbPath, backupPath);
    console.log(`🗃️  تم إنشاء نسخة احتياطية: ${backupPath}`);

    const db = new sqlite3.Database(dbPath);

    const runSQL = (sql, params = []) =>
      new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
          if (err) return reject(err);
          resolve(this.changes || 0);
        });
      });

    // Saudi city patterns (Arabic + English)
    const saPatterns = [
      "LOWER(%COL%) LIKE '%riyadh%'",
      "%COL% LIKE '%الرياض%'",
      "LOWER(%COL%) LIKE '%jeddah%'",
      "%COL% LIKE '%جدة%'",
      "LOWER(%COL%) LIKE '%dammam%'",
      "%COL% LIKE '%الدمام%'",
      "LOWER(%COL%) LIKE '%makkah%'",
      "%COL% LIKE '%مكة%'",
      "LOWER(%COL%) LIKE '%medina%'",
      "%COL% LIKE '%المدينة%'",
    ];

    // Defaults: China origin = Guangzhou, Libya destination = Tripoli
    const originDefault = 'Guangzhou';
    const destinationDefault = 'Tripoli';

    // 2) Clean shipments origin_port
    const whereOrigin = saPatterns.map(p => p.replace(/%COL%/g, 'origin_port')).join(' OR ');
    const updOriginSQL = `UPDATE shipments SET origin_port = ? WHERE ${whereOrigin}`;
    const updOrigin = await runSQL(updOriginSQL, [originDefault]);

    // 3) Clean shipments destination_port
    const whereDest = saPatterns.map(p => p.replace(/%COL%/g, 'destination_port')).join(' OR ');
    const updDestSQL = `UPDATE shipments SET destination_port = ? WHERE ${whereDest}`;
    const updDest = await runSQL(updDestSQL, [destinationDefault]);

    // 4) Convert currency SAR -> LYD in shipments
    const updShipCurr = await runSQL(`UPDATE shipments SET currency = 'LYD' WHERE UPPER(currency) = 'SAR'`);

    // 5) Convert currency SAR -> LYD in payment_records (if table exists)
    let updPayCurr = 0;
    try {
      await new Promise((resolve, reject) => {
        db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='payment_records'", (err, row) => {
          if (err) return reject(err);
          resolve(row);
        });
      }).then(async (row) => {
        if (row) {
          updPayCurr = await runSQL(`UPDATE payment_records SET currency = 'LYD' WHERE UPPER(currency) = 'SAR'`);
        }
      });
    } catch (e) {
      console.warn('⚠️ تعذر فحص/تحديث جدول payment_records:', e.message);
    }

    // 6) Summary
    console.log('\n✅ تم التنقية بنجاح:');
    console.log(`- شحنات: تحديث origin_port -> ${originDefault}: ${updOrigin} سجل`);
    console.log(`- شحنات: تحديث destination_port -> ${destinationDefault}: ${updDest} سجل`);
    console.log(`- شحنات: تحويل العملة SAR -> LYD: ${updShipCurr} سجل`);
    console.log(`- مدفوعات: تحويل العملة SAR -> LYD: ${updPayCurr} سجل`);

    db.close();
  } catch (err) {
    console.error('❌ خطأ أثناء التنقية:', err);
    process.exit(1);
  }
})();

