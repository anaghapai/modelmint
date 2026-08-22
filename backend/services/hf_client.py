import os
import requests

HF_API_KEY = os.getenv("HF_API_KEY", "")
HF_API_URL = "https://router.huggingface.co/hf-inference/models/{}"

def call_hf_model(hf_endpoint: str, payload: dict) -> dict:
    """Calls a Hugging Face Inference API model endpoint.
    payload example for text models: {"inputs": "some text"}
    Returns the parsed JSON response, or an error dict on failure.
    """
    url = HF_API_URL.format(hf_endpoint)
    headers = {"Authorization": f"Bearer {HF_API_KEY}"} if HF_API_KEY else {}

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        return {"success": True, "data": response.json()}
    except requests.exceptions.HTTPError as e:
        return {"success": False, "error": f"HTTP {response.status_code}: {response.text[:200]}"}
    except requests.exceptions.RequestException as e:
        return {"success": False, "error": str(e)}
