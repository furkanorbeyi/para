# Devpost Submission Package — Open Agentic Web Challenge

> **Hackathon:** Open Agentic Web Challenge (https://cognizant-agenticweb.devpost.com/)
> **Deadline:** January 11, 2027 (8:00 PM PT)
> **Prize Pool:** 10,000 USD Cash (1st: 5,000 USD, 2nd: 3,000 USD, 3rd: 2,000 USD) + Mozilla Otari Credits

---

## Project Title
**ClauseMesh — Open Agentic Web Multi-Agent Contract Guardian**

## Tagline (Short Description)
A zero-backend, browser-native 4-agent Open Agentic Web app that audits contracts and Terms of Service for hidden legal & financial traps—and drafts fair counter-clauses privately in your browser.

## Full Devpost Description (Copy & Paste)

### Inspiration
Millions of freelancers, tenants, and everyday consumers sign contracts and Terms of Service containing predatory IP grabs, unlimited liability, Net-90 pay-when-paid clauses, and silent auto-renewals—simply because legal review is expensive and uploading private contracts to closed AI SaaS platforms raises serious privacy concerns.

### What It Does
**ClauseMesh** is a fully open, static-hosted **Open Agentic Website** that executes a **4-agent declarative DAG** directly inside the user's browser:
1. **Intake Agent (`intake_agent`)**: Segments clauses, classifies the document type, and extracts monetary references.
2. **Legal Risk Agent (`legal_risk_agent`)**: Runs in parallel to detect overbroad IP assignment, unlimited liability, broad non-competes, unilateral modification rights, forced arbitration, and auto-renewal traps.
3. **Financial Exposure Agent (`financial_agent`)**: Runs in parallel to audit delayed payment terms (Net-60/90), forfeiture penalties, liquidated damages, and uncapped fee escalations.
4. **Negotiation Agent (`negotiation_agent`)**: Synthesizes both upstream agents into a 0–100 risk score, plain-English executive summary, and copy-ready fair counter-clauses.

### Open Agentic Web Architecture
- Exposes public `/agent-manifest.json`, `/agent-network.json`, and `/.well-known/agent-facts.json` (NANDA AgentFacts compatible).
- Runs a **100% client-side browser runtime** (`window.OpenAgenticWeb`) so both humans and visiting browser agents can invoke `analyze_contract` programmatically.
- Supports **BYOK** (Mozilla Otari, OpenRouter, OpenAI, or any OpenAI-compatible router) with keys stored only in browser memory/localStorage—plus a **zero-key deterministic fallback engine** for instant, private testing.

### Social Good Impact
Democratizes contract literacy and negotiation leverage for individuals worldwide at zero cost and zero data retention.

---

## 2-Minute YouTube Demo Video Script (Checklist)
1. **0:00–0:20** — Open the deployed public URL. Show the "Open Agentic Web Ready" badge and explain the problem (predatory contracts + privacy).
2. **0:20–0:55** — Click **"Load Sample: Predatory Freelance Contract"** and click **"Run 4-Agent Network"**. Record the live SVG DAG lighting up (`Intake` -> parallel `Legal` + `Financial` -> `Negotiation`) and the Inter-Agent Message Trace streaming in real time.
3. **0:55–1:25** — Scroll through the **Audit Report**: Risk Score, Critical/High Red Flags, Financial Traps, and Fair Counter-Clauses. Click **Export .md**.
4. **1:25–1:50** — Click the **Open Agentic Web Spec Inspector** tabs (`agent-manifest.json`, `agent-network.json`, `.well-known/agent-facts.json`) and mention BYOK support (Mozilla Otari / OpenAI-compatible) + `window.OpenAgenticWeb.invoke()`.
5. **1:50–2:00** — Closing: "100% static, MIT open source, zero data leaves your browser."
