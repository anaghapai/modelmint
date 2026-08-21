import requests
import time

BASE_URL = "http://localhost:8000/api/models"
models = ["sentiment-distilbert", "translate-en-hi", "summarize-bart", "ner-bert", "toxicity-classifier"]

for model_id in models:
    try:
        resp = requests.post(f"{BASE_URL}/{model_id}/evaluate", timeout=60)
        if resp.status_code == 200:
            first_line = resp.text.split("\n")[0]
            print(f"{model_id}: OK -> {first_line[:150]}")
        else:
            print(f"{model_id}: FAILED ({resp.status_code}) -> {resp.text[:200]}")
    except Exception as e:
        print(f"{model_id}: ERROR -> {e}")
    time.sleep(20)