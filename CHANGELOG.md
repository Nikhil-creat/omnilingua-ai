# Changelog
## 3.0.1
- Smarter default model: ranks by capability, never auto-picks tiny/4K-context models (e.g. allam-2-7b); Groq defaults updated to gpt-oss-120b
- Context-overflow recovery: auto-switch to a larger model, then chunked fast mode; small-model aware chunking
- Strips reasoning <think> blocks; Groq gpt-oss runs with low reasoning effort for speed; Claude 5.x model preferences
## 3.0.0
- Key vault with several providers, one-tap switching and automatic failover on 429/5xx/network errors
- Privacy Shield: masks emails, phones, Aadhaar, PAN, card numbers and IPs before text leaves the browser
- Audit log + Analytics dashboard (latency, success rate, tokens, languages, domains, models), CSV export
- Batch translation (txt/csv/json -> CSV/JSON), Model Arena with AI judge, glossary compliance check
- Command palette (Ctrl+K), presets, custom instructions, share links, print/PDF, diagnostics panel
- Accessibility: skip link, ARIA labels, text size, high contrast
- Engineering: pure helpers in js/lib.js with unit tests, CI template, architecture/security docs
## 2.0.0
- Multi-provider key detection, Fast/Agentic/Deep modes, OCR/PDF, live interpreter, PWA
## 1.0.0
- Initial agentic translator on Groq
