const demoItems = [
  {id:"d1",type:"lost",name:"Wireless Headphones",category:"Electronics",location:"Central Library",date:"2026-11-10",description:"Black over-ear headphones in a soft case.",emoji:"🎧"},
  {id:"d2",type:"found",name:"Blue Water Bottle",category:"Accessories",location:"City Park",date:"2026-11-11",description:"A blue reusable bottle found near the main entrance.",emoji:"🧴"},
  {id:"d3",type:"lost",name:"Student ID Card",category:"Keys & Cards",location:"College Campus",date:"2026-11-09",description:"Student ID card with a blue lanyard.",emoji:"🪪"},
  {id:"d4",type:"found",name:"Notebook",category:"Books",location:"Coffee Street",date:"2026-11-12",description:"A small ruled notebook with a dark cover.",emoji:"📓"},
  {id:"d5",type:"lost",name:"Silver Keychain",category:"Keys & Cards",location:"Bus Station",date:"2026-11-08",description:"Two keys attached to a silver ring.",emoji:"🔑"},
  {id:"d6",type:"found",name:"Smart Watch",category:"Electronics",location:"Sports Ground",date:"2026-11-12",description:"A dark smart watch found beside the benches.",emoji:"⌚"}
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const getReports = () => {
  try { return JSON.parse(localStorage.getItem("intellifindReports") || "[]"); }
  catch { return []; }
};
const saveReports = (reports) => localStorage.setItem("intellifindReports", JSON.stringify(reports));
let currentKind = "lost";
let toastTimer;

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add("hidden"), 2600);
}
function openModal(kind = "lost") {
  setKind(kind);
  $("#reportModal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}
function closeModal() {
  $("#reportModal").classList.add("hidden");
  document.body.style.overflow = "";
  $("#reportForm").reset();
  $("#formMessage").textContent = "";
}
function setKind(kind) {
  currentKind = kind;
  $$(".switch-option").forEach(btn => btn.classList.toggle("selected", btn.dataset.kind === kind));
  $("#modalTitle").textContent = kind === "lost" ? "Report a lost item" : "Report a found item";
}
function allItems() {
  return [...getReports().map(r => ({...r, emoji: emojiFor(r.category)})), ...demoItems];
}
function emojiFor(category) {
  return ({Electronics:"🎧",Accessories:"🎒",Books:"📚",Clothing:"🧥","Keys & Cards":"🔑",Other:"📦"})[category] || "📦";
}
function renderItems() {
  const query = $("#searchInput").value.trim().toLowerCase();
  const type = $("#typeFilter").value;
  const items = allItems().filter(item => {
    const matchesText = [item.name,item.category,item.location,item.description].join(" ").toLowerCase().includes(query);
    return matchesText && (type === "all" || item.type === type);
  });
  $("#itemGrid").innerHTML = items.map(item => `
    <article class="item-card">
      <div class="item-top"><span class="item-emoji">${item.emoji || emojiFor(item.category)}</span><span class="tag ${item.type === "lost" ? "tag-lost" : "tag-found"}">${item.type}</span></div>
      <h3>${escapeHTML(item.name)}</h3>
      <p>${escapeHTML(item.description || "No additional description provided.")}</p>
      <div class="item-meta"><span>⌖ ${escapeHTML(item.location)}</span><span>${escapeHTML(item.category)}</span></div>
    </article>`).join("");
  $("#emptyState").classList.toggle("hidden", items.length !== 0);
}
function renderReports() {
  const reports = getReports();
  $("#reportsList").innerHTML = reports.length ? reports.map(item => `
    <div class="report-row">
      <div><h3>${item.type === "lost" ? "🔴 Lost" : "🟢 Found"} · ${escapeHTML(item.name)}</h3><p>${escapeHTML(item.location)} · ${escapeHTML(item.category)} · ${escapeHTML(item.date)}</p></div>
      <span class="tag ${item.type === "lost" ? "tag-lost" : "tag-found"}">Saved locally</span>
    </div>`).join("") : '<div class="empty-report">Your reports will appear here after you submit one.</div>';
}
function updateStats() {
  const reports = getReports();
  $("#lostCount").textContent = 124 + reports.filter(r => r.type === "lost").length;
  $("#foundCount").textContent = 98 + reports.filter(r => r.type === "found").length;
}
function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}

$$("[data-open]").forEach(button => button.addEventListener("click", event => {
  event.preventDefault();
  openModal(button.dataset.open);
  $("#navLinks").classList.remove("open");
}));
$$(".nav-link").forEach(link => link.addEventListener("click", () => {
  $$(".nav-link").forEach(nav => nav.classList.remove("active"));
  link.classList.add("active");
}));
$$(".switch-option").forEach(button => button.addEventListener("click", () => setKind(button.dataset.kind)));
$("#closeModal").addEventListener("click", closeModal);
$("#reportModal").addEventListener("click", event => { if (event.target === $("#reportModal")) closeModal(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") closeModal(); });
$("#reportForm").addEventListener("submit", event => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const report = {
    id: "r" + Date.now(),
    type: currentKind,
    name: formData.get("name").trim(),
    category: formData.get("category"),
    date: formData.get("date"),
    location: formData.get("location").trim(),
    description: formData.get("description").trim(),
    contact: formData.get("contact").trim()
  };
  const reports = getReports();
  reports.unshift(report);
  saveReports(reports);
  renderItems();
  renderReports();
  updateStats();
  closeModal();
  showToast("Your report has been saved on this device!");
});
$("#searchBtn").addEventListener("click", renderItems);
$("#searchInput").addEventListener("input", renderItems);
$("#typeFilter").addEventListener("change", renderItems);
$("#menuToggle").addEventListener("click", () => $("#navLinks").classList.toggle("open"));
$("#notificationsBtn").addEventListener("click", () => showToast("You're all caught up!"));

renderItems();
renderReports();
updateStats();
