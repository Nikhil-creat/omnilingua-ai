# Architecture
Static, serverless PWA. No backend: the browser calls the AI provider directly with the user's own key.

| File | Role |
|---|---|
| `index.html`, `css/style.css` | Shell, glassmorphism UI, themes, print + high-contrast styles |
| `js/lib.js` | Pure helpers (provider detection, chunking, PII masking, CSV). Unit-tested in Node |
| `js/app.js` | Core: provider client, key encryption, RAG memory, agentic pipeline, OCR/PDF, voice, LinguaBot |
| `js/pro.js` | Enterprise layer: vault + failover, audit log, analytics, batch, arena, palette, diagnostics |
| `js/v4.js` | Advanced layer: Edge AI, neural RAG, vision OCR, interpreter/captions, MQM audit, passphrase vault, flow viz |
| `sw.js`, `manifest.json` | Offline app shell and installability |

## Request flow
1. Input (text, voice, OCR, PDF, file) -> optional Privacy Shield masks identifiers as `[[P#]]`
2. Translation memory retrieval (hashed n-gram vectors, cosine similarity) injects mandatory terminology
3. Pipeline: Analyze -> Draft -> Critique -> Refine (+ Verify in Deep mode)
4. `llm()` picks the provider adapter (OpenAI-compatible or Anthropic), applies a per-provider token bucket, retries, and on failure fails over to another vaulted provider
5. Placeholders are restored locally; result is stored in history, audit log and analytics

`pro.js` extends `app.js` by wrapping `llm`, `saveKey`, `connect` and `addHist`; it needs no changes to the core.

## Load order
`lib.js` -> `app.js` -> `pro.js` -> `v4.js` (classic scripts sharing one global scope). Each layer wraps functions from the one before it (`llm`, `translate`, `saveKey`, `ck`, `addHist`, `setPips`, `ocrImage`), so core files stay untouched by add-ons.

## Translation engines
| Mode | Engine | Needs key |
|---|---|---|
| Fast / Agentic / Deep | Cloud LLM via provider adapter | yes |
| Edge | Browser built-in Translator API | no |
