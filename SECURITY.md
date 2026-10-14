# Security & privacy model
- No server, no telemetry. Text and keys go only from your browser to the provider you chose.
- API keys are encrypted with AES-GCM (Web Crypto). The encryption key lives in the same browser storage, so this protects against casual inspection, NOT against malicious scripts on the page (XSS). Use keys with spend limits and never share a browser profile.
- Privacy Shield masks common identifiers before sending; it is pattern-based and is not a guarantee. Review sensitive text first.
- Share links embed your source text in the URL fragment (not sent to any server, but visible to whoever has the link).
- When self-hosting, add security headers (CSP, X-Content-Type-Options, Referrer-Policy) at your web server and keep dependencies pinned (Tesseract.js 5.1.1, pdf.js 3.11.174).
- Report issues privately to the repository owner.
