const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const BUDGET_FILE = path.join(DATA_DIR, 'budget.json');
const MEMOS_FILE = path.join(DATA_DIR, 'memos.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(BUDGET_FILE)) fs.writeFileSync(BUDGET_FILE, '[]', 'utf8');
  if (!fs.existsSync(MEMOS_FILE)) fs.writeFileSync(MEMOS_FILE, '[]', 'utf8');
}

function readJson(file) {
  try {
    const text = fs.readFileSync(file, 'utf8');
    return JSON.parse(text || '[]');
  } catch (e) {
    return [];
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let chunks = [];
    let size = 0;
    const MAX_SIZE = 1024 * 1024; // 1MB
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_SIZE) {
        reject(new Error('Request body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

function serveStatic(req, res, pathname) {
  let filePath = pathname === '/' ? '/index.html' : pathname;
  const resolved = path.normalize(path.join(PUBLIC_DIR, filePath));
  if (!resolved.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  fs.readFile(resolved, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not Found');
    }
    const ext = path.extname(resolved);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(content);
  });
}

function isValidBudgetEntry(b) {
  if (!b || typeof b !== 'object') return false;
  if (b.type !== 'income' && b.type !== 'expense') return false;
  if (typeof b.date !== 'string' || !b.date) return false;
  if (typeof b.category !== 'string' || !b.category.trim()) return false;
  const amount = Number(b.amount);
  if (!Number.isFinite(amount) || amount < 0) return false;
  return true;
}

function isValidMemo(m) {
  if (!m || typeof m !== 'object') return false;
  if (typeof m.title !== 'string' || !m.title.trim()) return false;
  if (typeof m.body !== 'string') return false;
  return true;
}

async function handleBudget(req, res, parts) {
  const id = parts[1];

  if (req.method === 'GET' && !id) {
    return sendJson(res, 200, readJson(BUDGET_FILE));
  }

  if (req.method === 'POST' && !id) {
    let body;
    try {
      body = await readBody(req);
    } catch (e) {
      return sendJson(res, 400, { error: e.message });
    }
    if (!isValidBudgetEntry(body)) {
      return sendJson(res, 400, { error: 'invalid budget entry' });
    }
    const entries = readJson(BUDGET_FILE);
    const entry = {
      id: crypto.randomUUID(),
      type: body.type,
      date: body.date,
      category: body.category.trim(),
      amount: Number(body.amount),
      memo: typeof body.memo === 'string' ? body.memo.trim() : '',
      createdAt: Date.now(),
    };
    entries.push(entry);
    writeJson(BUDGET_FILE, entries);
    return sendJson(res, 201, entry);
  }

  if (req.method === 'DELETE' && id) {
    const entries = readJson(BUDGET_FILE);
    const next = entries.filter((e) => e.id !== id);
    if (next.length === entries.length) {
      return sendJson(res, 404, { error: 'not found' });
    }
    writeJson(BUDGET_FILE, next);
    return sendJson(res, 200, { ok: true });
  }

  sendJson(res, 405, { error: 'method not allowed' });
}

async function handleMemos(req, res, parts) {
  const id = parts[1];

  if (req.method === 'GET' && !id) {
    return sendJson(res, 200, readJson(MEMOS_FILE));
  }

  if (req.method === 'POST' && !id) {
    let body;
    try {
      body = await readBody(req);
    } catch (e) {
      return sendJson(res, 400, { error: e.message });
    }
    if (!isValidMemo(body)) {
      return sendJson(res, 400, { error: 'invalid memo' });
    }
    const memos = readJson(MEMOS_FILE);
    const now = Date.now();
    const memo = {
      id: crypto.randomUUID(),
      title: body.title.trim(),
      body: body.body,
      createdAt: now,
      updatedAt: now,
    };
    memos.push(memo);
    writeJson(MEMOS_FILE, memos);
    return sendJson(res, 201, memo);
  }

  if (req.method === 'PUT' && id) {
    let body;
    try {
      body = await readBody(req);
    } catch (e) {
      return sendJson(res, 400, { error: e.message });
    }
    if (!isValidMemo(body)) {
      return sendJson(res, 400, { error: 'invalid memo' });
    }
    const memos = readJson(MEMOS_FILE);
    const target = memos.find((m) => m.id === id);
    if (!target) {
      return sendJson(res, 404, { error: 'not found' });
    }
    target.title = body.title.trim();
    target.body = body.body;
    target.updatedAt = Date.now();
    writeJson(MEMOS_FILE, memos);
    return sendJson(res, 200, target);
  }

  if (req.method === 'DELETE' && id) {
    const memos = readJson(MEMOS_FILE);
    const next = memos.filter((m) => m.id !== id);
    if (next.length === memos.length) {
      return sendJson(res, 404, { error: 'not found' });
    }
    writeJson(MEMOS_FILE, next);
    return sendJson(res, 200, { ok: true });
  }

  sendJson(res, 405, { error: 'method not allowed' });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(url.pathname);

  try {
    if (pathname.startsWith('/api/budget')) {
      const parts = pathname.split('/').filter(Boolean).slice(1); // ['budget', id?]
      return await handleBudget(req, res, parts);
    }

    if (pathname.startsWith('/api/memos')) {
      const parts = pathname.split('/').filter(Boolean).slice(1); // ['memos', id?]
      return await handleMemos(req, res, parts);
    }

    if (req.method === 'GET') {
      return serveStatic(req, res, pathname);
    }

    sendJson(res, 404, { error: 'not found' });
  } catch (e) {
    sendJson(res, 500, { error: 'internal server error' });
  }
});

ensureDataFiles();
server.listen(PORT, () => {
  console.log(`家計簿・メモアプリ起動: http://localhost:${PORT}`);
});
