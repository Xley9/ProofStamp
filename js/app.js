/* ProofStamp – Kernlogik */
const App = (function() {
  "use strict";

  // === State ===
  let proofs = [];
  let editingId = null;
  let searchQuery = "";
  let filterCategory = "all";
  let viewMode = "gallery";
  let pendingFiles = [];
  let pendingLocation = null;
  let confirmCallback = null;
  let settings = {
    theme: "dark",
    lang: "de",
    onboardingDone: false
  };

  // === IndexedDB ===
  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function loadProofs() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        proofs = req.result || [];
        proofs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        resolve(proofs);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async function saveProofToDB(proof) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put(proof);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function deleteProofFromDB(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function clearAllProofs() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // === Hashing ===
  async function hashArrayBuffer(buffer) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }

  async function hashFile(file) {
    const buffer = await file.arrayBuffer();
    return hashArrayBuffer(buffer);
  }

  async function hashDataUrl(dataUrl) {
    const resp = await fetch(dataUrl);
    const buffer = await resp.arrayBuffer();
    return hashArrayBuffer(buffer);
  }

  async function generateCombinedHash(files, timestamp, location, salt) {
    const parts = files.map(f => f.hash).join("|");
    const locStr = location ? `${location.lat},${location.lng}` : "none";
    const combined = `${parts}|${timestamp}|${locStr}|${salt}`;
    const encoder = new TextEncoder();
    const buffer = encoder.encode(combined);
    return hashArrayBuffer(buffer);
  }

  function generateSalt() {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  // === File Handling ===
  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  async function processFiles(fileList) {
    for (const file of fileList) {
      const dataUrl = await fileToDataUrl(file);
      const hash = await hashFile(file);
      pendingFiles.push({
        name: file.name,
        type: file.type,
        dataUrl,
        hash
      });
    }
    renderFilePreview();
  }

  function renderFilePreview() {
    const container = document.getElementById("filePreviewList");
    container.innerHTML = pendingFiles.map((f, i) => {
      const isImage = f.type.startsWith("image/");
      return `<div class="file-preview-item">
        ${isImage ? `<img src="${f.dataUrl}" alt="${f.name}">` : `<div class="file-icon">📄</div>`}
        <button class="file-preview-remove" onclick="App.removeFile(${i})">✕</button>
      </div>`;
    }).join("");
  }

  function removeFile(index) {
    pendingFiles.splice(index, 1);
    renderFilePreview();
  }

  function capturePhoto() {
    document.getElementById("cameraInput").click();
  }

  function triggerFileUpload() {
    document.getElementById("fileInput").click();
  }

  // === Location ===
  function requestLocation() {
    const btn = document.getElementById("locationBtn");
    if (!navigator.geolocation) {
      btn.classList.add("error");
      btn.innerHTML = `📍 <span>${t("locationFailed")}</span>`;
      return;
    }
    btn.innerHTML = `📍 <span class="spinner"></span>`;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        pendingLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        btn.classList.remove("error");
        btn.classList.add("success");
        btn.innerHTML = `📍 <span>${t("locationAdded")} (${pendingLocation.lat.toFixed(4)}, ${pendingLocation.lng.toFixed(4)})</span>`;
      },
      () => {
        btn.classList.add("error");
        btn.innerHTML = `📍 <span>${t("locationFailed")}</span>`;
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // === Proof CRUD ===
  async function saveProof() {
    const title = document.getElementById("proofTitleInput").value.trim();
    const description = document.getElementById("proofDescInput").value.trim();
    const category = document.getElementById("proofCategoryInput").value;

    if (!title) { showToast(t("titleRequired")); return; }
    if (pendingFiles.length === 0) { showToast(t("filesRequired")); return; }

    const now = new Date().toISOString();
    const salt = generateSalt();
    const combinedHash = await generateCombinedHash(pendingFiles, now, pendingLocation, salt);

    const proof = {
      id: editingId || generateId(),
      title,
      description,
      category: category || "other",
      files: [...pendingFiles],
      timestamp: now,
      location: pendingLocation,
      combinedHash,
      salt,
      createdAt: editingId ? (proofs.find(p => p.id === editingId)?.createdAt || now) : now
    };

    await saveProofToDB(proof);
    await loadProofs();
    closeCreate();
    render();
    showToast(t("success"));
  }

  async function deleteProof(id) {
    showConfirm(t("confirmDelete"), t("confirmDeleteDesc"), t("confirmDeleteBtn"), async () => {
      await deleteProofFromDB(id);
      await loadProofs();
      closeDetail();
      render();
      showToast(t("dataDeleted"));
    });
  }

  // === Rendering ===
  function render() {
    renderDashboard();
    renderFilterChips();
    renderProofList();
  }

  function renderDashboard() {
    const now = new Date();
    const thisMonth = proofs.filter(p => {
      const d = new Date(p.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const cats = new Set(proofs.map(p => p.category));

    document.getElementById("statTotal").textContent = proofs.length;
    document.getElementById("statMonth").textContent = thisMonth.length;
    document.getElementById("statCategories").textContent = cats.size;
  }

  function renderFilterChips() {
    const container = document.getElementById("filterChips");
    let html = `<button class="filter-chip ${filterCategory === "all" ? "active" : ""}" onclick="App.setFilter('all')" data-i18n="filterAll">${t("filterAll")}</button>`;
    CATEGORIES.forEach(cat => {
      html += `<button class="filter-chip ${filterCategory === cat.id ? "active" : ""}" onclick="App.setFilter('${cat.id}')">${cat.emoji} ${t(cat.i18nKey)}</button>`;
    });
    container.innerHTML = html;
  }

  function getFilteredProofs() {
    let filtered = proofs;
    if (filterCategory !== "all") {
      filtered = filtered.filter(p => p.category === filterCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }
    return filtered;
  }

  function renderProofList() {
    const container = document.getElementById("proofContainer");
    const filtered = getFilteredProofs();

    if (filtered.length === 0) {
      const hasProofs = proofs.length > 0;
      container.innerHTML = `<div class="empty-state">
        <div class="empty-state-icon">${hasProofs ? "🔍" : "🛡️"}</div>
        <h3 data-i18n="${hasProofs ? "noResults" : "noProofsYet"}">${hasProofs ? t("noResults") : t("noProofsYet")}</h3>
        <p data-i18n="${hasProofs ? "noResultsDesc" : "noProofsDesc"}">${hasProofs ? t("noResultsDesc") : t("noProofsDesc")}</p>
        ${!hasProofs ? `<button class="btn btn-primary" onclick="App.openCreate()">${t("createProof")}</button>` : ""}
      </div>`;
      return;
    }

    if (viewMode === "gallery") {
      container.innerHTML = `<div class="proof-grid">${filtered.map(p => renderGalleryCard(p)).join("")}</div>`;
    } else {
      container.innerHTML = `<div class="proof-list">${filtered.map(p => renderListItem(p)).join("")}</div>`;
    }
  }

  function renderGalleryCard(proof) {
    const cat = getCategoryById(proof.category);
    const firstImage = proof.files.find(f => f.type.startsWith("image/"));
    const date = new Date(proof.createdAt).toLocaleDateString(currentLang);
    return `<div class="proof-card fade-in" onclick="App.openDetail('${proof.id}')">
      <div class="proof-card-thumb">
        ${firstImage ? `<img src="${firstImage.dataUrl}" alt="${proof.title}" loading="lazy">` : `<span>${cat.emoji}</span>`}
      </div>
      <div class="proof-card-body">
        <div class="proof-card-title">${escapeHtml(proof.title)}</div>
        <div class="proof-card-meta">
          <span class="proof-card-cat">${cat.emoji}</span>
          <span>${date}</span>
        </div>
      </div>
    </div>`;
  }

  function renderListItem(proof) {
    const cat = getCategoryById(proof.category);
    const firstImage = proof.files.find(f => f.type.startsWith("image/"));
    const date = new Date(proof.createdAt).toLocaleDateString(currentLang);
    return `<div class="proof-list-item fade-in" onclick="App.openDetail('${proof.id}')">
      <div class="proof-list-thumb">
        ${firstImage ? `<img src="${firstImage.dataUrl}" alt="${proof.title}" loading="lazy">` : `<span>${cat.emoji}</span>`}
      </div>
      <div class="proof-list-info">
        <div class="proof-list-title">${escapeHtml(proof.title)}</div>
        <div class="proof-list-meta">${cat.emoji} ${t(cat.i18nKey)} · ${date}</div>
      </div>
      <div class="proof-list-chevron">›</div>
    </div>`;
  }

  // === Detail Modal ===
  function openDetail(id) {
    const proof = proofs.find(p => p.id === id);
    if (!proof) return;

    const cat = getCategoryById(proof.category);
    const date = new Date(proof.createdAt).toLocaleString(currentLang);
    const body = document.getElementById("detailBody");

    let filesHtml = proof.files.map((f, i) => {
      const isImage = f.type.startsWith("image/");
      return `${isImage ? `<img class="detail-file-thumb" src="${f.dataUrl}" alt="${f.name}">` : `<p>📄 ${escapeHtml(f.name)}</p>`}
      <div class="detail-section">
        <label>${t("fileHash")} #${i + 1}</label>
        <div class="hash-display">
          <span class="hash-text">${f.hash}</span>
          <button class="hash-copy-btn" onclick="App.copyText('${f.hash}')">📋</button>
        </div>
      </div>`;
    }).join("");

    body.innerHTML = `
      ${filesHtml}
      <div class="detail-section">
        <label>${t("proofTitle")}</label>
        <div class="value">${escapeHtml(proof.title)}</div>
      </div>
      ${proof.description ? `<div class="detail-section">
        <label>${t("proofDescription")}</label>
        <div class="value">${escapeHtml(proof.description)}</div>
      </div>` : ""}
      <div class="detail-section">
        <label>${t("category")}</label>
        <div class="value">${cat.emoji} ${t(cat.i18nKey)}</div>
      </div>
      <div class="detail-section">
        <label>${t("createdAt")}</label>
        <div class="value">${date}</div>
      </div>
      <div class="detail-section">
        <label>${t("location")}</label>
        <div class="value">${proof.location ? `📍 ${proof.location.lat.toFixed(6)}, ${proof.location.lng.toFixed(6)}` : t("noLocation")}</div>
      </div>
      <div class="detail-section">
        <label>${t("combinedHash")}</label>
        <div class="hash-display">
          <span class="hash-text">${proof.combinedHash}</span>
          <button class="hash-copy-btn" onclick="App.copyText('${proof.combinedHash}')">📋</button>
        </div>
      </div>
      <div class="detail-section">
        <label>${t("salt")}</label>
        <div class="hash-display">
          <span class="hash-text">${proof.salt}</span>
          <button class="hash-copy-btn" onclick="App.copyText('${proof.salt}')">📋</button>
        </div>
      </div>
      <div class="detail-actions">
        <button class="btn btn-primary" style="flex:2" onclick="App.exportPDF('${proof.id}')">📄 ${t("exportPDF")}</button>
        <button class="btn btn-danger" style="flex:1" onclick="App.deleteProof('${proof.id}')">🗑️ ${t("deleteProof")}</button>
      </div>`;

    openModal("detailModal");
  }

  function closeDetail() {
    closeModal("detailModal");
  }

  // === Create/Edit Modal ===
  function openCreate(id) {
    editingId = id || null;
    pendingFiles = [];
    pendingLocation = null;

    document.getElementById("proofTitleInput").value = "";
    document.getElementById("proofDescInput").value = "";
    document.getElementById("proofCategoryInput").value = "";
    document.getElementById("filePreviewList").innerHTML = "";
    const locBtn = document.getElementById("locationBtn");
    locBtn.className = "location-btn";
    locBtn.innerHTML = `📍 <span data-i18n="addLocation">${t("addLocation")}</span>`;

    populateCategorySelect();

    if (editingId) {
      const proof = proofs.find(p => p.id === editingId);
      if (proof) {
        document.getElementById("proofTitleInput").value = proof.title;
        document.getElementById("proofDescInput").value = proof.description || "";
        document.getElementById("proofCategoryInput").value = proof.category;
        pendingFiles = [...proof.files];
        pendingLocation = proof.location ? { ...proof.location } : null;
        renderFilePreview();
        if (pendingLocation) {
          locBtn.classList.add("success");
          locBtn.innerHTML = `📍 <span>${t("locationAdded")} (${pendingLocation.lat.toFixed(4)}, ${pendingLocation.lng.toFixed(4)})</span>`;
        }
      }
      document.getElementById("createModalTitle").textContent = t("editProof");
      document.getElementById("saveProofBtn").textContent = t("updateProof");
    } else {
      document.getElementById("createModalTitle").textContent = t("createProof");
      document.getElementById("saveProofBtn").textContent = t("saveProof");
    }

    openModal("createModal");
  }

  function closeCreate() {
    closeModal("createModal");
    editingId = null;
    pendingFiles = [];
    pendingLocation = null;
  }

  function populateCategorySelect() {
    const select = document.getElementById("proofCategoryInput");
    select.innerHTML = `<option value="">${t("selectCategory")}</option>`;
    CATEGORIES.forEach(cat => {
      select.innerHTML += `<option value="${cat.id}">${cat.emoji} ${t(cat.i18nKey)}</option>`;
    });
  }

  // === Verify Modal ===
  function openVerify() {
    const select = document.getElementById("verifyProofSelect");
    select.innerHTML = `<option value="">--</option>`;
    proofs.forEach(p => {
      select.innerHTML += `<option value="${p.id}">${escapeHtml(p.title)}</option>`;
    });
    document.getElementById("verifyFileSelect").innerHTML = `<option value="">--</option>`;
    document.getElementById("verifyResultContainer").innerHTML = "";
    document.getElementById("verifyFileInput").value = "";
    openModal("verifyModal");
  }

  function closeVerify() {
    closeModal("verifyModal");
  }

  function onVerifyProofChange() {
    const proofId = document.getElementById("verifyProofSelect").value;
    const fileSelect = document.getElementById("verifyFileSelect");
    fileSelect.innerHTML = `<option value="">--</option>`;
    if (!proofId) return;
    const proof = proofs.find(p => p.id === proofId);
    if (!proof) return;
    proof.files.forEach((f, i) => {
      fileSelect.innerHTML += `<option value="${i}">${f.name} (${f.hash.slice(0, 12)}...)</option>`;
    });
  }

  async function onVerifyFileSelected(fileList) {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    const computedHash = await hashFile(file);

    const proofId = document.getElementById("verifyProofSelect").value;
    const fileIdx = document.getElementById("verifyFileSelect").value;
    const container = document.getElementById("verifyResultContainer");

    if (!proofId || fileIdx === "") {
      container.innerHTML = `<div class="detail-section"><label>${t("verifyComputed")}</label>
        <div class="hash-display"><span class="hash-text">${computedHash}</span></div></div>
        <p style="color:var(--text-secondary);font-size:0.85rem;">${t("verifySelectProof")}</p>`;
      return;
    }

    const proof = proofs.find(p => p.id === proofId);
    const expectedHash = proof?.files[parseInt(fileIdx)]?.hash;
    const match = computedHash === expectedHash;

    container.innerHTML = `<div class="verify-result ${match ? "match" : "no-match"}">
      ${match ? t("verifyMatch") : t("verifyNoMatch")}
    </div>
    <div class="detail-section" style="margin-top:12px">
      <label>${t("verifyComputed")}</label>
      <div class="hash-display"><span class="hash-text">${computedHash}</span></div>
    </div>`;
  }

  // === Settings ===
  function openSettings() {
    updateSettingsUI();
    openModal("settingsModal");
  }

  function closeSettings() {
    closeModal("settingsModal");
  }

  function updateSettingsUI() {
    document.querySelectorAll("#themeGroup button").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-theme-val") === settings.theme);
    });
    document.querySelectorAll("#langGroup button").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-lang-val") === currentLang);
    });
    document.getElementById("appVersion").textContent = APP_VERSION;
  }

  // === Theme ===
  function setTheme(theme) {
    settings.theme = theme;
    applyTheme();
    saveSettings();
    updateSettingsUI();
  }

  function applyTheme() {
    let effective = settings.theme;
    if (effective === "system") {
      effective = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    document.documentElement.setAttribute("data-theme", effective);
    document.getElementById("btnTheme").textContent = effective === "dark" ? "🌙" : "☀️";
  }

  function cycleTheme() {
    const themes = ["dark", "light", "system"];
    const idx = themes.indexOf(settings.theme);
    setTheme(themes[(idx + 1) % themes.length]);
  }

  // === Language ===
  function changeLang(lang) {
    setLanguage(lang);
    settings.lang = lang;
    saveSettings();
    updateSettingsUI();
    renderFilterChips();
    renderProofList();
  }

  // === Modal Helpers ===
  function openModal(id) {
    const overlay = document.getElementById(id);
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
    // Use a named handler so we can remove it on close
    function onOverlayClick(e) {
      if (e.target === overlay) closeModal(id);
    }
    overlay._closeHandler = onOverlayClick;
    overlay.addEventListener("click", onOverlayClick);
  }

  function closeModal(id) {
    const overlay = document.getElementById(id);
    overlay.classList.remove("active");
    document.body.style.overflow = "";
    if (overlay._closeHandler) {
      overlay.removeEventListener("click", overlay._closeHandler);
      overlay._closeHandler = null;
    }
  }

  // === Confirm Dialog ===
  function showConfirm(title, desc, btnText, callback) {
    document.getElementById("confirmTitle").textContent = title;
    document.getElementById("confirmDesc").textContent = desc;
    const btn = document.getElementById("confirmBtn");
    btn.textContent = btnText;
    confirmCallback = callback;
    btn.onclick = () => {
      closeConfirm();
      if (confirmCallback) confirmCallback();
    };
    document.getElementById("confirmOverlay").classList.add("active");
  }

  function closeConfirm() {
    document.getElementById("confirmOverlay").classList.remove("active");
    confirmCallback = null;
  }

  function confirmDeleteAll() {
    showConfirm(t("confirmDeleteAll"), t("confirmDeleteAllDesc"), t("confirmDeleteAllBtn"), async () => {
      await clearAllProofs();
      proofs = [];
      render();
      showToast(t("dataDeleted"));
    });
  }

  // === Toast ===
  function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
  }

  // === Copy ===
  function copyText(text) {
    navigator.clipboard.writeText(text).then(() => showToast(t("copied")));
  }

  // === Export/Import ===
  async function exportData() {
    const data = { version: APP_VERSION, exportDate: new Date().toISOString(), proofs };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `proofstamp-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData() {
    document.getElementById("importFileInput").click();
  }

  async function handleImport(fileList) {
    if (!fileList || fileList.length === 0) return;
    try {
      const text = await fileList[0].text();
      const data = JSON.parse(text);
      if (!data.proofs || !Array.isArray(data.proofs)) throw new Error("Invalid format");
      for (const proof of data.proofs) {
        await saveProofToDB(proof);
      }
      await loadProofs();
      render();
      closeSettings();
      showToast(t("importSuccess"));
    } catch {
      showToast(t("importError"));
    }
    document.getElementById("importFileInput").value = "";
  }

  // === PDF Export ===
  async function exportPDF(id) {
    const proof = proofs.find(p => p.id === id);
    if (!proof) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const w = doc.internal.pageSize.getWidth();
    let y = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("ProofStamp", w / 2, y, { align: "center" });
    y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(t("appTagline"), w / 2, y, { align: "center" });
    doc.setTextColor(0);
    y += 12;

    // Line
    doc.setDrawColor(108, 99, 255);
    doc.setLineWidth(0.5);
    doc.line(20, y, w - 20, y);
    y += 10;

    // Proof title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(proof.title, 20, y);
    y += 8;

    // Description
    if (proof.description) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(proof.description, w - 40);
      doc.text(lines, 20, y);
      y += lines.length * 5 + 4;
    }

    // Metadata
    doc.setFontSize(9);
    const cat = getCategoryById(proof.category);
    const meta = [
      [t("category"), `${cat.emoji} ${t(cat.i18nKey)}`],
      [t("createdAt"), new Date(proof.createdAt).toLocaleString(currentLang)],
      [t("location"), proof.location ? `${proof.location.lat.toFixed(6)}, ${proof.location.lng.toFixed(6)}` : t("noLocation")],
    ];
    meta.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(label + ":", 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(value, 60, y);
      y += 6;
    });
    y += 4;

    // Image (first one)
    const firstImage = proof.files.find(f => f.type.startsWith("image/"));
    if (firstImage) {
      try {
        const imgHeight = 80;
        const imgWidth = w - 40;
        if (y + imgHeight > 270) { doc.addPage(); y = 20; }
        doc.addImage(firstImage.dataUrl, "JPEG", 20, y, imgWidth, imgHeight);
        y += imgHeight + 8;
      } catch { /* skip image if it fails */ }
    }

    // Hashes
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(t("combinedHash") + ":", 20, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(proof.combinedHash, 20, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(t("salt") + ":", 20, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(proof.salt, 20, y);
    y += 8;

    // File hashes
    proof.files.forEach((f, i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(`${t("fileHash")} #${i + 1} (${f.name}):`, 20, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text(f.hash, 20, y);
      y += 6;
    });

    // QR Code
    try {
      if (y > 230) { doc.addPage(); y = 20; }
      const qrData = JSON.stringify({
        app: "ProofStamp",
        id: proof.id,
        hash: proof.combinedHash,
        timestamp: proof.timestamp
      });
      const qrCanvas = document.createElement("canvas");
      await QRCode.toCanvas(qrCanvas, qrData, { width: 120, margin: 1 });
      const qrDataUrl = qrCanvas.toDataURL("image/png");
      doc.addImage(qrDataUrl, "PNG", w / 2 - 15, y, 30, 30);
      y += 34;
      doc.setFontSize(7);
      doc.setTextColor(100);
      doc.text("Scan to verify", w / 2, y, { align: "center" });
    } catch { /* QR generation failed, skip */ }

    doc.save(`ProofStamp-${proof.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
  }

  // === Search & Filter ===
  function onSearch(query) {
    searchQuery = query;
    renderProofList();
  }

  function setFilter(cat) {
    filterCategory = cat;
    renderFilterChips();
    renderProofList();
  }

  function setView(mode) {
    viewMode = mode;
    document.querySelectorAll("#viewToggle button").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-view") === mode);
    });
    renderProofList();
  }

  // === Settings Persistence ===
  function saveSettings() {
    localStorage.setItem("proofstamp-settings", JSON.stringify(settings));
  }

  function loadSettings() {
    try {
      const saved = localStorage.getItem("proofstamp-settings");
      if (saved) settings = { ...settings, ...JSON.parse(saved) };
    } catch { /* ignore */ }
  }

  // === Onboarding ===
  function finishOnboarding() {
    settings.onboardingDone = true;
    saveSettings();
    document.getElementById("onboarding").classList.add("hidden");
    document.getElementById("appContent").classList.remove("hidden");
    document.getElementById("fabContainer").classList.remove("hidden");
  }

  // === Helpers ===
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // === Drag & Drop ===
  function setupDragDrop() {
    const zone = document.getElementById("fileUploadZone");
    if (!zone) return;
    zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("dragover"); });
    zone.addEventListener("dragleave", () => zone.classList.remove("dragover"));
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("dragover");
      if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
    });
    zone.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      triggerFileUpload();
    });
  }

  function setupFileInputs() {
    document.getElementById("fileInput").addEventListener("change", function() {
      if (this.files.length > 0) processFiles(this.files);
      this.value = "";
    });
    document.getElementById("cameraInput").addEventListener("change", function() {
      if (this.files.length > 0) processFiles(this.files);
      this.value = "";
    });
  }

  // === Init ===
  async function init() {
    loadSettings();
    currentLang = settings.lang || detectLanguage();
    settings.lang = currentLang;
    applyTheme();
    applyTranslations();

    if (settings.onboardingDone) {
      document.getElementById("onboarding").classList.add("hidden");
      document.getElementById("appContent").classList.remove("hidden");
      document.getElementById("fabContainer").classList.remove("hidden");
    }

    await loadProofs();
    render();
    setupDragDrop();
    setupFileInputs();

    // System theme change listener
    window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => {
      if (settings.theme === "system") applyTheme();
    });

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    }
  }

  // Boot
  document.addEventListener("DOMContentLoaded", init);

  // === Public API ===
  return {
    openCreate,
    closeCreate,
    saveProof,
    deleteProof,
    openDetail,
    closeDetail,
    openVerify,
    closeVerify,
    onVerifyProofChange,
    onVerifyFileSelected,
    openSettings,
    closeSettings,
    setTheme,
    cycleTheme,
    changeLang,
    setFilter,
    setView,
    onSearch,
    capturePhoto,
    triggerFileUpload,
    removeFile,
    requestLocation,
    exportPDF,
    exportData,
    importData,
    handleImport,
    confirmDeleteAll,
    closeConfirm,
    finishOnboarding,
    copyText
  };
})();
