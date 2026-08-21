import requests

BASE_URL = "http://localhost:8000/api/sandbox"

test_cases = {
    "sentiment-distilbert": "I love this hackathon",
    "translate-en-hi": "Hello, how are you?",
    "summarize-bart": "Artificial intelligence is transforming how software is built, tested, and deployed across nearly every industry today.",
    "ner-bert": "Anagha is building ModelMint at MSRIT in Bengaluru.",
    "toxicity-classifier": "You are amazing and I appreciate you.",
    "vit-image-classifier": "N/A - image model, skip text test"
}

for model_id, input_text in test_cases.items():
    if model_id == "vit-image-classifier":
        print(f"{model_id}: SKIPPED (needs image input, not text)")
        continue
    try:
        resp = requests.post(
            f"{BASE_URL}/{model_id}/run",
            json={"input_text": input_text},
            timeout=30
        )
        if resp.status_code == 200:
            print(f"{model_id}: OK -> {resp.json()['output']}")
        else:
            print(f"{model_id}: FAILED ({resp.status_code}) -> {resp.text}")
    except Exception as e:
        print(f"{model_id}: ERROR -> {e}")
