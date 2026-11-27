# Devpost Submission Package — Open Agentic Web Challenge

> **Hackathon:** Open Agentic Web Challenge (https://cognizant-agenticweb.devpost.com/)
> **Live URL:** https://furkanorbeyi.github.io/para/
> **GitHub Repo:** https://github.com/furkanorbeyi/para

---

## Project Title
**ClauseMesh — Open Agentic Web Contract Guardian (MVP 0.3)**

## Tagline (Short Description)
A zero-backend, browser-native 5-agent Open Agentic Web (MVP Profile 0.3) app that audits contracts and Terms of Service for hidden legal & financial traps—and drafts fair counter-clauses privately in your browser.

## Full Devpost Description (Copy & Paste)

### Inspiration
Millions of freelancers, tenants, and everyday consumers sign contracts and Terms of Service containing predatory IP grabs, unlimited liability, Net-90 pay-when-paid delays, data-selling licenses, and silent auto-renewals—simply because legal review is expensive and uploading private contracts to closed AI SaaS servers creates severe privacy risks.

### What It Does
**ClauseMesh** is a fully open, static-hosted **Open Agentic Website** conforming strictly to **Worldwide Agentic Web MVP Profile 0.3**. It executes a **5-agent Neuro SAN network** directly inside the user's browser with zero backend and zero data retention:
1. **Coordinator (`clausemesh_coordinator` — `front_man`)**: Entry agent that validates inputs, enforces bounded execution limits, and orchestrates downstream agents.
2. **Intake Agent (`intake_agent`)**: Segments clauses, classifies document type and language (English & Turkish), and passes only explicitly allowed `sly_data` fields downstream.
3. **Legal Risk Agent (`legal_risk_agent`)**: Runs in parallel to detect overbroad IP assignment, unlimited liability, broad non-competes, unilateral modification rights, unrestricted data monetization / AI training licenses, forced arbitration, and silent auto-renewals.
4. **Financial Exposure Agent (`financial_agent`)**: Runs in parallel to audit delayed payment terms (Net-60/90/120, pay-when-paid), non-refundable penalties, liquidated damages, uncapped rent/fee escalations, and unlimited free revisions.
5. **Negotiation Agent (`negotiation_agent`)**: Synthesizes both upstream agents into a 0–100 risk score, highlights positive/fair clauses (preventing false positives on balanced contracts), generates copy-ready fair counter-clauses, and drafts a complete ready-to-send negotiation email + downloadable `.md`/`.json` report.

### Open Agentic Web (MVP Profile 0.3) Architecture
- **Public Portable Artifacts (CORS-enabled HTTPS):**
  - `/agent-manifest.json` — Declares `spec_version: "0.3"`, `networks[]` (`name`, `front_man`, `hocon`), `peer_policy`, and `llm` router metadata.
  - `/clausemesh.network.json` — Portable Neuro SAN HOCON-JSON network definition (`metadata`, `tools[]`, `sly_data_policy: deny-by-default`).
  - `/links.json` — Published peer-network link map (`version: 1`).
  - `/.well-known/agent-facts.json` — MIT NANDA-compatible verifiable AgentFacts descriptor.
- **Client-Side Browser Runtime (`window.OpenAgenticWeb`):** Parses and validates the Neuro SAN graph before execution, enforces bounded invocations, and supports **Section 3.2 Peer Agent Site Loading** with explicit cross-origin user consent and fail-closed verification.
- **BYOK + Zero-Key Instant Mode:** Visitors can connect their own OpenAI-compatible LLM router (Mozilla Otari, OpenAI, OpenRouter) to run the specialist agents with their Neuro SAN `instructions`—keys never leave the browser and are sent only to the visitor's chosen router. For instant evaluation without an API key, a built-in bilingual deterministic engine runs locally.

### Social Good Impact
Democratizes contract literacy and fair negotiation leverage for freelancers, tenants, and consumers worldwide at zero cost and zero server-side data exposure.
