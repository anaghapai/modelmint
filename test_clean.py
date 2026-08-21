import json, re
fake_text = "```json\n{\"persona_name\": \"Accuracy Auditor\", \"score\": 85.0, \"rationale\": \"Matches expected.\", \"flags\": []}\n```"
cleaned = re.sub(r"^```json|```$", "", fake_text.strip(), flags=re.MULTILINE).strip()
print(json.loads(cleaned))
