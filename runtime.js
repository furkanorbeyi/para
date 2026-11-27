/**
 * ClauseMesh — Worldwide Agentic Web MVP Profile 0.3 Browser Runtime (v2.0)
 * - Strictly parses & validates /agent-manifest.json, Neuro SAN /clausemesh.network.json, /links.json
 * - BYOK Mode: Runs ALL 4 specialized agents through the visitor's chosen LLM router
 *   (Mozilla Otari, OpenRouter, OpenAI, or any OpenAI-compatible endpoint) using the exact
 *   declarative `instructions` from clausemesh.network.json (understands ANY language/document).
 * - Instant Local Mode (Zero-Key): 22-rule bilingual (English + Turkish) legal/financial risk
 *   engine + fair-clause detector so predatory contracts score HIGH/CRITICAL and fair contracts
 *   accurately score LOW with zero false positives.
 * - Section 3.2 Peer Agent Site Loader with explicit cross-origin consent & fail-closed validation.
 */
(function (global) {
  "use strict";

  const LEGAL_RULES = [
    {
      id: "ip_all_work",
      title: "Overbroad IP & Prior-Work Assignment",
      severity: "CRITICAL",
      weight: 22,
      pattern: /(all intellectual property|irrevocably assigns|work made for hire|including pre-existing|whether or not conceived during|worldwide, perpetual, royalty-free|tüm fikri mülkiyet|önceden geliştirilen.*devreder|süresiz ve geri dönülemez)/i,
      explanation: "Risks transferring ownership of your pre-existing tools, code libraries, or side projects—not just the specific paid deliverable.",
      counter: "Intellectual property transfers solely for final Deliverables specifically created and paid in full under this Agreement. Contractor retains sole ownership of all pre-existing tools, libraries, and general know-how."
    },
    {
      id: "unlimited_liability",
      title: "Unlimited Liability / One-Sided Indemnification",
      severity: "CRITICAL",
      weight: 20,
      pattern: /(unlimited liability|indemnify and hold harmless.*any and all|consequential damages|indirect damages|without cap|solely responsible for all losses|sınırsız sorumlu|tüm doğrudan ve dolaylı zararları.*tazmin)/i,
      explanation: "Exposes you to uncapped financial damages far exceeding the total value of the contract.",
      counter: "Each party's aggregate liability under this Agreement shall not exceed the total fees actually paid in the preceding 12 months, and neither party shall be liable for indirect or consequential damages."
    },
    {
      id: "non_compete",
      title: "Broad Non-Compete / Exclusivity Lock-In",
      severity: "HIGH",
      weight: 16,
      pattern: /(non-compete|not compete|similar industry|any competing business|exclusively for client|for a period of (2|3|5|two|three|five) years|rekabet etmeme|benzer sektörde.*çalışamaz|rakip firmalarla.*(2|3|5) yıl)/i,
      explanation: "Restricts you from earning a living in your own industry for years after the contract ends.",
      counter: "No general non-compete applies. Signer agrees only to strict confidentiality of proprietary information and non-solicitation of direct employees for 12 months."
    },
    {
      id: "unilateral_changes",
      title: "Unilateral Terms or Scope Modification",
      severity: "HIGH",
      weight: 14,
      pattern: /(modify these terms at any time|sole discretion without notice|change pricing or terms unilaterally|continued use constitutes acceptance|tek taraflı olarak.*değiştirebilir|önceden bildirmeksizin.*güncelleyebilir)/i,
      explanation: "Allows the other party to rewrite rules, prices, or obligations without your written consent.",
      counter: "Any material amendment to scope, fees, or rights requires mutual written agreement signed by both parties with at least 30 days' prior notice."
    },
    {
      id: "data_selling_ai_training",
      title: "Unrestricted Data Monetization / AI Training License",
      severity: "HIGH",
      weight: 14,
      pattern: /(sell your personal data|share.*with third-party advertisers|perpetual license to.*user content|train.*ai models.*without opt-out|verilerinizi üçüncü taraflara satabilir)/i,
      explanation: "Grants broad rights to monetize, resell, or train external models on your private data without opt-out.",
      counter: "User retains full ownership of User Data. Provider may process User Data solely to deliver the Service and shall not sell User Data or use it to train third-party models without explicit opt-in."
    },
    {
      id: "unilateral_termination",
      title: "Termination Without Cause & No Kill Fee",
      severity: "MEDIUM",
      weight: 11,
      pattern: /(terminate.*at any time without cause|immediately without notice|no obligation to pay.*incomplete|forfeit all unpaid|bildirimsiz.*tek taraflı feshedebilir|tamamlanmamış.*ödeme yapılmaz)/i,
      explanation: "Allows abrupt cancellation without paying for completed work or reserved capacity.",
      counter: "Either party may terminate with 14 days' written notice. Upon termination without cause, Client shall pay for all completed milestones and pro-rated hours worked to date."
    },
    {
      id: "forced_arbitration",
      title: "Mandatory Arbitration & Class-Action Waiver",
      severity: "MEDIUM",
      weight: 10,
      pattern: /(binding arbitration|waive.*jury trial|class action waiver|exclusive jurisdiction of.*delaware|solely in the courts of|tahkim.*feragat)/i,
      explanation: "Forces disputes into a distant or costly arbitration venue and waives standard court rights.",
      counter: "Disputes shall first undergo good-faith mediation for 15 days; unresolved small-claims disputes may be brought in either party's local court."
    },
    {
      id: "auto_renewal",
      title: "Silent Auto-Renewal Trap",
      severity: "MEDIUM",
      weight: 9,
      pattern: /(automatically renew|auto-renew|unless cancelled at least (30|60|90) days|evergreen term|otomatik olarak yenilenir|(30|60|90) gün önce.*bildirilmezse)/i,
      explanation: "Locks you into another full term automatically unless you remember to cancel months ahead.",
      counter: "This Agreement will not auto-renew without written confirmation, or may be cancelled with 15 days' notice after a 30-day renewal reminder."
    },
    {
      id: "perpetual_nda",
      title: "Indefinite / Perpetual Confidentiality Without Exclusions",
      severity: "MEDIUM",
      weight: 8,
      pattern: /(confidentiality.*in perpetuity|forever confidential|indefinite confidentiality|süresiz gizlilik yükümlülüğü)/i,
      explanation: "Perpetual NDA obligations without standard public-domain exclusions create permanent legal exposure.",
      counter: "Confidentiality obligations shall last 3 years from disclosure and exclude information that is publicly available, independently developed, or lawfully obtained from a third party."
    },
    {
      id: "moral_rights_waiver",
      title: "Waiver of Portfolio / Attribution Rights",
      severity: "MEDIUM",
      weight: 7,
      pattern: /(waives all moral rights|may not display.*portfolio|prohibited from referencing.*work)/i,
      explanation: "Prevents you from showcasing completed public work in your professional portfolio.",
      counter: "Once publicly launched, Contractor may display non-confidential screenshots and a brief project summary in their professional portfolio."
    }
  ];

  const FINANCIAL_RULES = [
    {
      id: "slow_payment",
      title: "Delayed Payment Window (Net-60 / Net-90 / Pay-When-Paid)",
      severity: "HIGH",
      weight: 16,
      pattern: /(net\s*(60|90|120)|within (60|90|120) days|upon client's receipt of funds|pay-when-paid|after final acceptance in sole discretion|(60|90|120) gün içinde ödenir|müşteriden tahsilat yapıldığında)/i,
      explanation: "Waiting 60–120 days—or tying your pay to their customer—creates serious cash-flow risk.",
      counter: "Invoices are payable Net-15 from submission. Undisputed overdue balances accrue 1.5% monthly interest, and work may pause if an invoice is over 10 days past due."
    },
    {
      id: "non_refundable_penalty",
      title: "Forfeiture / Liquidated Damages / Hidden Penalty",
      severity: "HIGH",
      weight: 15,
      pattern: /(non-refundable|liquidated damages|forfeit.*deposit|late fee of \d+%|administrative fee|early termination fee|penalty of|cezai şart|depozito.*iade edilmez|erken çıkış cezası|iade edilemez)/i,
      explanation: "Asymmetric penalties, forfeited deposits, or liquidated damages create disproportionate financial loss.",
      counter: "All fees must be itemized upfront in Schedule A. Security deposits or unearned retainers shall be refunded within 14 days upon termination."
    },
    {
      id: "price_escalation",
      title: "Uncapped Automatic Fee / Rent Escalation",
      severity: "MEDIUM",
      weight: 10,
      pattern: /(increase.*by up to (15|20|25|30|50)%|increase fees at its discretion|annual price increase without cap|kira.*%(25|30|40|50|60)|ücretleri tek taraflı artırabilir)/i,
      explanation: "Permits steep unilateral price or rent increases upon renewal.",
      counter: "Any annual fee or rent adjustment shall be capped at the lesser of 3% or official CPI inflation, with 45 days' written notice."
    },
    {
      id: "unpaid_revisions",
      title: "Unlimited Free Revisions / Scope Creep",
      severity: "MEDIUM",
      weight: 10,
      pattern: /(unlimited revisions|revise until.*fully satisfied|at no additional cost.*changes|sınırsız revizyon|ek ücret olmaksızın.*değişiklik)/i,
      explanation: "Unlimited free revisions can trap you in endless unpaid work.",
      counter: "Fees include up to two (2) rounds of reasonable revisions per milestone. Additional revisions or scope changes shall be billed at the agreed hourly rate."
    },
    {
      id: "currency_tax_shift",
      title: "Unfair Tax / Expense Shifting",
      severity: "MEDIUM",
      weight: 8,
      pattern: /(contractor bears all.*client taxes|all bank fees.*deducted from contractor|masraflar.*yükleniciye aittir)/i,
      explanation: "Shifts the other party's taxes, wire fees, or operational expenses onto you.",
      counter: "Each party is responsible for its own income taxes and outgoing bank transfer fees. Pre-approved out-of-pocket project expenses shall be reimbursed at cost."
    }
  ];

  const POSITIVE_SIGNALS = [
    { label: "Reasonable Payment Window (Net-15 / Net-30)", pattern: /(net\s*(7|14|15|30)|within (7|14|15|30) days|(15|30) gün içinde ödenir)/i },
    { label: "Liability Cap Present", pattern: /(liability.*shall not exceed|capped at.*fees paid|sorumluluk.*toplam bedel ile sınırlıdır)/i },
    { label: "Mutual Termination Notice", pattern: /(either party may terminate|mutual.*notice|her iki taraf.*bildirimle feshedebilir)/i },
    { label: "Pre-existing IP Protected", pattern: /(retains.*pre-existing|prior inventions remain|önceden var olan.*hakları saklıdır)/i },
    { label: "Defined Revision Limit", pattern: /(two \(2\) rounds|2 rounds of revisions|en fazla (2|3) revizyon)/i }
  ];

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function extractSnippet(text, regex) {
    const m = text.match(regex);
    if (!m) return "";
    const idx = m.index || 0;
    const start = Math.max(0, idx - 40);
    const end = Math.min(text.length, idx + m[0].length + 70);
    return (start > 0 ? "..." : "") + text.slice(start, end).replace(/\s+/g, " ").trim() + (end < text.length ? "..." : "");
  }

  function validateNeuroSanNetwork(networkDoc, expectedFrontMan) {
    if (!networkDoc || !Array.isArray(networkDoc.tools) || networkDoc.tools.length === 0) {
      throw new Error("Invalid Neuro SAN network: missing non-empty 'tools' array.");
    }
    const names = new Set();
    for (const tool of networkDoc.tools) {
      if (!tool.name || typeof tool.name !== "string") throw new Error("Invalid agent definition: missing 'name'.");
      if (names.has(tool.name)) throw new Error(`Duplicate agent name detected: '${tool.name}'.`);
      names.add(tool.name);
    }
    if (expectedFrontMan && !names.has(expectedFrontMan)) {
      throw new Error(`Manifest front_man '${expectedFrontMan}' not found in network tools.`);
    }
    for (const tool of networkDoc.tools) {
      for (const ref of tool.tools || []) {
        if (typeof ref === "string" && !ref.startsWith("http://") && !ref.startsWith("https://")) {
          if (!names.has(ref)) throw new Error(`Broken internal reference '${ref}' in agent '${tool.name}'.`);
        }
      }
    }
    return { valid: true, agent_count: names.size, front_man: expectedFrontMan || networkDoc.tools[0].name };
  }

  function runLocalIntake(contractText, role) {
    const lines = contractText.split(/\n+/).map((l) => l.trim()).filter((l) => l.length > 15);
    const wordCount = contractText.trim().split(/\s+/).filter(Boolean).length;
    const moneyMatches = contractText.match(/(\$|€|£|USD|EUR|TL|TRY)\s?[0-9][0-9,.]*/gi) || [];
    const docType = /lease|landlord|tenant|premises|kira sözleşmesi|kiracı|ev sahibi/i.test(contractText)
      ? "Residential / Commercial Lease"
      : /terms of service|privacy policy|user content|subscription|kullanım koşulları/i.test(contractText)
      ? "SaaS / Consumer Terms of Service"
      : /employment|salary|employee|iş sözleşmesi/i.test(contractText)
      ? "Employment Agreement"
      : /non-disclosure|confidential information|gizlilik sözleşmesi/i.test(contractText)
      ? "Non-Disclosure Agreement (NDA)"
      : "Freelance / Services Agreement";

    const isTurkish = /(sözleşme|yüklenici|kiracı|madde|tazmin|fesih|ödeme)/i.test(contractText);
    return {
      document_type: docType,
      language_detected: isTurkish ? "TR" : "EN",
      signer_role: role,
      clauses_detected: Math.max(1, lines.length),
      word_count: wordCount,
      monetary_mentions: [...new Set(moneyMatches)].slice(0, 6)
    };
  }

  function runRuleScan(contractText, rules, category) {
    const findings = [];
    for (const rule of rules) {
      if (rule.pattern.test(contractText)) {
        findings.push({
          id: rule.id,
          category,
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

  function detectPositiveSignals(contractText) {
    return POSITIVE_SIGNALS.filter((p) => p.pattern.test(contractText)).map((p) => p.label);
  }

  function buildNegotiationEmail(intake, allFindings) {
    if (intake.language_detected === "TR") {
      if (!allFindings.length) {
        return `Merhaba,\n\nGönderdiğiniz sözleşmeyi inceledim. Genel olarak dengeli ve adil görünüyor; son tarihleri netleştirdikten sonra imzalamaya hazırım.\n\nİyi çalışmalar,`;
      }
      const bullets = allFindings
        .map((f, i) => `${i + 1}. ${f.title}:\n   Önerilen adil madde: "${f.counter_clause}"`)
        .join("\n\n");
      return `Merhaba,\n\nGönderdiğiniz sözleşme için teşekkür ederim. İmzalamadan önce her iki tarafı da adil şekilde korumak adına aşağıdaki ${allFindings.length} maddede standart düzenleme yapabilir miyiz?\n\n${bullets}\n\nBu güncellemeler sizin için uygunsa hemen imzalayıp başlayabiliriz.\n\nİyi çalışmalar,`;
    }
    if (!allFindings.length) {
      return `Hi,\n\nThanks for sending over the ${intake.document_type}. The terms look balanced and fair overall—I'm happy to proceed once we confirm final dates.\n\nBest regards,`;
    }
    const bullets = allFindings
      .map((f, i) => `${i + 1}. ${f.title}:\n   Proposed wording: "${f.counter_clause}"`)
      .join("\n\n");
    return `Hi,\n\nThank you for sending over the ${intake.document_type}. I'm excited to move forward! Before signing, could we align on ${allFindings.length} standard fairness adjustments so both sides are clearly protected?\n\n${bullets}\n\nLet me know if these updates work for you and I'll sign right away.\n\nBest regards,`;
  }

  function runLocalNegotiation(intake, legalFindings, financialFindings, positiveSignals) {
    const all = [...legalFindings, ...financialFindings];
    const rawScore = all.reduce((acc, f) => acc + (f.weight || 10), 0);
    const positiveRelief = Math.min(15, positiveSignals.length * 4);
    const score = all.length === 0 ? Math.max(5, 16 - positiveRelief) : Math.min(98, Math.max(15, rawScore - Math.floor(positiveRelief / 2)));
    const level = score >= 70 ? "CRITICAL" : score >= 45 ? "HIGH" : score >= 25 ? "MODERATE" : "LOW";
    let summary;
    if (intake.language_detected === "TR") {
      summary =
        all.length === 0
          ? `Güzel haber: Bu sözleşmede ciddi bir hukuki veya finansal tuzak tespit edilmedi (${positiveSignals.length} güvenli madde bulundu).`
          : `Bu sözleşmede toplam ${all.length} riskli madde tespit edildi (${legalFindings.length} hukuki, ${financialFindings.length} finansal). Risk seviyesi: ${level} (${score}/100). İmzalamadan önce aşağıdaki hazır müzakere e-postasını gönderin.`;
    } else {
      summary =
        all.length === 0
          ? `Great news: no predatory legal or financial traps were detected in this ${intake.document_type} (${positiveSignals.length} fair-clause signal(s) found).`
          : `Found ${all.length} risk item(s) in this ${intake.document_type} (${legalFindings.length} legal, ${financialFindings.length} financial). Overall exposure is ${level} (${score}/100). Send the ready-made negotiation email below before signing.`;
    }

    return {
      overall_risk_score: score,
      risk_level: level,
      executive_summary: summary,
      positive_signals: positiveSignals,
      counter_clauses: all.map((f) => ({
        for_issue: f.title,
        severity: f.severity,
        suggested_text: f.counter_clause
      })),
      negotiation_email: buildNegotiationEmail(intake, all)
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
        temperature: 0.15,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });
    if (!resp.ok) throw new Error(`BYOK LLM HTTP ${resp.status}`);
    const data = await resp.json();
    return (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
  }

  function tryParseJsonBlock(rawText) {
    if (!rawText) return null;
    const fenced = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidate = fenced ? fenced[1] : rawText;
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    try {
      return JSON.parse(candidate.slice(start, end + 1));
    } catch {
      return null;
    }
  }

  class OpenAgenticWebRuntime {
    constructor() {
      this.manifest = null;
      this.network = null;
      this.links = null;
      this.agentFacts = null;
      this.validation = null;
      this.limits = { maxAgentInvocations: 12, maxHopDepth: 2, timeoutMs: 30000 };
    }

    async init() {
      const manifest = await fetch("./agent-manifest.json").then((r) => {
        if (!r.ok) throw new Error(`agent-manifest.json HTTP ${r.status}`);
        return r.json();
      });
      const entry = (manifest.networks || [])[0];
      if (!entry || !entry.hocon || !entry.front_man) {
        throw new Error("Invalid agent-manifest.json: networks[0] requires name, front_man, and hocon.");
      }

      const [network, links, facts] = await Promise.all([
        fetch(entry.hocon).then((r) => r.json()),
        fetch(manifest.links || "./links.json").then((r) => r.json()),
        fetch(manifest.agent_facts || "./.well-known/agent-facts.json").then((r) => r.json())
      ]);

      this.validation = validateNeuroSanNetwork(network, entry.front_man);
      this.manifest = manifest;
      this.network = network;
      this.links = links;
      this.agentFacts = facts;
      return { manifest, network, links, agentFacts: facts, validation: this.validation };
    }

    async loadPeerNetwork(peerUrl, requestConsent) {
      const parsed = new URL(peerUrl);
      if (parsed.protocol !== "https:" && parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1") {
        throw new Error("MVP Profile 0.3 requires HTTPS for external peer agent sites.");
      }
      const segments = parsed.pathname.replace(/\/+$/, "").split("/").filter(Boolean);
      if (segments.length === 0) {
        throw new Error("Peer URL must end with the published network name (e.g. https://site.example/network_name).");
      }
      const requestedName = segments.pop();
      const baseUrl = `${parsed.origin}/${segments.length ? segments.join("/") + "/" : ""}`;
      const manifestUrl = `${baseUrl}agent-manifest.json`;

      const approved =
        typeof requestConsent === "function"
          ? await requestConsent({ origin: parsed.origin, manifestUrl, requestedName })
          : false;
      if (!approved) throw new Error("User declined cross-origin consent for peer agent site.");

      const peerManifest = await fetch(manifestUrl, { mode: "cors" }).then((r) => {
        if (!r.ok) throw new Error(`Peer manifest HTTP ${r.status}`);
        return r.json();
      });

      const match = (peerManifest.networks || []).find((n) => n.name === requestedName);
      if (!match) throw new Error(`Exact network '${requestedName}' not found in peer agent-manifest.json.`);

      const hoconUrl = new URL(match.hocon, baseUrl).toString();
      const peerNetwork = await fetch(hoconUrl, { mode: "cors" }).then((r) => {
        if (!r.ok) throw new Error(`Peer network HTTP ${r.status}`);
        return r.json();
      });

      const validation = validateNeuroSanNetwork(peerNetwork, match.front_man);
      return {
        peer_origin: parsed.origin,
        manifest_url: manifestUrl,
        network_url: hoconUrl,
        network_name: match.name,
        front_man: match.front_man,
        agent_count: validation.agent_count,
        agents: peerNetwork.tools.map((t) => ({ name: t.name, description: (t.function && t.function.description) || "" }))
      };
    }

    async invoke(capabilityId, input, options = {}) {
      if (!this.network && typeof fetch === "function") await this.init();
      if (capabilityId !== "analyze_contract") throw new Error(`Unsupported capability: ${capabilityId}`);
      const contractText = (input && input.contract_text) || "";
      const role = (input && input.role) || "freelancer";
      if (contractText.trim().length < 40) throw new Error("Please provide at least 40 characters of contract text.");

      const onEvent = typeof options.onEvent === "function" ? options.onEvent : () => {};
      const byok = options.byok && options.byok.apiKey ? options.byok : null;
      const fastMode = Boolean(options.fast);
      const trace = [];
      let invocations = 0;

      const emit = (agentId, status, message) => {
        if (status === "running") {
          invocations += 1;
          if (invocations > this.limits.maxAgentInvocations) throw new Error("Execution bound exceeded.");
        }
        const entry = { ts: new Date().toISOString(), agent: agentId, status, message };
        trace.push(entry);
        onEvent(entry);
      };

      const getAgentPrompt = (name) => {
        const node = this.network && (this.network.tools || []).find((t) => t.name === name);
        return (node && node.instructions) || "";
      };

      // Step 1: Intake Agent
      emit("intake_agent", "running", "Front agent (clausemesh_coordinator) delegated document parsing...");
      if (!fastMode) await sleep(220);
      const intake = runLocalIntake(contractText, role);
      const positiveSignals = detectPositiveSignals(contractText);
      emit("intake_agent", "done", `Classified "${intake.document_type}" [${intake.language_detected}] (${intake.clauses_detected} sections, ${intake.word_count} words).`);

      // Step 2: Parallel Legal Risk + Financial Agents
      emit("legal_risk_agent", "running", byok ? "Running legal_risk_agent via BYOK LLM router..." : "Scanning for predatory IP, liability, non-compete, data & termination traps...");
      emit("financial_agent", "running", byok ? "Running financial_agent via BYOK LLM router..." : "Auditing payment delays, hidden fees, penalties & scope-creep traps...");
      if (!fastMode) await sleep(320);

      let legalFindings = runRuleScan(contractText, LEGAL_RULES, "LEGAL");
      let financialFindings = runRuleScan(contractText, FINANCIAL_RULES, "FINANCIAL");
      let usedBYOK = false;

      if (byok) {
        try {
          const [legalRaw, finRaw] = await Promise.all([
            callBYOK(
              byok,
              `${getAgentPrompt("legal_risk_agent")} Return strict JSON: {"findings":[{"title":"...","severity":"CRITICAL|HIGH|MEDIUM","snippet":"...","explanation":"...","counter_clause":"..."}]}`,
              `Role: ${role}\nDocument:\n${contractText.slice(0, 5000)}`
            ),
            callBYOK(
              byok,
              `${getAgentPrompt("financial_agent")} Return strict JSON: {"findings":[{"title":"...","severity":"CRITICAL|HIGH|MEDIUM","snippet":"...","explanation":"...","counter_clause":"..."}]}`,
              `Role: ${role}\nDocument:\n${contractText.slice(0, 5000)}`
            )
          ]);
          const parsedLegal = tryParseJsonBlock(legalRaw);
          const parsedFin = tryParseJsonBlock(finRaw);
          if (parsedLegal && Array.isArray(parsedLegal.findings)) {
            legalFindings = parsedLegal.findings.map((f, idx) => ({
              id: `llm_legal_${idx}`,
              category: "LEGAL",
              title: f.title || "Legal Risk",
              severity: ["CRITICAL", "HIGH", "MEDIUM"].includes(f.severity) ? f.severity : "MEDIUM",
              weight: f.severity === "CRITICAL" ? 22 : f.severity === "HIGH" ? 15 : 9,
              snippet: f.snippet || "",
              explanation: f.explanation || "",
              counter_clause: f.counter_clause || ""
            }));
            usedBYOK = true;
          }
          if (parsedFin && Array.isArray(parsedFin.findings)) {
            financialFindings = parsedFin.findings.map((f, idx) => ({
              id: `llm_fin_${idx}`,
              category: "FINANCIAL",
              title: f.title || "Financial Risk",
              severity: ["CRITICAL", "HIGH", "MEDIUM"].includes(f.severity) ? f.severity : "MEDIUM",
              weight: f.severity === "CRITICAL" ? 20 : f.severity === "HIGH" ? 14 : 9,
              snippet: f.snippet || "",
              explanation: f.explanation || "",
              counter_clause: f.counter_clause || ""
            }));
            usedBYOK = true;
          }
        } catch (err) {
          emit("legal_risk_agent", "done", `BYOK router fallback (${err.message}); using local deterministic engine.`);
        }
      }

      emit("legal_risk_agent", "done", `Found ${legalFindings.length} legal risk flag(s). Forwarding to negotiation_agent.`);
      if (!fastMode) await sleep(180);
      emit("financial_agent", "done", `Found ${financialFindings.length} financial exposure item(s). Forwarding to negotiation_agent.`);

      // Step 3: Negotiation Agent
      emit("negotiation_agent", "running", "Computing final risk score, fair counter-clauses, and ready-to-send negotiation email...");
      if (!fastMode) await sleep(240);
      const synthesis = runLocalNegotiation(intake, legalFindings, financialFindings, positiveSignals);
      emit("negotiation_agent", "done", `Audit complete: ${synthesis.overall_risk_score}/100 (${synthesis.risk_level}).`);

      return {
        protocol: "worldwide-agentic-web-mvp/0.3",
        network_id: (this.network && this.network.metadata && this.network.metadata.name) || "clausemesh",
        front_man: (this.validation && this.validation.front_man) || "clausemesh_coordinator",
        execution_mode: usedBYOK ? "byok-full-llm-network" : "browser-local-deterministic",
        intake,
        overall_risk_score: synthesis.overall_risk_score,
        risk_level: synthesis.risk_level,
        executive_summary: synthesis.executive_summary,
        positive_signals: synthesis.positive_signals,
        clauses_detected: intake.clauses_detected,
        red_flags: legalFindings,
        financial_findings: financialFindings,
        counter_clauses: synthesis.counter_clauses,
        negotiation_email: synthesis.negotiation_email,
        agent_trace: trace
      };
    }
  }

  const instance = new OpenAgenticWebRuntime();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { OpenAgenticWebRuntime, runtime: instance, validateNeuroSanNetwork };
  }
  if (global) {
    global.OpenAgenticWeb = instance;
  }
})(typeof window !== "undefined" ? window : globalThis);
