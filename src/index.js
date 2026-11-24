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
:root{color-scheme:dark;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#101010;color:#f5f5f5}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(ellipse at 50% 0,#252525 0,transparent 55%),#101010}
main{width:min(100%,620px);text-align:center;padding:48px 28px;border:1px solid #303030;border-radius:22px;background:#171717;box-shadow:0 24px 80px #0008}
.brand{font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:#aaa;font-weight:700}
.eyebrow{margin-top:42px;color:#aaa;font-size:12px;letter-spacing:.18em;font-weight:700}
.code{font-size:clamp(56px,14vw,92px);line-height:1;font-weight:800;letter-spacing:-.07em;margin:16px 0;color:#fff}
h1{font-size:clamp(30px,7vw,48px);margin:16px 0 12px;letter-spacing:-.04em}
p{color:#c3c3c3;font-size:16px;line-height:1.7;margin:0 auto;max-width:440px}
.actions{display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin-top:34px}
a{color:#111;background:#fff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px}
a.secondary{background:#292929;color:#eee;border:1px solid #444}
.foot{margin-top:38px;color:#777;font-size:12px}
.cheese{font-size:42px;margin-top:20px}
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
    headers: { "content-type": "text/html; charset=UTF-8", "cache-control": "no-store", "x-content-type-options": "nosniff" }
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
    if (request.method !== "GET" && request.method !== "HEAD") {
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