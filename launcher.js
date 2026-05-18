// Anime Tracker launcher.
// Packaged into AnimeTracker.exe via @yao-pkg/pkg. The .exe sits in the
// project root, double-click to launch:
//   1. install deps if node_modules is missing
//   2. start `npm run dev`
//   3. open the user's default browser to http://localhost:3000
// Console window stays open so the user can read logs and stop with Ctrl+C.

const { spawn, spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

// process.execPath = the path to the running .exe.
const projectDir = path.dirname(process.execPath);
process.chdir(projectDir);

const PORT = 3000;
const URL = `http://localhost:${PORT}`;

function openBrowser(url) {
  // `start "" url` — `""` is the empty window title argument that `start`
  // needs when the path/URL might be quoted.
  spawn('cmd', ['/c', 'start', '""', url], {
    detached: true,
    stdio: 'ignore',
  }).unref();
}

function npmCmd() {
  // npm on Windows is npm.cmd; on others it's npm. Pkg target is win-x64
  // here so always npm.cmd, but keep a fallback.
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

function fail(msg, err) {
  console.error('\n[!] ' + msg);
  if (err) console.error(err.message || err);
  console.error('\nPress Enter to close...');
  try {
    require('node:readline').createInterface({ input: process.stdin }).on('line', () => process.exit(1));
  } catch {
    process.exit(1);
  }
}

console.log('========================================');
console.log('  Anime Tracker');
console.log('  Project: ' + projectDir);
console.log('========================================\n');

if (!fs.existsSync(path.join(projectDir, 'package.json'))) {
  fail(
    'package.json not found here. Place AnimeTracker.exe inside the anime-tracker project folder.',
  );
}

if (!fs.existsSync(path.join(projectDir, 'node_modules'))) {
  console.log('[setup] node_modules missing — running npm install (first run only)...\n');
  const install = spawnSync(npmCmd(), ['install', '--no-audit', '--no-fund'], {
    cwd: projectDir,
    stdio: 'inherit',
    shell: true,
  });
  if (install.status !== 0) {
    fail('npm install failed. Make sure Node.js is installed (https://nodejs.org/).', install.error);
    return;
  }
  console.log('');
}

console.log('[dev] Starting Next.js on ' + URL + ' ...\n');

const child = spawn(npmCmd(), ['run', 'dev'], {
  cwd: projectDir,
  shell: true,
  stdio: ['ignore', 'pipe', 'pipe'],
});

let opened = false;
const tryOpen = (text) => {
  if (opened) return;
  // Next 14 prints "Ready in Xms" and "Local: http://..." when ready.
  if (text.includes('Ready in') || text.includes('Local:')) {
    opened = true;
    setTimeout(() => openBrowser(URL), 300);
  }
};

child.stdout.on('data', (data) => {
  const text = data.toString();
  process.stdout.write(text);
  tryOpen(text);
});
child.stderr.on('data', (data) => process.stderr.write(data));

// As a fallback, open browser after 8s even if we didn't see the marker.
setTimeout(() => {
  if (!opened) {
    opened = true;
    openBrowser(URL);
  }
}, 8000);

child.on('exit', (code) => {
  // If we're already tearing down (user closed the window / Ctrl+C),
  // exit immediately — no point waiting on a prompt the user can't see.
  if (shuttingDown) {
    process.exit(code ?? 0);
    return;
  }
  console.log('\n[dev] Server stopped with code ' + code);
  console.log('Press Enter to close...');
  try {
    require('node:readline')
      .createInterface({ input: process.stdin })
      .on('line', () => process.exit(code ?? 0));
  } catch {
    process.exit(code ?? 0);
  }
});

// ---------- shutdown handling ----------
// npm spawns node which spawns next which itself spawns workers — closing
// the launcher with plain child.kill leaves orphaned grandchildren running
// in the background. Use Windows' `taskkill /T` to walk the whole tree.

let shuttingDown = false;
function killTree(reason) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`\n[dev] Shutting down (${reason})...`);
  if (child && child.pid && !child.killed) {
    try {
      // /F = force, /T = kill entire process tree rooted at this PID.
      // spawnSync so it actually finishes before Node exits.
      spawnSync('taskkill', ['/F', '/T', '/PID', String(child.pid)], {
        stdio: 'ignore',
        shell: true,
      });
    } catch {}
  }
}

// Cover every way the launcher can be torn down:
//   - Ctrl+C in console  → SIGINT
//   - Ctrl+Break         → SIGBREAK
//   - taskkill via tools → SIGTERM
//   - console-window X   → SIGHUP (sometimes) or the process is killed
//                          outright; the 'exit' handler is our last chance.
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK']) {
  process.on(sig, () => {
    killTree(sig);
    process.exit(0);
  });
}

// Last-resort sync cleanup. Runs even when process.exit is called or when
// Windows is yanking the process down.
process.on('exit', () => killTree('exit'));

// If the launcher itself crashes, still take the children down.
process.on('uncaughtException', (err) => {
  console.error('[dev] uncaughtException:', err);
  killTree('uncaughtException');
  process.exit(1);
});
