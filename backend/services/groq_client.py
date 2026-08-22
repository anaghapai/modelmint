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


