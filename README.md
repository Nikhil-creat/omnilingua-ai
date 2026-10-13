# OmniLingua AI v2
Agentic, voice-enabled, multi-provider AI translator. 100% static: runs on GitHub Pages, no build step.

## Features
- Paste ANY key: auto-detects Groq (gsk_), OpenAI (sk-), Anthropic (sk-ant-), Gemini (AIza), OpenRouter (sk-or-), xAI (xai-). Models are fetched from your key and the best one is pre-selected.
- Modes: Fast, Agentic (Analyze>Draft>Critique>Refine), Deep (+ back-translation verification)
- RAG translation memory (.json/.tmx/.csv/.txt), quick-add terms, save translations to TM, export JSON/TMX
- OCR (25 languages) with scan overlay, camera capture, PDF text extraction, .txt/.srt/.vtt documents
- Voice STT with waveform, Live Interpreter (speak > translate > speak), TTS with voice/rate/pitch
- Multi-language compare, back-translate, romanize, variants, history + favorites, LinguaBot chat
- 4 themes, animated neural background, installable PWA, offline app shell

## Deploy (GitHub Pages)
1. Create a repo, upload ALL files (keep the css/ and js/ folders).
2. Settings > Pages > Deploy from branch > main / (root).
3. Open https://USERNAME.github.io/REPO/

## Docker
dev: `docker compose --profile dev up --build`   prod: `docker compose --profile prod up --build -d`
