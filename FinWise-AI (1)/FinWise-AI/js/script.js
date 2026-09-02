/* =======================================================
   FinWise AI — js/script.js
   Global UI: sidebar navigation, mobile menu, toasts,
   number counters, local-storage helpers, footer.
   ======================================================= */

const NAV_ITEMS = [
  { href: "index.html",    icon: "fa-house",          label: "Home" },
  { href: "loan.html",     icon: "fa-sack-dollar",    label: "Loan Eligibility" },
  { href: "credit.html",   icon: "fa-chart-pie",      label: "Credit Analysis" },
  { href: "emi.html",      icon: "fa-calculator",     label: "EMI Calculator" },
  { href: "advisor.html",  icon: "fa-robot",          label: "AI Financial Advisor" },
  { href: "about.html",    icon: "fa-circle-info",    label: "About Us" },
  { href: "contact.html",  icon: "fa-phone",          label: "Contact" }
];

function currentPage() {
  const path = window.location.pathname.split("/").pop();
  return path === "" ? "index.html" : path;
}

function buildSidebar() {
  const mount = document.getElementById("fw-sidebar");
  if (!mount) return;
  const page = currentPage();

  const links = NAV_ITEMS.map(item => `
    <a href="${item.href}" class="fw-nav-link${item.href === page ? " active" : ""}">
      <i class="fa-solid ${item.icon}"></i>
      <span>${item.label}</span>
    </a>`).join("");

  mount.innerHTML = `
    <div class="fw-sidebar-inner">
      <a href="index.html" class="fw-brand">
        <span class="fw-brand-mark"><i class="fa-solid fa-brain"></i></span>
        <span class="fw-brand-text">FinWise <em>AI</em></span>
      </a>
      <nav class="fw-nav">${links}</nav>
      <div class="fw-sidebar-footer">
        <p>Educational tool. Not a loan guarantee.</p>
      </div>
    </div>`;

  const toggle = document.getElementById("fw-nav-toggle");
  const overlay = document.getElementById("fw-nav-overlay");
  if (toggle) {
    toggle.addEventListener("click", () => {
      document.body.classList.toggle("fw-nav-open");
    });
  }
  if (overlay) {
    overlay.addEventListener("click", () => document.body.classList.remove("fw-nav-open"));
  }
  mount.querySelectorAll(".fw-nav-link").forEach(a =>
    a.addEventListener("click", () => document.body.classList.remove("fw-nav-open"))
  );
}

function buildFooter() {
  const mount = document.getElementById("fw-footer");
  if (!mount) return;
  mount.innerHTML = `
    <div class="fw-footer-inner">
      <div class="fw-footer-brand">
        <span class="fw-brand-mark small"><i class="fa-solid fa-brain"></i></span>
        <span>FinWise AI</span>
      </div>
      <div class="fw-footer-cols">
        <div>
          <h4>Quick Links</h4>
          <a href="index.html">Home</a>
          <a href="loan.html">Loan Eligibility</a>
          <a href="credit.html">Credit Analysis</a>
        </div>
        <div>
          <h4>Services</h4>
          <a href="emi.html">EMI Calculator</a>
          <a href="advisor.html">AI Financial Advisor</a>
        </div>
        <div>
          <h4>Company</h4>
          <a href="about.html">About</a>
          <a href="contact.html">Contact</a>
        </div>
      </div>
      <p class="fw-disclaimer">
        FinWise AI provides educational and decision-support information. It does not guarantee loan approval
        or replace professional financial advice.
      </p>
      <p class="fw-copyright">&copy; ${new Date().getFullYear()} FinWise AI. Built as an AIML academic project.</p>
    </div>`;
}

/* ---------- Toast notifications ---------- */
function showToast(message, type = "info") {
  let host = document.getElementById("fw-toast-host");
  if (!host) {
    host = document.createElement("div");
    host.id = "fw-toast-host";
    document.body.appendChild(host);
  }
  const icons = { success: "fa-circle-check", warning: "fa-triangle-exclamation", error: "fa-circle-xmark", info: "fa-circle-info" };
  const toast = document.createElement("div");
  toast.className = `fw-toast fw-toast-${type}`;
  toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${message}</span>`;
  host.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3600);
}

/* ---------- Animated number counters (IntersectionObserver-driven) ---------- */
function animateCounter(el, target, duration = 1200, decimals = 0, suffix = "") {
  const start = 0;
  const startTime = performance.now();
  function frame(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = start + (target - start) * eased;
    el.textContent = value.toFixed(decimals) + suffix;
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function initCounters() {
  const counters = document.querySelectorAll("[data-counter]");
  if (!counters.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.counter);
        const decimals = parseInt(el.dataset.decimals || "0", 10);
        const suffix = el.dataset.suffix || "";
        animateCounter(el, target, 1400, decimals, suffix);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach(c => obs.observe(c));
}

/* ---------- Reveal-on-scroll for sections ---------- */
function initReveal() {
  const items = document.querySelectorAll("[data-reveal]");
  if (!items.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fw-visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(i => obs.observe(i));
}

/* ---------- Local storage helpers (Section 17) ---------- */
const FWStore = {
  KEYS: { LOAN: "fw_loan_history", EMI: "fw_emi_history", PREFS: "fw_prefs" },

  push(key, entry, max = 5) {
    const list = this.get(key);
    list.unshift({ ...entry, savedAt: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(list.slice(0, max)));
  },
  get(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch { return []; }
  },
  clear(key) { localStorage.removeItem(key); }
};

/* ---------- Mobile FAQ accordion (used on index.html) ---------- */
function initFAQ() {
  document.querySelectorAll(".fw-faq-item").forEach(item => {
    const q = item.querySelector(".fw-faq-q");
    if (!q) return;
    q.addEventListener("click", () => {
      const wasOpen = item.classList.contains("open");
      item.parentElement.querySelectorAll(".fw-faq-item").forEach(i => i.classList.remove("open"));
      if (!wasOpen) item.classList.add("open");
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  buildSidebar();
  buildFooter();
  initCounters();
  initReveal();
  initFAQ();
});
