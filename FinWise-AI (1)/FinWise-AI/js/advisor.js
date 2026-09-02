/* =======================================================
   FinWise AI — js/advisor.js
   AI Financial Advisor chat interface (Sections 13–14)
   ======================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("advisor-form");
  if (!form) return; // not on this page

  const input = document.getElementById("advisor-input");
  const thread = document.getElementById("advisor-thread");
  const suggestions = document.querySelectorAll(".fw-suggested-q");

  const profile = getStoredProfile();
  if (profile) {
    appendMessage("ai",
      `I can see your latest loan assessment for ${profile.name || "you"} — feel free to ask me anything about it, ` +
      `or pick one of the suggestions below.`);
  } else {
    appendMessage("ai",
      "Hi, I'm your FinWise AI Financial Advisor. Ask me about loans, credit, EMIs, budgeting or savings — " +
      "or complete the Loan Eligibility form first so I can personalize my answers.");
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    appendMessage("user", text);
    input.value = "";
    await sendToAdvisor(text);
  });

  suggestions.forEach(btn => {
    btn.addEventListener("click", async () => {
      const text = btn.textContent.trim();
      appendMessage("user", text);
      await sendToAdvisor(text);
    });
  });

  async function sendToAdvisor(text) {
    const typingEl = appendTyping();
    try {
      const result = await FinWiseAPI.askAdvisor(text, profile);
      typingEl.remove();
      appendMessage("ai", result.text);
    } catch (err) {
      typingEl.remove();
      appendMessage("ai", "I couldn't reach the AI service just now. Please try again in a moment.");
      showToast("Unable to connect to AI service.", "error");
    }
  }

  function appendMessage(role, text) {
    const bubble = document.createElement("div");
    bubble.className = `fw-msg fw-msg-${role}`;
    const avatar = role === "ai" ? '<i class="fa-solid fa-robot"></i>' : '<i class="fa-solid fa-user"></i>';
    bubble.innerHTML = `<div class="fw-msg-avatar">${avatar}</div><div class="fw-msg-bubble">${escapeHtml(text).replace(/\n/g, "<br>")}</div>`;
    thread.appendChild(bubble);
    thread.scrollTop = thread.scrollHeight;
    return bubble;
  }

  function appendTyping() {
    const bubble = document.createElement("div");
    bubble.className = "fw-msg fw-msg-ai fw-msg-typing";
    bubble.innerHTML = `<div class="fw-msg-avatar"><i class="fa-solid fa-robot"></i></div>
      <div class="fw-msg-bubble"><span class="fw-typing-label">FinWise AI is analyzing your financial profile</span>
      <span class="fw-typing-dots"><i></i><i></i><i></i></span></div>`;
    thread.appendChild(bubble);
    thread.scrollTop = thread.scrollHeight;
    return bubble;
  }

  function getStoredProfile() {
    const history = FWStore.get(FWStore.KEYS.LOAN);
    return history.length ? history[0] : null;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
});
