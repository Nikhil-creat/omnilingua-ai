# Changelog
## 4.2.0
- Project renamed to **Translator AI** (repo `translator-ai`, site https://nikhil-creat.github.io/translator-ai/); all URLs, metadata, share card, docs and file names updated
- Internal storage keys are unchanged, so saved settings, history and glossary carry over
## 4.1.0
- Full site shell: sticky header with scroll-spy menu, animated hero with live translation preview, feature grid, how-it-works, tech stack, projects, About the developer, FAQ, contact form, footer
- Developer branding: "Designed & developed by NIKHIL CHARY SRIRAMOJU" in hero, About, footer, 404 page and social preview image
- SEO and sharing: Open Graph/Twitter cards, JSON-LD (Person + SoftwareApplication), canonical URL, robots.txt, sitemap.xml, og.png
- Save-contact vCard, legal dialogs (Privacy, Terms, AI disclaimer), back-to-top, branded 404 page
- Mobile: workspace toolbar no longer sticks on small screens, hamburger menu
## 4.0.0
- Edge AI mode: translate with the browser's built-in on-device Translator + LanguageDetector (no key, no data leaves the device) where supported
- Neural semantic glossary search (transformers.js, on-device MiniLM embeddings), blended with the n-gram index
- AI Vision OCR via multimodal models (handwriting, complex scripts) with automatic fallback to Tesseract
- Face-to-face interpreter (two-way voice) and Live captions with screen wake-lock
- MQM quality audit with one-tap fixes; terminology mining into the translation memory
- Passphrase vault lock (PBKDF2 250k + AES-GCM), lock-now and 10-minute idle auto-lock
- Animated agent-flow visualisation, pointer spotlight, optional sound/haptics
- PWA share target (share text from other apps) + home-screen shortcuts; workspace backup/restore; WhatsApp share
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
