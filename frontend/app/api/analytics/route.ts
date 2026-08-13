import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dbPath = path.join(process.cwd(), '..', 'backend', 'database.sqlite');

    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({
        total_calls: 0,
        successful_calls: 0,
        failed_calls: 0,
        recent_calls: [],
      });
    }

    try {
      // @ts-ignore - node:sqlite is standard in Node 22+
      const { DatabaseSync } = await import('node:sqlite');
      const db = new DatabaseSync(dbPath);

      const totalRow = db.prepare('SELECT COUNT(*) as count FROM calls').get() as { count: number };
      const successRow = db
        .prepare("SELECT COUNT(*) as count FROM calls WHERE status = 'SUCCESS'")
        .get() as { count: number };
      const failedRow = db
        .prepare("SELECT COUNT(*) as count FROM calls WHERE status = 'FAILED'")
        .get() as { count: number };

      const recentCalls = db
        .prepare(
          `
        SELECT call_id, room_name, status, call_type, exercise_completed,
               started_at, ended_at, duration_seconds
        FROM calls
        ORDER BY started_at DESC
        LIMIT 50
      `
        )
        .all();

      db.close();

      return NextResponse.json({
        total_calls: Number(totalRow?.count || 0),
        successful_calls: Number(successRow?.count || 0),
        failed_calls: Number(failedRow?.count || 0),
        recent_calls: recentCalls || [],
      });
    } catch (sqliteErr) {
      const { execSync } = await import('child_process');
      const pythonScript = `import sqlite3, json; conn = sqlite3.connect(r'${dbPath}'); conn.row_factory = sqlite3.Row; c = conn.cursor(); total = c.execute("SELECT COUNT(*) FROM calls").fetchone()[0]; succ = c.execute("SELECT COUNT(*) FROM calls WHERE status='SUCCESS'").fetchone()[0]; fail = c.execute("SELECT COUNT(*) FROM calls WHERE status='FAILED'").fetchone()[0]; rows = [dict(r) for r in c.execute("SELECT call_id, room_name, status, call_type, exercise_completed, started_at, ended_at, duration_seconds FROM calls ORDER BY started_at DESC LIMIT 50").fetchall()]; print(json.dumps({"total_calls": total, "successful_calls": succ, "failed_calls": fail, "recent_calls": rows}))`;

      const stdout = execSync(`python -c "${pythonScript}"`, { encoding: 'utf-8' });
      const data = JSON.parse(stdout);

      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      {
        total_calls: 0,
        successful_calls: 0,
        failed_calls: 0,
        recent_calls: [],
        error: String(error),
      },
      { status: 500 }
    );
  }
}
