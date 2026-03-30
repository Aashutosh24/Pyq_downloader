// Smart PYQ Finder — Popup Logic (Redesigned)

(function () {
  "use strict";

  const courseInput = document.getElementById("course");
  const searchBtn = document.getElementById("searchBtn");
  const loader = document.getElementById("loader");
  const errorDiv = document.getElementById("error");
  const errorText = document.getElementById("errorText");
  const resultsDiv = document.getElementById("results");
  const statusPill = document.getElementById("statusPill");
  const chipGroup = document.getElementById("examChips");
  const wifiWarning = document.getElementById("wifiWarning");
  const retryWifiBtn = document.getElementById("retryWifiBtn");
  const appShell = document.querySelector(".app-shell");

  let selectedExam = "CAT1";

  // ---- University WiFi Check ----
  async function performNetworkCheck() {
    const isConnected = await checkUniversityNetwork();

    if (!isConnected) {
      // Show WiFi warning, hide main app
      wifiWarning.classList.remove("hidden");
      appShell.style.display = "none";
      setStatus("Offline", "error");
    } else {
      // Hide WiFi warning, show main app
      wifiWarning.classList.add("hidden");
      appShell.style.display = "";
      setStatus("Ready", "idle");
    }

    return isConnected;
  }

  // Run network check on popup open
  performNetworkCheck();

  // Retry button handler
  retryWifiBtn.addEventListener("click", async () => {
    retryWifiBtn.classList.add("checking");
    retryWifiBtn.querySelector("span:last-child").textContent = "Checking";

    const connected = await performNetworkCheck();

    retryWifiBtn.classList.remove("checking");
    retryWifiBtn.querySelector("span:last-child").textContent = "Retry Connection";

    if (!connected) {
      // Brief shake animation to indicate still not connected
      retryWifiBtn.style.animation = "none";
      retryWifiBtn.offsetHeight; // trigger reflow
      retryWifiBtn.style.animation = "";
    }
  });

  // ---- Chip selection ----
  chipGroup.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;

    chipGroup.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    selectedExam = chip.dataset.value;
  });

  // ---- Search ----
  searchBtn.addEventListener("click", handleSearch);
  courseInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSearch();
  });

  async function handleSearch() {
    const course = sanitizeInput(courseInput.value);

    if (!course) {
      showError("Enter a course code first — e.g. CS301");
      courseInput.focus();
      return;
    }

    hideError();
    clearResults();
    showLoader();
    setStatus("Searching…", "searching");
    searchBtn.disabled = true;

    try {
      const data = await searchPYQ(course, selectedExam);

      if (!data || data.length === 0) {
        showNoResults(course, selectedExam);
        setStatus("No results", "idle");
      } else {
        renderResults(data);
        setStatus(`${data.length} found`, "success");
      }
    } catch (err) {
      console.error("Search failed:", err);
      showError("Backend unreachable — is the server running on localhost:5000?");
      setStatus("Error", "error");
    } finally {
      hideLoader();
      searchBtn.disabled = false;
    }
  }

  // ---- Render ----
  function renderResults(results) {
    resultsDiv.innerHTML = "";

    results.forEach((file, i) => {
      const card = document.createElement("div");
      card.className = "result-card";
      card.style.animationDelay = `${i * 0.08}s`;

      const year = file.year || "—";
      const exam = file.detectedExam || file.exam || "—";

      card.innerHTML = `
        <div class="result-index">${String(i + 1).padStart(2, "0")}</div>
        <div class="result-info">
          <div class="result-name" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</div>
          <div class="result-tags">
            <span class="tag tag-exam">${escapeHtml(exam)}</span>
            <span class="tag tag-year">${escapeHtml(year)}</span>
          </div>
        </div>
        <a class="download-link" href="${escapeHtml(file.url)}" target="_blank" rel="noopener" title="Download">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 3v13m0 0l-4-4m4 4l4-4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </a>
      `;

      resultsDiv.appendChild(card);
    });
  }

  function showNoResults(course, exam) {
    resultsDiv.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.5"/>
            <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <p>No papers found for <strong>${escapeHtml(course)} ${escapeHtml(exam)}</strong>.<br/>Try a different course code.</p>
      </div>
    `;
  }

  // ---- Status Pill ----
  function setStatus(label, state) {
    const dot = statusPill.querySelector(".status-dot");
    const text = statusPill.querySelector("span:last-child");
    text.textContent = label;

    // Reset styles
    statusPill.style.color = "";
    statusPill.style.background = "";
    statusPill.style.borderColor = "";
    dot.style.background = "";

    if (state === "searching") {
      statusPill.style.color = "var(--amber)";
      statusPill.style.background = "rgba(251, 191, 36, 0.08)";
      statusPill.style.borderColor = "rgba(251, 191, 36, 0.15)";
      dot.style.background = "var(--amber)";
    } else if (state === "success") {
      statusPill.style.color = "var(--emerald)";
      statusPill.style.background = "rgba(52, 211, 153, 0.08)";
      statusPill.style.borderColor = "rgba(52, 211, 153, 0.15)";
      dot.style.background = "var(--emerald)";
    } else if (state === "error") {
      statusPill.style.color = "var(--red)";
      statusPill.style.background = "rgba(251, 113, 133, 0.08)";
      statusPill.style.borderColor = "rgba(251, 113, 133, 0.15)";
      dot.style.background = "var(--red)";
    } else {
      statusPill.style.color = "var(--text-muted)";
      statusPill.style.background = "rgba(255,255,255,0.03)";
      statusPill.style.borderColor = "var(--glass-border)";
      dot.style.background = "var(--text-muted)";
    }
  }

  // ---- Helpers ----
  function showLoader() { loader.classList.remove("hidden"); }
  function hideLoader() { loader.classList.add("hidden"); }

  function showError(msg) {
    errorText.textContent = msg;
    errorDiv.classList.remove("hidden");
  }

  function hideError() { errorDiv.classList.add("hidden"); }
  function clearResults() { resultsDiv.innerHTML = ""; }
})();
