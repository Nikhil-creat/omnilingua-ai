# OmniLingua AI v4
Agentic, voice-enabled, multi-provider AI translation platform. 100% static: deploys on GitHub Pages.
Created by Nikhil Chary Sriramoju.

## New in v4
- 🛰 **Edge AI**: on-device translation with no key (Chrome built-in Translator API, where supported)
- 🧬 Neural glossary search (on-device) · 🔮 AI Vision OCR · 🗣 Face-to-face interpreter · 📺 Live captions
- 🧪 MQM quality audit + one-tap fixes · 🧠 term mining · 🔐 passphrase vault lock · 💾 backup/restore · PWA share target

## Highlights
- **Any key works:** Groq, OpenAI, Anthropic, Gemini, OpenRouter, xAI auto-detected; models auto-loaded; multi-key vault with one-tap switch and automatic failover
- **Pipelines:** Fast / Agentic (Analyze>Draft>Critique>Refine) / Deep (+back-translation verification)
- **Enterprise:** Privacy Shield (PII masking), audit log, analytics dashboard, batch translation, Model Arena, glossary compliance, presets, custom instructions
- **Inputs:** text, live voice + interpreter mode, OCR (25 languages, camera), PDF, .txt/.srt/.vtt/.csv
- **RAG translation memory:** .json/.tmx/.csv/.txt, quick-add, save to TM, export JSON/TMX
- **UX:** command palette (Ctrl+K), history + favorites, LinguaBot, share link, print/PDF, 4 themes, PWA, accessibility options

## Deploy on GitHub Pages
Upload everything (keep `css/` and `js/`), then Settings > Pages > Deploy from branch > main / root.

## Develop
`npm run verify` (syntax + unit tests) | `npm run serve` | Docker: `docker compose --profile dev up --build`

See ARCHITECTURE.md, SECURITY.md, CHANGELOG.md.
