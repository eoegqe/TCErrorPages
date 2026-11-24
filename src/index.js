const errors = {
  400: ["Bad Request", "The request could not be understood."],
  401: ["Sign-in Required", "You need to sign in to access this resource."],
  403: ["Access Denied", "You do not have permission to access this resource."],
  404: ["Page Not Found", "We couldn't find the page you requested."],
  408: ["Request Timed Out", "The request took too long to complete."],
  429: ["Too Many Requests", "Please wait a moment before trying again."],
  500: ["Internal Server Error", "Something went wrong on our end."],
  502: ["Bad Gateway", "The server received an invalid response."],
  503: ["Service Unavailable", "This service is temporarily unavailable."],
  504: ["Gateway Timeout", "A server did not respond in time."]
};

const cheeseText = "here take a cheeseburger, don't tell anyone, our little secret. okay?";

function page({ title, eyebrow, message, code, status = 200, cheese = false }) {
  const heading = cheese ? "CHEESE *" : title;
  const body = cheese ? cheeseText : message;
  const label = cheese ? "A LITTLE SECRET" : eyebrow;
  const statusLine = code ? `<div class="code">${escapeHtml(String(code))}</div>` : "";
  return new Response(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#101010">
<title>${escapeHtml(heading)} | Theegget Errors</title>
<style>
:root{color-scheme:dark;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#14243a;color:#f7f8fb}
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:linear-gradient(135deg,#101d30 0%,#1b2d45 52%,#263c58 100%)}
main{width:min(100%,456px);text-align:center;padding:36px 28px 30px;border:1px solid rgba(190,207,225,.58);border-radius:20px;background:rgba(15,27,43,.16);box-shadow:0 12px 36px rgba(0,0,0,.12)}
.brand{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#f0f2f6;font-weight:800}
.eyebrow{margin-top:30px;color:#e2e7ee;font-size:10px;letter-spacing:.12em;font-weight:800}
.code{font-size:68px;line-height:1;font-weight:850;letter-spacing:-.065em;margin:14px 0 18px;color:#fff}
h1{font-size:32px;line-height:1.12;margin:14px 0 12px;letter-spacing:-.045em;color:#fff}
p{color:#e0e5ec;font-size:12px;line-height:1.65;margin:0 auto;max-width:340px}
.actions{display:flex;justify-content:center;gap:9px;flex-wrap:wrap;margin-top:22px}
a{color:#17263a;background:#f5f6f8;text-decoration:none;font-size:11px;font-weight:750;padding:11px 15px;border-radius:9px}
a.secondary{background:rgba(219,229,240,.16);color:#f5f7fa;border:1px solid rgba(208,220,233,.48)}
.foot{margin-top:25px;color:#d4dce6;font-size:10px}
.cheese{font-size:42px;margin-top:16px}
</style>
</head>
<body><main>
<div class="brand">Theegget Errors</div>
<div class="eyebrow">${escapeHtml(label)}</div>
${statusLine}
<div class="cheese">${cheese ? "🍔" : ""}</div>
<h1>${escapeHtml(heading)}</h1>
<p>${escapeHtml(body)}</p>
<div class="actions"><a href="https://creations.theegget.com">Back to Creations</a><a class="secondary" href="https://status.theegget.com">Service Status</a></div>
<div class="foot">Theegget Creations™</div>
</main></body></html>`, {
    status,
    headers: { "content-type": "text/html; charset=UTF-8", "cache-control": "no-store", "x-content-type-options": "nosniff", "x-tc-error-service": "TCErrorPages" }
  });
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/health") {\n      return Response.json({ service: "TCErrorPages", status: "ok" }, { headers: { "cache-control": "no-store", "x-tc-error-service": "TCErrorPages" } });\n    }\n\n    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405, headers: { allow: "GET, HEAD" } });
    }

    if (url.pathname === "/cheese" || url.pathname === "/cheese/") {
      return page({ cheese: true });
    }

    if (url.searchParams.get("reason") === "tcplus") {
      const messages = [
        "Sorry I couldn't find your subscription. Oh that's right, there are none.",
        "Were you looking for a subscription? Well we couldn't find it because they don't exist.",
        "Error 404: Subscription not found. We checked. We really don't sell subscriptions."
      ];
      const message = messages[Math.floor(Math.random() * messages.length)];
      return page({ title: "TC+ Subscription Not Found", eyebrow: "100% OFF. 100% NONEXISTENT.", message, code: 404, status: 404 });
    }

    const requestedCode = url.searchParams.get("code") || url.pathname.match(/^\/(400|401|403|404|408|429|500|502|503|504)\/?$/)?.[1];
    const code = Number(requestedCode || 404);
    const error = errors[code] || errors[404];
    return page({ title: error[0], eyebrow: "ERROR", message: error[1], code: errors[code] ? code : 404, status: errors[code] ? code : 404 });
  }
};