const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const savedFile = path.join(root, "saved-prompts.json");
const port = Number(process.env.PORT || 8766);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function ensureSavedFile() {
  if (!fs.existsSync(savedFile)) {
    fs.writeFileSync(savedFile, "[]\n", "utf8");
  }
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        request.destroy();
        reject(new Error("Request body is too large"));
      }
    });

    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(data, null, 2));
}

function normalizeSaved(data) {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .filter((item) => item && typeof item.question === "string")
    .slice(0, 30)
    .map((item) => ({
      id: String(item.id || Date.now()),
      key: String(item.key || item.question),
      tag: String(item.tag || "收藏"),
      question: item.question,
      createdAt: String(item.createdAt || new Date().toISOString()),
    }));
}

async function handleSavedApi(request, response) {
  ensureSavedFile();

  if (request.method === "GET") {
    try {
      const data = JSON.parse(fs.readFileSync(savedFile, "utf8") || "[]");
      sendJson(response, 200, normalizeSaved(data));
    } catch {
      sendJson(response, 200, []);
    }
    return;
  }

  if (request.method === "POST" || request.method === "PUT") {
    try {
      const body = await readBody(request);
      const data = normalizeSaved(JSON.parse(body || "[]"));
      fs.writeFileSync(savedFile, `${JSON.stringify(data, null, 2)}\n`, "utf8");
      sendJson(response, 200, { ok: true, count: data.length });
    } catch {
      sendJson(response, 400, { ok: false });
    }
    return;
  }

  response.writeHead(405, { Allow: "GET, POST, PUT" });
  response.end();
}

function serveStatic(request, response) {
  const url = new URL(request.url, `http://localhost:${port}`);
  const requestedPath = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const filePath = path.normalize(path.join(root, requestedPath));
  const relativePath = path.relative(root, filePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(data);
  });
}

const server = http.createServer((request, response) => {
  if (request.url.startsWith("/api/saved")) {
    handleSavedApi(request, response);
    return;
  }

  serveStatic(request, response);
});

server.listen(port, "localhost", () => {
  ensureSavedFile();
  console.log(`提问小室已启动：http://localhost:${port}/index.html`);
  console.log(`收藏文件：${savedFile}`);
});
