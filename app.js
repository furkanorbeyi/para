/**
 * ClauseMesh UI Controller (Worldwide Agentic Web MVP Profile 0.3)
 */
(function () {
  "use strict";

  const SAMPLES = {
    freelance: `INDEPENDENT CONTRACTOR AGREEMENT
1. Intellectual Property: Contractor irrevocably assigns to Client worldwide, perpetual, royalty-free ownership of all intellectual property, including pre-existing tools, code libraries, and inventions whether or not conceived during this engagement, as work made for hire.
2. Payment Terms: Client shall pay Contractor Net 90 days upon Client's receipt of funds from its end customer (pay-when-paid). Any incomplete milestone forfeits all unpaid fees.
3. Liability: Contractor accepts unlimited liability and agrees to indemnify and hold harmless Client from any and all claims, indirect damages, and consequential damages without cap.
4. Non-Compete: Contractor shall not compete or work in any similar industry for a period of 3 years following termination.
5. Termination: Client may terminate this agreement at any time without cause and immediately without notice, with no obligation to pay for partially completed work.`,

    saas: `CLOUD SAAS TERMS OF SERVICE
1. Changes to Terms: Company may modify these terms at any time at its sole discretion without notice, and your continued use constitutes acceptance.
2. Billing & Auto-Renewal: Subscriptions automatically renew for an additional 12-month term unless cancelled at least 60 days prior. All payments are non-refundable, and Company may increase fees at its discretion by up to 25% annually.
3. Dispute Resolution: You agree to binding arbitration and waive your right to a jury trial or any class action waiver, under the exclusive jurisdiction of Delaware.`,

    lease: `RESIDENTIAL LEASE AGREEMENT
1. Term & Renewal: This lease will automatically renew for 12 months unless cancelled at least 60 days in advance.
2. Fees & Penalties: Tenant agrees to a non-refundable administrative fee of $450, a late fee of 15% if rent is 2 days late, and an early termination fee equal to 3 months' rent as liquidated damages.
3. Rent Adjustments: Landlord may increase rent by up to 20% upon renewal without cap.
4. Liability: Tenant is solely responsible for all losses and agrees to indemnify and hold harmless Landlord for any and all property claims.`
  };

  const els = {
    specStatus: document.getElementById("specStatus"),
    contractInput: document.getElementById("contractInput"),
    roleSelect: document.getElementById("roleSelect"),
    runBtn: document.getElementById("runBtn"),
    traceList: document.getElementById("traceList"),
    resultsPlaceholder: document.getElementById("resultsPlaceholder"),
    resultsBody: document.getElementById("resultsBody"),
    scoreCircle: document.getElementById("scoreCircle"),
    riskTitle: document.getElementById("riskTitle"),
    execSummary: document.getElementById("execSummary"),
    llmMemoBox: document.getElementById("llmMemoBox"),
    llmMemoText: document.getElementById("llmMemoText"),
    findingsList: document.getElementById("findingsList"),
    countersList: document.getElementById("countersList"),
    exportMdBtn: document.getElementById("exportMdBtn"),
    exportJsonBtn: document.getElementById("exportJsonBtn"),
    specViewer: document.getElementById("specViewer"),
    byokEndpoint: document.getElementById("byokEndpoint"),
    byokModel: document.getElementById("byokModel"),
    byokKey: document.getElementById("byokKey"),
    peerUrlInput: document.getElementById("peerUrlInput"),
    loadPeerBtn: document.getElementById("loadPeerBtn"),
    peerResult: document.getElementById("peerResult")
  };

  let lastResult = null;
  let specBundle = null;

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function resetGraph() {
    ["intake_agent", "legal_risk_agent", "financial_agent", "negotiation_agent"].forEach((id) => {
      const n = document.getElementById(`node-${id}`);
      if (n) n.setAttribute("class", "node-rect");
    });
    ["edge-intake-legal", "edge-intake-fin", "edge-legal-neg", "edge-fin-neg"].forEach((id) => {
      const e = document.getElementById(id);
      if (e) e.setAttribute("class", "edge-line");
    });
  }

  function updateGraph(agentId, status) {
    const node = document.getElementById(`node-${agentId}`);
    if (node) node.setAttribute("class", `node-rect ${status}`);
    if (agentId === "intake_agent" && status === "done") {
      document.getElementById("edge-intake-legal").setAttribute("class", "edge-line active");
      document.getElementById("edge-intake-fin").setAttribute("class", "edge-line active");
    }
    if (agentId === "legal_risk_agent" && status === "done") {
      document.getElementById("edge-intake-legal").setAttribute("class", "edge-line done");
      document.getElementById("edge-legal-neg").setAttribute("class", "edge-line active");
    }
    if (agentId === "financial_agent" && status === "done") {
      document.getElementById("edge-intake-fin").setAttribute("class", "edge-line done");
      document.getElementById("edge-fin-neg").setAttribute("class", "edge-line active");
    }
    if (agentId === "negotiation_agent" && status === "done") {
      document.getElementById("edge-legal-neg").setAttribute("class", "edge-line done");
      document.getElementById("edge-fin-neg").setAttribute("class", "edge-line done");
    }
  }

  function renderResult(res) {
    lastResult = res;
    els.resultsPlaceholder.classList.add("hidden");
    els.resultsBody.classList.remove("hidden");
    els.exportMdBtn.classList.remove("hidden");
    els.exportJsonBtn.classList.remove("hidden");

    els.scoreCircle.textContent = res.overall_risk_score;
    els.scoreCircle.className = `score-circle ${res.risk_level}`;
    els.riskTitle.textContent = `${res.risk_level} RISK • ${res.intake.document_type} (${res.execution_mode})`;
    els.execSummary.textContent = res.executive_summary;

    if (res.llm_memo) {
      els.llmMemoBox.classList.remove("hidden");
      els.llmMemoText.textContent = res.llm_memo;
    } else {
      els.llmMemoBox.classList.add("hidden");
    }

    const allFindings = [...res.red_flags, ...res.financial_findings];
    els.findingsList.innerHTML = allFindings.length
      ? allFindings
          .map(
            (f) => `
          <div class="finding ${escapeHtml(f.severity)}">
            <div class="finding-head">
              <strong>${escapeHtml(f.title)}</strong>
              <span>
                <span class="badge ${escapeHtml(f.category)}">${escapeHtml(f.category)}</span>
                <span class="badge ${escapeHtml(f.severity)}">${escapeHtml(f.severity)}</span>
              </span>
            </div>
            <div style="font-size:12.5px; color:#c8d6ee; margin-top:5px;">${escapeHtml(f.explanation)}</div>
            ${f.snippet ? `<div style="font-size:11.5px; color:#8ea0c0; margin-top:5px; font-style:italic;">"${escapeHtml(f.snippet)}"</div>` : ""}
          </div>`
          )
          .join("")
      : `<div class="finding" style="border-left-color:#34d399;">No critical red flags triggered.</div>`;

    els.countersList.innerHTML = res.counter_clauses.length
      ? res.counter_clauses
          .map(
            (c) => `
          <div class="counter-box">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <strong style="font-size:13px; color:#34d399;">Replace: ${escapeHtml(c.for_issue)}</strong>
              <span class="badge ${escapeHtml(c.severity)}">${escapeHtml(c.severity)}</span>
            </div>
            <code>${escapeHtml(c.suggested_text)}</code>
          </div>`
          )
          .join("")
      : `<div style="color:#8ea0c0; font-size:13px;">No counter-clauses required.</div>`;
  }

  function downloadFile(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function toMarkdown(res) {
    const lines = [
      `# ClauseMesh Multi-Agent Contract Audit`,
      `- **Protocol:** ${res.protocol}`,
      `- **Front Agent:** ${res.front_man}`,
      `- **Document Type:** ${res.intake.document_type}`,
      `- **Risk Score:** ${res.overall_risk_score}/100 (${res.risk_level})`,
      "",
      `## Executive Summary`,
      res.executive_summary,
      "",
      `## Detected Red Flags & Financial Traps`
    ];
    for (const f of [...res.red_flags, ...res.financial_findings]) {
      lines.push(`- **[${f.severity} / ${f.category}] ${f.title}**: ${f.explanation}`);
    }
    lines.push("", "## Suggested Fair Counter-Clauses");
    for (const c of res.counter_clauses) {
      lines.push(`### ${c.for_issue}\n> ${c.suggested_text}\n`);
    }
    return lines.join("\n");
  }

  document.querySelectorAll(".btn-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-sample");
      els.contractInput.value = SAMPLES[key] || "";
      els.roleSelect.value = key === "lease" ? "tenant" : key === "saas" ? "consumer" : "freelancer";
    });
  });

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const key = btn.getAttribute("data-spec");
      if (specBundle && specBundle[key]) {
        els.specViewer.textContent = JSON.stringify(specBundle[key], null, 2);
      }
    });
  });

  els.runBtn.addEventListener("click", async () => {
    const text = els.contractInput.value.trim();
    if (text.length < 40) {
      alert("Please paste a contract (at least 40 characters) or click a Sample button.");
      return;
    }
    els.runBtn.disabled = true;
    els.runBtn.textContent = "Agents Executing...";
    els.traceList.innerHTML = "";
    resetGraph();

    const byok = els.byokKey.value.trim()
      ? {
          endpoint: els.byokEndpoint.value.trim(),
          model: els.byokModel.value.trim(),
          apiKey: els.byokKey.value.trim()
        }
      : null;

    try {
      const res = await window.OpenAgenticWeb.invoke(
        "analyze_contract",
        { contract_text: text, role: els.roleSelect.value },
        {
          byok,
          onEvent: (ev) => {
            updateGraph(ev.agent, ev.status);
            const row = document.createElement("div");
            row.className = "trace-item";
            row.innerHTML = `<span class="trace-agent">[${escapeHtml(ev.agent)}]</span> (${escapeHtml(ev.status)}) ${escapeHtml(ev.message)}`;
            els.traceList.appendChild(row);
            els.traceList.scrollTop = els.traceList.scrollHeight;
          }
        }
      );
      renderResult(res);
    } catch (err) {
      alert(`Runtime Error: ${err.message}`);
    } finally {
      els.runBtn.disabled = false;
      els.runBtn.textContent = "Run 4-Agent Network";
    }
  });

  els.loadPeerBtn.addEventListener("click", async () => {
    const url = els.peerUrlInput.value.trim();
    els.peerResult.classList.remove("hidden");
    els.peerResult.textContent = "Requesting origin consent...";
    try {
      const info = await window.OpenAgenticWeb.loadPeerNetwork(url, async (ctx) => {
        return window.confirm(
          `Open Agentic Web Consent (MVP 0.3 Section 3.2)\n\nAllow ClauseMesh to contact external origin:\n${ctx.origin}\n\nTo fetch agent-manifest.json and load network '${ctx.requestedName}'?`
        );
      });
      els.peerResult.textContent = JSON.stringify(info, null, 2);
    } catch (err) {
      els.peerResult.textContent = `Peer load stopped: ${err.message}`;
    }
  });

  els.exportMdBtn.addEventListener("click", () => {
    if (lastResult) downloadFile("clausemesh-audit.md", toMarkdown(lastResult), "text/markdown");
  });
  els.exportJsonBtn.addEventListener("click", () => {
    if (lastResult) downloadFile("clausemesh-audit.json", JSON.stringify(lastResult, null, 2), "application/json");
  });

  window.OpenAgenticWeb.init()
    .then((bundle) => {
      specBundle = {
        manifest: bundle.manifest,
        network: bundle.network,
        links: bundle.links,
        facts: bundle.agentFacts
      };
      els.specStatus.textContent = `MVP Profile ${bundle.manifest.spec_version} Validated (${bundle.validation.agent_count} agents)`;
      els.specViewer.textContent = JSON.stringify(bundle.manifest, null, 2);
      els.contractInput.value = SAMPLES.freelance;
    })
    .catch((err) => {
      els.specStatus.textContent = "Run via HTTP server (not file://)";
      els.specViewer.textContent = `Load error: ${err.message}`;
    });
})();
