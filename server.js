import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const port = Number(process.env.PORT) || 3000;
const publicDir = join(process.cwd(), 'public');

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
};

const sendJson = (res, status, data) => {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
};

const readRequestBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
};

const serveStaticFile = async (pathname, res) => {
  const fileName = pathname === '/' ? '/index.html' : pathname;
  const safePath = fileName.includes('..') ? '/index.html' : fileName;
  const filePath = join(publicDir, safePath);

  try {
    const content = await readFile(filePath);
    const type = contentTypes[extname(filePath)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
};

const getOpenAIReply = async (message) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content:
            'You are an astronomy and cosmology assistant. Help users learn about the universe with clear, accurate explanations. If something is uncertain, state that clearly.',
        },
        { role: 'user', content: message },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || 'OpenAI request failed.');
  }

  return data?.choices?.[0]?.message?.content?.trim() || 'No response generated.';
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'POST' && url.pathname === '/api/chat') {
    try {
      const body = await readRequestBody(req);
      if (!body.message || typeof body.message !== 'string') {
        return sendJson(res, 400, { error: 'A valid message is required.' });
      }

      const reply = await getOpenAIReply(body.message);
      return sendJson(res, 200, { reply });
    } catch (error) {
      return sendJson(res, 500, { error: error.message || 'Internal server error.' });
    }
  }

  if (req.method === 'GET') {
    return serveStaticFile(url.pathname, res);
  }

  res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Method not allowed');
});

server.listen(port, () => {
  console.log(`Universe chatbot app listening at http://localhost:${port}`);
});
