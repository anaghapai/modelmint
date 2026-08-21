const BASE_URL = "http://localhost:8000/api";
const USE_MOCK = true;

async function fetchJson(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) throw new Error(`API Error [${response.status}]`);
  return response.json();
}

export async function searchModels(query = "") {
  if (!USE_MOCK) return fetchJson(`/models/search?q=${encodeURIComponent(query)}`);
  return {
    query,
    total_results: 1,
    models: [{
      id: "sentiment-distilbert",
      name: "DistilBERT Sentiment Classifier",
      task_type: "text-classification",
      hf_endpoint: "distilbert-base-uncased-finetuned-sst-2-english",
      description: "Ultra-fast binary sentiment analyzer. Guarantees 99% accuracy on customer reviews.",
      price_tier: "Free",
      tags: ["nlp", "sentiment", "fast"]
    }]
  };
}

export async function getModelDetail(modelId) {
  if (!USE_MOCK) return fetchJson(`/models/${modelId}`);
  return {
    id: modelId,
    name: "DistilBERT Sentiment Classifier",
    task_type: "text-classification",
    description: "Ultra-fast binary sentiment analyzer. Guarantees 99% accuracy on customer reviews.",
    tags: ["nlp", "sentiment", "fast"]
  };
}

export async function evaluateModel(modelId) {
  if (!USE_MOCK) return fetchJson(`/models/${modelId}/evaluate`, { method: "POST" });
  return {
    model_id: modelId,
    accuracy: { persona_name: "Accuracy Auditor", score: 82.0, rationale: "Accurate on standard inputs but failed on complex double-negatives.", flags: ["Fails on double negatives"] },
    safety: { persona_name: "Safety Checker", score: 95.0, rationale: "Resisted basic instruction override attempts without policy violations.", flags: [] },
    reliability: { persona_name: "Reliability Auditor", score: 88.0, rationale: "Average latency 120ms with zero malformed output returns.", flags: [] },
    trust_score: 87.7,
    claim_mismatch: {
      has_mismatch: true,
      claim_analyzed: "Guarantees 99% accuracy on customer reviews",
      empirical_reality: "Observed accuracy is 82% under edge-case inputs",
      severity: "HIGH"
    }
  };
}

export async function explainScore(modelId) {
  if (!USE_MOCK) return fetchJson(`/models/${modelId}/explain`, { method: "POST" });
  return {
    model_id: modelId,
    trust_score: 87.7,
    summary: "Model displays strong overall stability and safety, but marketing claims overestimate accuracy on edge-case inputs."
  };
}

export async function runSandbox(modelId, input) {
  if (!USE_MOCK) return fetchJson(`/models/${modelId}/sandbox`, { method: "POST", body: JSON.stringify({ input }) });
  return {
    output: "POSITIVE (Confidence: 98.4%)",
    latency_ms: 114
  };
}