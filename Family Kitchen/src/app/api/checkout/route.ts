import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

import { aggregateIngredients } from '@/lib/unitConverter';

const QUEUE_FILE    = path.join(process.cwd(), '.tesco_queue.json');
const LOG_FILE      = path.join(process.cwd(), '.tesco_logs.txt');
const CANCEL_FILE   = path.join(process.cwd(), '.tesco_cancel.json');
const PID_FILE      = path.join(process.cwd(), '.tesco_daemon.pid');
const DAEMON_SCRIPT = path.join(process.cwd(), 'scripts', 'tesco_daemon.js');

/** Returns true if the daemon process is still alive. */
function isDaemonRunning(): boolean {
  try {
    const pid = parseInt(fs.readFileSync(PID_FILE, 'utf-8').trim(), 10);
    if (!pid || isNaN(pid)) return false;
    process.kill(pid, 0); // throws ESRCH if dead, EPERM if alive-but-no-permission
    return true;
  } catch (e: any) {
    return e?.code === 'EPERM'; // EPERM = alive but we can't signal it — treat as running
  }
}

/** Spawns the daemon, piping its stdout+stderr into the log file so crashes are visible. */
function spawnDaemon(): void {
  const ts = new Date().toLocaleTimeString();

  // Open log file for appending — daemon stdout/stderr go here so any crash is captured
  let logFd: number;
  try {
    logFd = fs.openSync(LOG_FILE, 'a');
  } catch(e) {
    return;
  }

  const child = spawn(process.execPath, [DAEMON_SCRIPT], {
    detached: true,
    stdio: ['ignore', logFd, logFd],
    cwd: process.cwd(),
    env: { ...process.env },
  });

  // Close our copy of the fd — the child owns it now
  try { fs.closeSync(logFd); } catch(_) {}

  child.on('error', (err) => {
    const ts2 = new Date().toLocaleTimeString();
    try {
      fs.appendFileSync(LOG_FILE, `[${ts2}] ERROR: Daemon spawn failed: ${err.message}\n`);
    } catch(_) {}
  });

  child.unref();

  if (child.pid) {
    fs.writeFileSync(PID_FILE, String(child.pid));
    fs.appendFileSync(LOG_FILE, `[${ts}] PROGRESS: Supermarket daemon started (pid ${child.pid}). Waiting for browser...\n`);
  } else {
    fs.appendFileSync(LOG_FILE, `[${ts}] ERROR: Daemon process failed to start (no PID assigned). Is Node.js in your PATH?\n`);
  }
}

export async function POST(req: Request) {
  try {
    const job = await req.json();
    
    // Optionally preprocess ingredients if job has them
    if (job.ingredients && Array.isArray(job.ingredients)) {
      job.ingredients = aggregateIngredients(job.ingredients);
    }

    // Clear any previous cancellation flag
    if (fs.existsSync(CANCEL_FILE)) {
      try { fs.unlinkSync(CANCEL_FILE); } catch(e){}
    }

    // Reset log file fresh for this run and write an immediate status line
    const ts = new Date().toLocaleTimeString();
    fs.writeFileSync(LOG_FILE, `[${ts}] PROGRESS: Job received. Starting Supermarket robot...\n`);

    // Write the job to the queue BEFORE spawning so daemon picks it up immediately
    fs.writeFileSync(QUEUE_FILE, JSON.stringify(job, null, 2));

    // Auto-start the daemon if it isn't already running
    if (!isDaemonRunning()) {
      spawnDaemon();
    } else {
      fs.appendFileSync(LOG_FILE, `[${ts}] PROGRESS: Daemon already running — job queued.\n`);
    }

    const stream = new ReadableStream({
      start(controller) {
        let lastSize = 0;
        let done = false;

        const checkLogs = setInterval(() => {
          try {
            const stats = fs.statSync(LOG_FILE);
            if (stats.size > lastSize) {
              const fileStream = fs.createReadStream(LOG_FILE, { start: lastSize, end: stats.size });
              fileStream.on('data', (chunk: any) => {
                const text = chunk.toString();
                controller.enqueue(chunk);
                if (
                  text.includes('SUCCESS:') ||
                  text.includes('CRITICAL_ERROR:') ||
                  text.includes('Robot stopped') ||
                  text.includes('Browser closed.')
                ) {
                  done = true;
                }
              });
              lastSize = stats.size;
            }

            if (done) {
              clearInterval(checkLogs);
              clearTimeout(timeout);
              setTimeout(() => { try { controller.close(); } catch(_){} }, 1500);
            }
          } catch (_) {}
        }, 500);

        // Hard timeout after 12 minutes
        const timeout = setTimeout(() => {
          clearInterval(checkLogs);
          try { controller.close(); } catch(_){}
        }, 720_000);
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    // Clear queue and signal cancellation
    fs.writeFileSync(QUEUE_FILE, '');
    fs.writeFileSync(CANCEL_FILE, JSON.stringify({ cancelledAt: Date.now() }));

    const timestamp = new Date().toLocaleTimeString();
    fs.appendFileSync(LOG_FILE, `[${timestamp}] NOTICE: Stop request received. Supermarket robot stopped and browser closed.\n`);

    return NextResponse.json({ success: true, message: 'Cancellation signal sent.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
