const BASE_URL = "http://localhost:8000";

function getToken() {
  return localStorage.getItem("modelmint_token");
}

function setToken(token) {
  localStorage.setItem("modelmint_token", token);
}

export async function register(email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Registration failed");
  const data = await res.json();
  setToken(data.access_token);
  return data;
}

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Login failed");
  const data = await res.json();
  setToken(data.access_token);
  return data;
}

export async function searchModels(query) {
  const res = await fetch(`${BASE_URL}/api/models/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Search failed");
  const data = await res.json();
  return data.results; // array of { id, name, task_type, description, score }
}

export async function runSandbox(modelId, inputText) {
  const token = getToken();
  if (!token) throw new Error("Not logged in — call login() first");

  const res = await fetch(`${BASE_URL}/api/sandbox/${modelId}/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ input_text: inputText }),
  });
  if (res.status === 401) throw new Error("Session expired — please log in again");
  if (res.status === 429) throw new Error("Rate limit exceeded — slow down");
  if (!res.ok) throw new Error((await res.json()).detail || "Sandbox call failed");
  return res.json(); // { model_id, input, output }
}

// SSE stream — pass an onEvent callback that receives each stage as it arrives
export function evaluateModel(modelId, onEvent, onDone, onError) {
  const eventSource = new EventSource(
    `${BASE_URL}/api/models/${encodeURIComponent(modelId)}/evaluate`
  );
  // Note: this endpoint is POST in the backend, but EventSource only does GET.
  // Simplest fix for now: use fetch + manual stream reading instead (see below).
  eventSource.close(); // placeholder — replaced by real implementation below
}

// Real implementation: evaluate is POST, so we can't use native EventSource.
// This manually reads the streamed response instead.
export async function evaluateModelStream(modelId, onEvent) {
  const res = await fetch(`${BASE_URL}/api/models/${encodeURIComponent(modelId)}/evaluate`, {
    method: "POST",
  });
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split("\n\n");
    buffer = parts.pop(); // keep incomplete chunk for next read

    for (const part of parts) {
      if (part.startsWith("data: ")) {
        const json = JSON.parse(part.slice(6));
        onEvent(json); // { stage: "accuracy"|"safety"|"reliability"|"final", result: {...} }
      }
    }
  }
}