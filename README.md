# ClauseMesh — Open Agentic Web Contract Guardian

**ClauseMesh** is a zero-backend, browser-native multi-agent web application built for the **Open Agentic Web Challenge** (Cognizant AI Lab + MIT Media Lab NANDA + Mozilla).

It protects freelancers, consumers, tenants, and founders from predatory clauses in contracts, leases, and Terms of Service using a **4-agent declarative DAG network** that runs 100% inside the user's browser.

## Open Agentic Web Compliance
- **`/agent-manifest.json`** — Public capability manifest & input/output JSON schemas.
- **`/agent-network.json`** — Declarative 4-agent DAG (`intake_agent` -> `legal_risk_agent` & `financial_agent` -> `negotiation_agent`).
- **`/.well-known/agent-facts.json`** — MIT NANDA-compatible verifiable AgentFacts descriptor.
- **`window.OpenAgenticWeb`** — Client-side browser runtime callable by humans and external browser agents (`await window.OpenAgenticWeb.invoke("analyze_contract", { contract_text })`).
- **BYOK + Zero-Key Fallback** — Supports Mozilla Otari, OpenRouter, OpenAI, or any OpenAI-compatible router directly from the browser, plus a deterministic local risk engine so judges can test with zero API keys.

## Run Locally
```bash
python -m http.server 8080
```
Open `http://localhost:8080`.

## Free Public Deployment (1 Command)
Deploy directly to **Vercel**, **Cloudflare Pages**, or **GitHub Pages** as a pure static site (zero build step, zero server cost).
