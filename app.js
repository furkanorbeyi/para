/**
 * ClauseMesh UI Controller (v2.0 — Clean 3-Tab Product Experience)
 */
(function () {
  "use strict";

  const SAMPLES = {
    freelance: `INDEPENDENT CONTRACTOR AGREEMENT
1. Intellectual Property: Contractor irrevocably assigns to Client worldwide, perpetual, royalty-free ownership of all intellectual property, including pre-existing tools, code libraries, and inventions whether or not conceived during this engagement, as work made for hire.
2. Payment Terms: Client shall pay Contractor Net 90 days upon Client's receipt of funds from its end customer (pay-when-paid). Any incomplete milestone forfeits all unpaid fees.
3. Liability: Contractor accepts unlimited liability and agrees to indemnify and hold harmless Client from any and all claims, indirect damages, and consequential damages without cap.
4. Non-Compete: Contractor shall not compete or work in any similar industry for a period of 3 years following termination.
5. Revisions & Termination: Contractor agrees to unlimited revisions until Client is fully satisfied. Client may terminate this agreement at any time without cause and immediately without notice.`,

    fair: `BALANCED FREELANCE SERVICES AGREEMENT
1. Intellectual Property: Upon full payment, Client receives ownership of the final Deliverables created under this Agreement. Contractor retains sole ownership of all pre-existing tools, libraries, and prior inventions.
2. Payment Terms: Invoices are payable Net 15 days from submission.
3. Revisions: Fees include two (2) rounds of reasonable revisions per milestone.
4. Liability: Each party's aggregate liability shall not exceed the total fees paid under this Agreement.
5. Termination: Either party may terminate with 14 days written notice, and Client will pay for all work completed to date.`,

    saas: `CLOUD SAAS TERMS OF SERVICE
1. Changes to Terms: Company may modify these terms at any time at its sole discretion without notice, and your continued use constitutes acceptance.
2. Data Usage: Company may sell your personal data and share it with third-party advertisers, and holds a perpetual license to train AI models without opt-out.
3. Billing & Auto-Renewal: Subscriptions automatically renew for 12 months unless cancelled at least 60 days prior. All payments are non-refundable, and Company may increase fees at its discretion by up to 25% annually.
4. Dispute Resolution: You agree to binding arbitration and waive your right to a jury trial or any class action waiver.`,

    turkish: `SERBEST YAZILIM VE KİRA / HİZMET SÖZLEŞMESİ
1. Fikri Mülkiyet: Yüklenici, bu proje kapsamında ve önceden geliştirilen tüm fikri mülkiyet haklarını süresiz ve geri dönülemez şekilde İşverene devreder.
2. Ödeme: Fatura bedeli, müşteriden tahsilat yapıldığında 90 gün içinde ödenir.
3. Sorumluluk ve Cezai Şart: Yüklenici tüm doğrudan ve dolaylı zararları sınırsız sorumlu olarak tazmin eder ve erken çıkış cezası ile depozito iade edilmez.
4. Rekabet ve Revizyon: Yüklenici benzer sektörde 3 yıl çalışamaz ve sınırsız revizyon yapmayı kabul eder.`
  };

  const els = {
    specStatus: document.getElementById("specStatus"),
    modeBadge: document.getElementById("modeBadge"),
    contractInput: document.getElementById("contractInput"),
    fileUpload: document.getElementById("fileUpload"),
    roleSelect: document.getElementById("roleSelect"),
    runBtn: document.getElementById("runBtn"),
    traceList: document.getElementById("traceList"),
    resultsEmpty: document.getElementById("resultsEmpty"),
    resultsBody: document.getElementById("resultsBody"),
    scoreCircle: document.getElementById("scoreCircle"),
    riskTitle: document.getElementById("riskTitle"),
    execSummary: document.getElementById("execSummary"),
    safeSignalsBox: document.getElementById("safeSignalsBox"),
    findingsList: document.getElementById("findingsList"),
    emailBox: document.getElementById("emailBox"),
    copyEmailBtn: document.getElementById("copyEmailBtn"),
    exportMdBtn: document.getElementById("exportMdBtn"),
    exportJsonBtn: document.getElementById("exportJsonBtn"),
    specViewer: document.getElementById("specViewer"),
    byokEndpoint: document.getElementById("byokEndpoint"),
    byokModel: document.getElementById("byokModel"),
    byokKey: document.getElementById("byokKey"),
    clearByokBtn: document.getElementById("clearByokBtn"),
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

  function updateModeBadge() {
    const hasKey = Boolean(els.byokKey.value.trim());
    els.modeBadge.textContent = hasKey
      ? `Mode: BYOK Full 4-Agent LLM (${els.byokModel.value.trim() || "gpt-4o-mini"})`
      : "Mode: Instant Local Engine (Zero API Key)";
  }

  // Navigation Tabs
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".nav-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const view = tab.getAttribute("data-view");
      ["scanner", "network", "oaw"].forEach((v) => {
        document.getElementById(`view-${v}`).classList.toggle("hidden", v !== view);
      });
    });
  });

  function resetAgents() {
    ["clausemesh_coordinator", "intake_agent", "legal_risk_agent", "financial_agent", "negotiation_agent"].forEach((id) => {
      const n = document.getElementById(`node-${id}`);
      if (n) n.setAttribute("class", "node-rect");
      const p = document.getElementById(`pill-${id}`);
      if (p) p.className = "step-pill";
    });
    ["edge-coord-intake", "edge-intake-legal", "edge-intake-fin", "edge-legal-neg", "edge-fin-neg"].forEach((id) => {
      const e = document.getElementById(id);
      if (e) e.setAttribute("class", "edge-line");
    });
  }

  function updateAgentState(agentId, status) {
    const node = document.getElementById(`node-${agentId}`);
    if (node) node.setAttribute("class", `node-rect ${status}`);
    const pill = document.getElementById(`pill-${agentId}`);
    if (pill) pill.className = `step-pill ${status}`;

    if (agentId === "intake_agent" && status === "running") {
      document.getElementById("node-clausemesh_coordinator").setAttribute("class", "node-rect done");
      document.getElementById("edge-coord-intake").setAttribute("class", "edge-line active");
    }
    if (agentId === "intake_agent" && status === "done") {
      document.getElementById("edge-coord-intake").setAttribute("class", "edge-line done");
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
    els.resultsEmpty.classList.add("hidden");
    els.resultsBody.classList.remove("hidden");
    els.exportMdBtn.classList.remove("hidden");
    els.exportJsonBtn.classList.remove("hidden");

    els.scoreCircle.textContent = res.overall_risk_score;
    els.scoreCircle.className = `score-ring ${res.risk_level}`;
    els.riskTitle.textContent = `${res.risk_level} RISK • ${res.intake.document_type}`;
    els.execSummary.textContent = res.executive_summary;

    if (res.positive_signals && res.positive_signals.length) {
      els.safeSignalsBox.classList.remove("hidden");
      els.safeSignalsBox.innerHTML = res.positive_signals
        .map((s) => `<span class="safe-tag">✓ ${escapeHtml(s)}</span>`)
        .join("");
    } else {
      els.safeSignalsBox.classList.add("hidden");
    }

    const allFindings = [...res.red_flags, ...res.financial_findings];
    if (!allFindings.length) {
      els.findingsList.innerHTML = `<div class="finding" style="border-left-color:#34d399;"><strong>No predatory traps detected.</strong><div style="font-size:12.5px; color:#b8c8e3; margin-top:4px;">This agreement appears balanced based on our legal and financial checks.</div></div>`;
    } else {
      els.findingsList.innerHTML = allFindings
        .map(
          (f, idx) => `
          <div class="finding ${escapeHtml(f.severity)}">
            <div class="finding-top">
              <strong>${escapeHtml(f.title)}</strong>
              <span>
                <span class="badge ${escapeHtml(f.category)}">${escapeHtml(f.category)}</span>
                <span class="badge ${escapeHtml(f.severity)}">${escapeHtml(f.severity)}</span>
              </span>
            </div>
            <div style="font-size:12.5px; color:#c8d6ee; margin-top:6px;">${escapeHtml(f.explanation)}</div>
            ${f.snippet ? `<div style="font-size:11.5px; color:#8fa3c4; margin-top:5px; font-style:italic;">"${escapeHtml(f.snippet)}"</div>` : ""}
            <div class="counter-inline">
              <div class="counter-inline-head">
                <span>Suggested Fair Counter-Clause</span>
                <button class="btn-ghost copy-clause-btn" data-idx="${idx}" style="padding:3px 8px; font-size:11px;">Copy</button>
              </div>
              <div>${escapeHtml(f.counter_clause)}</div>
            </div>
          </div>`
        )
        .join("");

      els.findingsList.querySelectorAll(".copy-clause-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const item = allFindings[Number(btn.getAttribute("data-idx"))];
          if (item && navigator.clipboard) {
            navigator.clipboard.writeText(item.counter_clause);
            btn.textContent = "Copied!";
            setTimeout(() => (btn.textContent = "Copy"), 1500);
          }
        });
      });
    }

    els.emailBox.textContent = res.negotiation_email || "";
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
      `# ClauseMesh Contract Risk Audit`,
      `- **Protocol:** ${res.protocol}`,
      `- **Document:** ${res.intake.document_type} (${res.intake.language_detected})`,
      `- **Risk Score:** ${res.overall_risk_score}/100 (${res.risk_level})`,
      "",
      `## Summary`,
      res.executive_summary,
      "",
      `## Red Flags & Fair Counter-Clauses`
    ];
    for (const f of [...res.red_flags, ...res.financial_findings]) {
      lines.push(`### [${f.severity}] ${f.title}\n- **Risk:** ${f.explanation}\n- **Counter-Clause:** ${f.counter_clause}\n`);
    }
    lines.push("## Ready-to-Send Negotiation Email", "```", res.negotiation_email || "", "```");
    return lines.join("\n");
  }

  // Samples & File Upload
  document.querySelectorAll("[data-sample]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-sample");
      els.contractInput.value = SAMPLES[key] || "";
      els.roleSelect.value = key === "saas" ? "consumer" : "freelancer";
    });
  });

  els.fileUpload.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { els.contractInput.value = String(reader.result || ""); };
    reader.readAsText(file);
  });

  // BYOK Presets
  document.querySelectorAll("[data-preset]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = btn.getAttribute("data-preset");
      if (p === "openai") {
        els.byokEndpoint.value = "https://api.openai.com/v1/chat/completions";
        els.byokModel.value = "gpt-4o-mini";
      } else if (p === "openrouter") {
        els.byokEndpoint.value = "https://openrouter.ai/api/v1/chat/completions";
        els.byokModel.value = "openai/gpt-4o-mini";
      }
      updateModeBadge();
    });
  });
  els.clearByokBtn.addEventListener("click", () => {
    els.byokKey.value = "";
    updateModeBadge();
  });
  els.byokKey.addEventListener("input", updateModeBadge);
  els.byokModel.addEventListener("input", updateModeBadge);

  // Spec Inspector Tabs
  document.querySelectorAll("[data-spec]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-spec");
      if (specBundle && specBundle[key]) {
        els.specViewer.textContent = JSON.stringify(specBundle[key], null, 2);
      }
    });
  });

  // Run Analysis
  els.runBtn.addEventListener("click", async () => {
    const text = els.contractInput.value.trim();
    if (text.length < 40) {
      alert("Please paste at least 40 characters of contract text or select a sample.");
      return;
    }
    els.runBtn.disabled = true;
    els.runBtn.textContent = "4 Agents Analyzing...";
    els.traceList.innerHTML = "";
    resetAgents();

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
            updateAgentState(ev.agent, ev.status);
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
      alert(`Analysis Error: ${err.message}`);
    } finally {
      els.runBtn.disabled = false;
      els.runBtn.textContent = "Analyze Contract";
    }
  });

  els.copyEmailBtn.addEventListener("click", () => {
    if (lastResult && navigator.clipboard) {
      navigator.clipboard.writeText(lastResult.negotiation_email || "");
      els.copyEmailBtn.textContent = "Copied!";
      setTimeout(() => (els.copyEmailBtn.textContent = "Copy Email"), 1500);
    }
  });

  els.exportMdBtn.addEventListener("click", () => {
    if (lastResult) downloadFile("clausemesh-audit.md", toMarkdown(lastResult), "text/markdown");
  });
  els.exportJsonBtn.addEventListener("click", () => {
    if (lastResult) downloadFile("clausemesh-audit.json", JSON.stringify(lastResult, null, 2), "application/json");
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

  window.OpenAgenticWeb.init()
    .then((bundle) => {
      specBundle = {
        manifest: bundle.manifest,
        network: bundle.network,
        links: bundle.links,
        facts: bundle.agentFacts
      };
      els.specStatus.textContent = `MVP 0.3 Validated • ${bundle.validation.agent_count} Agents`;
      els.specViewer.textContent = JSON.stringify(bundle.manifest, null, 2);
      els.contractInput.value = SAMPLES.freelance;
      updateModeBadge();
    })
    .catch((err) => {
      els.specStatus.textContent = "Serve via HTTP";
      els.specViewer.textContent = `Load error: ${err.message}`;
    });
})();
