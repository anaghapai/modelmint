const BASE_URL = "http://localhost:8000";
function getToken() { return localStorage.getItem("modelmint_token"); }
function setToken(token) { localStorage.setItem("modelmint_token", token); }
export async function register(email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
  if (!res.ok) throw new Error((await res.json()).detail || "Registration failed");
  const data = await res.json();
  setToken(data.access_token);
  return data;
}
export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
  if (!res.ok) throw new Error((await res.json()).detail || "Login failed");
  const data = await res.json();
  setToken(data.access_token);
  return data;
}
export async function ensureLoggedIn() {
  if (getToken()) return;
  try { await login("demo@modelmint.com", "demo1234"); }
  catch { await register("demo@modelmint.com", "demo1234"); }
}
export async function searchModels(query) {
  const res = await fetch(`${BASE_URL}/api/models/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Search failed");
  const data = await res.json();
  return data.results;
}
export async function getModelDetail(modelId) {
  const res = await fetch(`${BASE_URL}/api/models/${encodeURIComponent(modelId)}`);
  if (!res.ok) throw new Error("Model not found");
  return res.json();
}
export async function runSandbox(modelId, inputText) {
  const token = getToken();
  if (!token) throw new Error("Not logged in — call login() first");
  const res = await fetch(`${BASE_URL}/api/sandbox/${modelId}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ input_text: inputText }),
  });
  if (res.status === 401) throw new Error("Session expired — please log in again");
  if (res.status === 429) throw new Error("Rate limit exceeded — slow down");
  if (!res.ok) throw new Error((await res.json()).detail || "Sandbox call failed");
  return res.json();
}
export async function evaluateModelStream(modelId, onEvent) {
  const res = await fetch(`${BASE_URL}/api/models/${encodeURIComponent(modelId)}/evaluate`, { method: "POST" });
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop();
    for (const part of parts) {
      if (part.startsWith("data: ")) {
        const json = JSON.parse(part.slice(6));
        onEvent(json);
      }
    }
  }
}
export function evaluateModel(modelId) {
  return new Promise((resolve, reject) => {
    let finalResult = null;
    evaluateModelStream(modelId, (event) => { if (event.stage === "final") finalResult = event.result; })
      .then(() => resolve(finalResult))
      .catch(reject);
  });
}
export async function explainScore(modelId) {
  return { explanation: "AI-generated explanation coming soon." };
}
