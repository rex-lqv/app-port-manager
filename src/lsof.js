const { exec } = require('child_process');

function parsePort(raw) {
  const lines = raw.trim().split('\n').filter(Boolean);
  const results = [];
  const seen = new Set();

  for (const line of lines) {
    // COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME
    const parts = line.trim().split(/\s+/);
    if (parts.length < 9) continue;

    // NAME column is at index 8, may be followed by "(LISTEN)" at index 9
    const name = parts[8]; // e.g. *:3000 or 127.0.0.1:3000
    if (!name) continue;
    const portMatch = name.match(/:(\d+)$/);
    if (!portMatch) continue;

    const port = parseInt(portMatch[1], 10);
    const pid = parseInt(parts[1], 10);
    const key = `${pid}-${port}`;
    if (seen.has(key)) continue;
    seen.add(key);

    results.push({
      port,
      pid,
      command: parts[0],
      user: parts[2],
      protocol: parts[7] === 'TCP' ? 'TCP' : 'UDP',
      address: name,
    });
  }

  return results;
}

function getAllPorts() {
  return new Promise((resolve) => {
    exec('/usr/sbin/lsof -iTCP -sTCP:LISTEN -P -n', (err, stdout) => {
      if (!stdout) return resolve([]);
      const lines = stdout.split('\n').slice(1); // skip header
      resolve(parsePort(lines.join('\n')));
    });
  });
}

function getPortInfo(port) {
  return new Promise((resolve) => {
    exec(`/usr/sbin/lsof -i :${port} -P -n`, (err, stdout) => {
      if (!stdout) return resolve([]);
      const lines = stdout.split('\n').slice(1);
      resolve(parsePort(lines.join('\n')));
    });
  });
}

function killProcess(pid) {
  return new Promise((resolve, reject) => {
    exec(`kill -9 ${pid}`, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

module.exports = { getAllPorts, getPortInfo, killProcess };
