/* ==========================================================================
   FinWise AI — AI Financial Advisor Module
   ========================================================================== */

const Advisor = (() => {

  function getProfile() {
    return {
      monthlySalary: parseFloat(document.getElementById("adv-salary")?.value) || 0,
      creditScore: parseFloat(document.getElementById("adv-credit")?.value) || 0,
      existingEmi: parseFloat(document.getElementById("adv-emi")?.value) || 0,
      goal: document.getElementById("adv-goal")?.value || "general"
    };
  }

  function appendMessage(container, text, sender) {
    const msg = document.createElement("div");
    msg.className = `msg ${sender}`;
    msg.innerHTML = formatMessage(text);
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
    return msg;
  }

  function formatMessage(text) {
    // Turn "• " bullet lines into a proper list; escape basic HTML first.
    const escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const lines = escaped.split("\n");
    let html = "";
    let inList = false;

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith("• ") || trimmed.startsWith("- ")) {
        if (!inList) { html += "<ul>"; inList = true; }
        html += `<li>${trimmed.slice(2)}</li>`;
      } else {
        if (inList) { html += "</ul>"; inList = false; }
        if (trimmed) html += `<p>${trimmed}</p>`;
      }
    });
    if (inList) html += "</ul>";
    return html;
  }

  function showTyping(container) {
    const typing = document.createElement("div");
    typing.className = "typing-dots";
    typing.id = "typing-indicator";
    typing.innerHTML = "<span></span><span></span><span></span>";
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;
  }

  function hideTyping() {
    document.getElementById("typing-indicator")?.remove();
  }

  async function sendMessage(container, input, text) {
    if (!text.trim()) return;
    appendMessage(container, text, "user");
    input.value = "";

    showTyping(container);
    const profile = getProfile();
    const reply = await FinAPI.generateAIAdvice(profile, text);
    hideTyping();
    appendMessage(container, reply, "bot");
  }

  function init() {
    const container = document.getElementById("chat-messages");
    const input = document.getElementById("chat-input");
    const sendBtn = document.getElementById("chat-send");
    if (!container || !input) return;

    sendBtn.addEventListener("click", () => sendMessage(container, input, input.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendMessage(container, input, input.value);
    });

    document.querySelectorAll(".chip").forEach(chip => {
      chip.addEventListener("click", () => sendMessage(container, input, chip.dataset.prompt || chip.textContent));
    });

    // Opening message
    setTimeout(() => {
      appendMessage(
        container,
        "Hi, I'm your FinWise AI advisor. Fill in your financial snapshot on the left, then ask me anything about loans, credit, savings, budgeting, or investing.",
        "bot"
      );
    }, 400);
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", Advisor.init);
