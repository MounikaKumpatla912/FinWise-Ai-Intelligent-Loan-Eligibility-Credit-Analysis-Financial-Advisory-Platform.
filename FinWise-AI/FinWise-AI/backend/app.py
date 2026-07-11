"""
FinWise AI — Backend Proxy (Optional)
======================================
A minimal Flask server that proxies chat requests to the Anthropic Claude
API. Its only job is to keep your ANTHROPIC_API_KEY off the client — the
frontend never talks to api.anthropic.com directly.

Run locally:
    pip install flask flask-cors anthropic
    export ANTHROPIC_API_KEY="sk-ant-..."
    python app.py

Then set CONFIG.BACKEND_BASE_URL in js/config.js to http://localhost:5000
(or wherever you deploy this — Render, Railway, Fly.io, etc.)
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import anthropic

app = Flask(__name__)
CORS(app)  # allow the static frontend (any origin) to call this API

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are the FinWise AI Financial Advisor, embedded in a fintech
web app. You give clear, practical, encouraging guidance on:
loan eligibility, credit improvement, EMI/budget planning, savings targets,
and beginner-friendly investment suggestions, and emergency fund sizing.

Rules:
- Ground every answer in the user's financial profile when one is provided.
- Never give specific stock, crypto, or fund picks — speak in categories
  and principles only (e.g. "a diversified index fund", not a ticker).
- Keep responses under 180 words, in short paragraphs and "• " bullet
  points where useful, and never use markdown headers or asterisks.
- You are not a licensed financial advisor; add a brief, natural caveat
  only when giving high-stakes advice (large loans, investment decisions).
"""


@app.route("/api/advisor", methods=["POST"])
def advisor():
    body = request.get_json(force=True) or {}
    profile = body.get("profile", {})
    question = body.get("question", "").strip()

    profile_summary = (
        f"Monthly salary: {profile.get('monthlySalary', 'not provided')}, "
        f"Credit score: {profile.get('creditScore', 'not provided')}, "
        f"Existing EMI: {profile.get('existingEmi', 'not provided')}, "
        f"Primary goal: {profile.get('goal', 'general guidance')}."
    )
    user_message = f"My financial profile — {profile_summary}\n\nQuestion: {question or 'Give me a general financial health overview.'}"

    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=500,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_message}],
        )
        reply_text = "".join(
            block.text for block in response.content if block.type == "text"
        )
        return jsonify({"reply": reply_text})
    except Exception as exc:  # noqa: BLE001
        return jsonify({"error": str(exc)}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
