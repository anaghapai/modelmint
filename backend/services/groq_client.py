import os
import json
import re
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
_client = None

def get_groq_client():
    global _client
    if _client is None:
        _client = Groq(api_key=GROQ_API_KEY)
    return _client

def call_groq(prompt: str, expect_json: bool = True) -> dict:
    """Calls Groq chat completion. If expect_json, parses the reply as JSON.
    Returns {"error": ...} on any failure, never raises."""
    try:
        client = get_groq_client()
        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        text = response.choices[0].message.content

        if not expect_json:
            return {"text": text}

        cleaned = re.sub(r"^```json|```$", "", text.strip(), flags=re.MULTILINE).strip()
        return json.loads(cleaned)
    except Exception as e:
        return {"error": str(e)}




def get_recommendation(user_query: str, search_results: list) -> str:
    """Given a user's natural-language need and the top search results,
    ask Groq to write a short recommendation explaining the best fit."""
    if not search_results:
        return "No matching models found for your request."

    results_summary = "\n".join([
        f"- {r['name']} (task: {r['task_type']}, price: {r.get('price_tier', 'free')}): {r['description']}"
        for r in search_results[:3]
    ])

    prompt = f"""A user described their need: "{user_query}"

Here are the top matching models from our catalog:
{results_summary}

In 1-2 short sentences, recommend the single best fit from this list and briefly explain why it matches their need. Be direct and practical. Plain text only, no markdown."""

    result = call_groq(prompt, expect_json=False)
    return result.get("text") or "Unable to generate a recommendation right now."
