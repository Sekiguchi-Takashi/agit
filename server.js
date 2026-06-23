const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3:1.7b';
const OLLAMA_CHAT_URL = 'http://localhost:11434/api/chat';

const DATA_DIR = path.join(__dirname, 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
const INDEX_HTML_PATH = path.join(__dirname, 'index.html');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadHistory() {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(HISTORY_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

function saveHistory(history) {
  ensureDataDir();
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
}

let history = loadHistory();

function sendFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Internal Server Error: ' + err.message);
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        reject(new Error('リクエストが大きすぎます'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('リクエストの解析に失敗しました'));
      }
    });
    req.on('error', reject);
  });
}

function handleGetHistory(req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(history));
}

function handleGetModel(req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ model: OLLAMA_MODEL }));
}

function handleClear(req, res) {
  history = [];
  saveHistory(history);
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ ok: true }));
}

async function handleChat(req, res) {
  let payload;
  try {
    payload = await readJsonBody(req);
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: err.message }));
    return;
  }

  const userMessage = typeof payload.message === 'string' ? payload.message.trim() : '';
  if (!userMessage) {
    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'メッセージが空です' }));
    return;
  }

  history.push({ role: 'user', content: userMessage });
  saveHistory(history);

  res.writeHead(200, {
    'Content-Type': 'application/x-ndjson; charset=utf-8',
    'Cache-Control': 'no-cache',
  });

  let ollamaResponse;
  try {
    ollamaResponse = await fetch(OLLAMA_CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: history,
        stream: true,
      }),
    });
  } catch (err) {
    history.pop();
    saveHistory(history);
    res.write(JSON.stringify({
      error: `Ollamaに接続できません。Ollamaが起動しているか確認してください (http://localhost:11434)。`,
    }) + '\n');
    res.end();
    return;
  }

  if (!ollamaResponse.ok || !ollamaResponse.body) {
    history.pop();
    saveHistory(history);
    const text = await ollamaResponse.text().catch(() => '');
    res.write(JSON.stringify({
      error: `Ollamaがエラーを返しました (HTTP ${ollamaResponse.status}): ${text || 'モデルが見つからない可能性があります'}`,
    }) + '\n');
    res.end();
    return;
  }

  const reader = ollamaResponse.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let assistantContent = '';
  let streamError = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.trim()) continue;
        let json;
        try {
          json = JSON.parse(line);
        } catch (err) {
          continue;
        }
        if (json.message && typeof json.message.content === 'string' && json.message.content) {
          assistantContent += json.message.content;
          res.write(JSON.stringify({ content: json.message.content }) + '\n');
        }
      }
    }
  } catch (err) {
    streamError = err;
  }

  if (assistantContent) {
    history.push({ role: 'assistant', content: assistantContent });
    saveHistory(history);
  } else {
    history.pop();
    saveHistory(history);
  }

  if (streamError) {
    res.write(JSON.stringify({ error: `応答の受信中にエラーが発生しました: ${streamError.message}` }) + '\n');
  }
  res.write(JSON.stringify({ done: true }) + '\n');
  res.end();
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (req.method === 'GET' && (url === '/' || url === '/index.html')) {
    sendFile(res, INDEX_HTML_PATH, 'text/html; charset=utf-8');
    return;
  }

  if (req.method === 'GET' && url === '/api/history') {
    handleGetHistory(req, res);
    return;
  }

  if (req.method === 'GET' && url === '/api/model') {
    handleGetModel(req, res);
    return;
  }

  if (req.method === 'POST' && url === '/api/chat') {
    handleChat(req, res).catch((err) => {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: err.message }));
      } else {
        res.end();
      }
    });
    return;
  }

  if (req.method === 'POST' && url === '/api/clear') {
    handleClear(req, res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`サーバーを起動しました: http://localhost:${PORT}`);
  console.log(`使用モデル: ${OLLAMA_MODEL}`);
  console.log(`Ollama API: ${OLLAMA_CHAT_URL}`);
});
