/**
 * ClauseMesh — Open Agentic Web Client-Side Browser Runtime
 * Loads declarative /agent-manifest.json, /agent-network.json, and /.well-known/agent-facts.json
 * Executes the 4-agent DAG in-browser using either:
 *   (A) BYOK OpenAI-compatible LLM endpoint (Mozilla Otari, OpenRouter, OpenAI, Custom)
 *   (B) Deterministic Local Multi-Agent Risk Engine (Zero-Key Instant Mode)
 *
 * Exposes `window.OpenAgenticWeb` for external browser agents & WebMCP interoperability.
 */
(function (global) {
  "use strict";

  const LEGAL_RULES = [
    {
      id: "ip_all_work",
      title: "Overbroad IP & Prior-Work Assignment",
      severity: "CRITICAL",
      weight: 22,
      pattern: /(all intellectual property|irrevocably assigns|work made for hire|including pre-existing|whether or not conceived during|worldwide, perpetual, royalty-free)/i,
      explanation: "This clause risks transferring ownership of your pre-existing tools, side projects, or reusable libraries—not just the specific deliverable.",
      counter: "Intellectual property transfer applies solely to final Deliverables specifically created and paid for in full under this Agreement. Contractor retains sole ownership of all pre-existing tools, libraries, and general know-how."
    },
    {
      id: "unlimited_liability",
      title: "Unlimited Liability / One-Sided Indemnification",
      severity: "CRITICAL",
      weight: 20,
      pattern: /(unlimited liability|indemnify and hold harmless.*any and all|consequential damages|indirect damages|without cap|solely responsible for all losses)/i,
      explanation: "You could be held financially liable for damages far exceeding the value of the contract, including third-party claims outside your control.",
      counter: "Each party's aggregate liability under this Agreement shall not exceed the total fees actually paid under this Agreement in the preceding 12 months, and neither party shall be liable for indirect or consequential damages."
    },
    {
      id: "non_compete",
      title: "Broad Non-Compete / Exclusivity Lock-In",
      severity: "HIGH",
      weight: 16,
      pattern: /(non-compete|not compete|similar industry|any competing business|exclusively for client|for a period of (2|3|5|two|three|five) years)/i,
      explanation: "Restricting you from working in an entire industry for years can block your livelihood after the contract ends.",
      counter: "No general non-compete applies. Contractor agrees only to strict confidentiality of Client's proprietary information and non-solicitation of Client's direct employees for 12 months."
    },
    {
      id: "unilateral_changes",
      title: "Unilateral Modification Right",
      severity: "HIGH",
      weight: 14,
      pattern: /(modify these terms at any time|sole discretion without notice|change pricing or terms unilaterally|continued use constitutes acceptance)/i,
      explanation: "The other party can rewrite prices, rules, or rights at any time without your explicit consent.",
      counter: "Any material amendment to scope, fees, or rights requires mutual written agreement signed by both parties with at least 30 days' prior notice."
    },
    {
      id: "unilateral_termination",
      title: "Termination Without Cause & No Kill Fee",
      severity: "MEDIUM",
      weight: 11,
      pattern: /(terminate.*at any time without cause|immediately without notice|no obligation to pay.*incomplete|forfeit all unpaid)/i,
      explanation: "They can cancel mid-project without paying for work already completed or reserved capacity.",
      counter: "Either party may terminate with 14 days' written notice. Upon termination without cause, Client shall pay for all completed milestones and pro-rated hours worked up to the termination date."
    },
    {
      id: "forced_arbitration",
      title: "Mandatory Arbitration & Class-Action Waiver",
      severity: "MEDIUM",
      weight: 10,
      pattern: /(binding arbitration|waive.*jury trial|class action waiver|exclusive jurisdiction of.*delaware|solely in the courts of)/i,
      explanation: "Forces disputes into a potentially expensive, distant venue and waives standard court remedies.",
      counter: "Disputes shall first be addressed through good-faith mediation within 15 days; unresolved claims under small-claims thresholds may be brought in either party's local small-claims court."
    },
    {
      id: "auto_renewal",
      title: "Silent Auto-Renewal Trap",
      severity: "MEDIUM",
      weight: 9,
      pattern: /(automatically renew|auto-renew|unless cancelled at least (60|90) days|evergreen term)/i,
      explanation: "Locks you into another full term unless you remember to cancel months in advance.",
      counter: "This Agreement will not auto-renew without written confirmation, or if renewed, may be cancelled with 15 days' notice and a reminder sent 30 days prior."
    }
  ];

  const FINANCIAL_RULES = [
    {
      id: "slow_payment",
      title: "Delayed Payment Window (Net-60 / Net-90 / Pay-When-Paid)",
      severity: "HIGH",
      weight: 14,
      pattern: /(net\s*(60|90|120)|within (60|90) days|upon client's receipt of funds|pay-when-paid|after final acceptance in sole discretion)/i,
      explanation: "Waiting 60–90 days—or tying your payout to their downstream customer—creates severe cash-flow risk.",
      counter: "Invoices are payable Net-15 from submission. Undisputed overdue balances accrue 1.5% monthly interest, and work may pause if an invoice is more than 10 days past due."
    },
    {
      id: "non_refundable_penalty",
      title: "Forfeiture / Liquidated Damages / Hidden Fees",
      severity: "HIGH",
      weight: 13,
      pattern: /(non-refundable|liquidated damages|forfeit.*deposit|late fee of \d+%|administrative fee|early termination fee|penalty of)/i,
      explanation: "Asymmetric penalties or non-refundable fees expose you to disproportionate financial loss.",
      counter: "All fees and potential charges must be itemized upfront in Schedule A. Security deposits or unearned retainers must be refunded within 14 days upon contract conclusion."
    },
    {
      id: "price_escalation",
      title: "Uncapped Automatic Fee Escalation",
      severity: "MEDIUM",
      weight: 9,
      pattern: /(increase.*by up to (15|20|25|30)%|increase fees at its discretion|annual price increase without cap)/i,
      explanation: "Allows steep unilateral price hikes upon renewal.",
      counter: "Any annual fee adjustment shall be capped at the lesser of 3% or CPI inflation, with 45 days' written notice."
    }
  ];

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function extractSnippet(text, regex) {
    const m = text.match(regex);
    if (!m) return "";
    const idx = m.index || 0;
    const start = Math.max(0, idx - 45);
    const end = Math.min(text.length, idx + m[0].length + 75);
    return (start > 0 ? "..." : "") + text.slice(start, end).replace(/\s+/g, " ").trim() + (end < text.length ? "..." : "");
  }

  function runLocalIntake(contractText, role) {
    const lines = contractText
      .split(/\n+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 15);
    const wordCount = contractText.trim().split(/\s+/).filter(Boolean).length;
    const moneyMatches = contractText.match(/(\$|€|£|USD|EUR)\s?[0-9][0-9,.]*/gi) || [];
    const docType = /lease|landlord|tenant|premises/i.test(contractText)
      ? "Residential / Commercial Lease"
      : /terms of service|user content|subscription|account/i.test(contractText)
      ? "SaaS / Consumer Terms of Service"
      : "Freelance / Services Agreement";
    return {
      document_type: docType,
      signer_role: role,
      clauses_detected: Math.max(1, lines.length),
      word_count: wordCount,
      monetary_mentions: [...new Set(moneyMatches)].slice(0, 6)
    };
  }

  function runLocalLegal(contractText) {
    const findings = [];
    for (const rule of LEGAL_RULES) {
      if (rule.pattern.test(contractText)) {
        findings.push({
          id: rule.id,
          category: "LEGAL",
          title: rule.title,
          severity: rule.severity,
          weight: rule.weight,
          snippet: extractSnippet(contractText, rule.pattern),
          explanation: rule.explanation,
          counter_clause: rule.counter
        });
      }
    }
    return findings;
  }

  function runLocalFinancial(contractText) {
    const findings = [];
    for (const rule of FINANCIAL_RULES) {
      if (rule.pattern.test(contractText)) {
        findings.push({
          id: rule.id,
          category: "FINANCIAL",
          title: rule.title,
          severity: rule.severity,
          weight: rule.weight,
          snippet: extractSnippet(contractText, rule.pattern),
          explanation: rule.explanation,
          counter_clause: rule.counter
        });
      }
    }
    return findings;
  }

  function runLocalNegotiation(intake, legalFindings, financialFindings) {
    const all = [...legalFindings, ...financialFindings];
    const rawScore = all.reduce((acc, f) => acc + (f.weight || 10), 0);
    const score = Math.min(98, Math.max(8, rawScore));
    const level = score >= 70 ? "CRITICAL" : score >= 45 ? "HIGH" : score >= 25 ? "MODERATE" : "LOW";
    const summary =
      all.length === 0
        ? `No major predatory patterns detected in this ${intake.document_type}. Still verify deliverables, timeline, and payment dates before signing.`
        : `Detected ${all.length} risk area(s) in this ${intake.document_type} (${legalFindings.length} legal, ${financialFindings.length} financial). Overall exposure is ${level} (${score}/100). Request the fair counter-clauses below before signing.`;

    return {
      overall_risk_score: score,
      risk_level: level,
      executive_summary: summary,
      counter_clauses: all.map((f) => ({
        for_issue: f.title,
        severity: f.severity,
        suggested_text: f.counter_clause
      }))
    };
  }

  async function callBYOK(byok, systemPrompt, userPrompt) {
    const endpoint = (byok.endpoint || "https://api.openai.com/v1/chat/completions").trim();
    const model = (byok.model || "gpt-4o-mini").trim();
    const resp = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${byok.apiKey.trim()}`
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });
    if (!resp.ok) {
      throw new Error(`BYOK LLM HTTP ${resp.status}`);
    }
    const data = await resp.json();
    return (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
  }

  class OpenAgenticWebRuntime {
    constructor() {
      this.manifest = null;
      this.network = null;
      this.agentFacts = null;
    }

    async init() {
      const [m, n, f] = await Promise.all([
        fetch("./agent-manifest.json").then((r) => r.json()),
        fetch("./agent-network.json").then((r) => r.json()),
        fetch("./.well-known/agent-facts.json").then((r) => r.json())
      ]);
      this.manifest = m;
      this.network = n;
      this.agentFacts = f;
      return { manifest: m, network: n, agentFacts: f };
    }

    async invoke(capabilityId, input, options = {}) {
      if (!this.network) await this.init();
      if (capabilityId !== "analyze_contract") {
        throw new Error(`Unsupported capability: ${capabilityId}`);
      }
      const contractText = (input && input.contract_text) || "";
      const role = (input && input.role) || "freelancer";
      if (contractText.trim().length < 40) {
        throw new Error("Please provide at least 40 characters of contract text.");
      }

      const onEvent = typeof options.onEvent === "function" ? options.onEvent : () => {};
      const byok = options.byok && options.byok.apiKey ? options.byok : null;
      const trace = [];
      const emit = (agentId, status, message) => {
        const entry = { ts: new Date().toISOString(), agent: agentId, status, message };
        trace.push(entry);
        onEvent(entry);
      };

      // Step 1: Intake Agent
      emit("intake_agent", "running", "Segmenting clauses and identifying document structure...");
      await sleep(260);
      const intake = runLocalIntake(contractText, role);
      emit("intake_agent", "done", `Identified "${intake.document_type}" (${intake.clauses_detected} sections, ${intake.word_count} words). Dispatching to Legal & Financial agents in parallel.`);

      // Step 2: Parallel Legal Risk + Financial Agents
      emit("legal_risk_agent", "running", "Scanning for predatory IP, liability, termination, and non-compete traps...");
      emit("financial_agent", "running", "Auditing payment delays, hidden fees, penalties, and escalations...");
      await sleep(380);
      const legalFindings = runLocalLegal(contractText);
      emit("legal_risk_agent", "done", `Found ${legalFindings.length} legal risk flag(s). Forwarding to Negotiation Agent.`);
      await sleep(220);
      const financialFindings = runLocalFinancial(contractText);
      emit("financial_agent", "done", `Found ${financialFindings.length} financial exposure item(s). Forwarding to Negotiation Agent.`);

      // Step 3: Negotiation & Synthesis Agent (optional BYOK LLM enhancement)
      emit("negotiation_agent", "running", byok ? "Synthesizing findings via BYOK LLM router..." : "Synthesizing overall risk score and drafting fair counter-clauses...");
      await sleep(320);
      const synthesis = runLocalNegotiation(intake, legalFindings, financialFindings);

      let llmEnhancement = null;
      if (byok) {
        try {
          const negNode = this.network.nodes.find((n) => n.id === "negotiation_agent");
          const prompt = `Signer role: ${role}\nDocument type: ${intake.document_type}\nDetected issues: ${JSON.stringify([...legalFindings, ...financialFindings].map((x) => x.title))}\nContract excerpt:\n${contractText.slice(0, 3500)}\n\nProvide a concise 3-bullet executive negotiation memo in English.`;
          llmEnhancement = await callBYOK(byok, negNode.system_prompt, prompt);
          emit("negotiation_agent", "done", "BYOK LLM negotiation memo completed.");
        } catch (err) {
          emit("negotiation_agent", "done", `BYOK endpoint fallback (${err.message}); using local deterministic synthesis.`);
        }
      } else {
        emit("negotiation_agent", "done", `Audit complete. Risk score: ${synthesis.overall_risk_score}/100 (${synthesis.risk_level}).`);
      }

      return {
        protocol: "open-agentic-web/0.1.0",
        network_id: this.network.network_id,
        execution_mode: byok && llmEnhancement ? "byok-hybrid" : "browser-local-deterministic",
        intake,
        overall_risk_score: synthesis.overall_risk_score,
        risk_level: synthesis.risk_level,
        executive_summary: synthesis.executive_summary,
        llm_memo: llmEnhancement,
        clauses_detected: intake.clauses_detected,
        red_flags: legalFindings,
        financial_findings: financialFindings,
        counter_clauses: synthesis.counter_clauses,
        agent_trace: trace
      };
    }
  }

  global.OpenAgenticWeb = new OpenAgenticWebRuntime();
})(window);
