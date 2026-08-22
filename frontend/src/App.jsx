import React, { useEffect, useState } from 'react';
import { getModelDetail, evaluateModel, explainScore, runSandbox, ensureLoggedIn } from './api/client';

const AVAILABLE_MODELS = [
  { id: "sentiment-distilbert", label: "Sentiment (DistilBERT)" },
  { id: "translate-en-hi", label: "Translation EN->HI" },
  { id: "summarize-bart", label: "Summarization (BART)" },
  { id: "ner-bert", label: "Named Entity Recognition" },
  { id: "toxicity-classifier", label: "Toxicity Detection" },
  { id: "vit-image-classifier", label: "Image Classification (sandbox only)" },
];

export default function App() {
  const [selectedModelId, setSelectedModelId] = useState("sentiment-distilbert");
  const [model, setModel] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [evalError, setEvalError] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [loadingModel, setLoadingModel] = useState(true);
  const [loadingEval, setLoadingEval] = useState(false);
  const [sandboxInput, setSandboxInput] = useState("This product works well, but customer support was terrible!");
  const [sandboxResult, setSandboxResult] = useState(null);
  const [loadingSandbox, setLoadingSandbox] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setLoadingModel(true);
      setLoadingEval(true);
      setEvalError("");
      setEvaluation(null);
      setExplanation("");
      setSandboxResult(null);
      setModel(null);
      await ensureLoggedIn();
      try {
        const modelData = await getModelDetail(selectedModelId);
        if (!cancelled) setModel(modelData);
      } catch (err) {
        if (!cancelled) setModel(null);
      }
      if (!cancelled) setLoadingModel(false);
      try {
        const evalData = await evaluateModel(selectedModelId);
        if (!cancelled) setEvaluation(evalData);
      } catch (err) {
        if (!cancelled) setEvalError(err.message || "Evaluation not available for this model.");
      }
      if (!cancelled) setLoadingEval(false);
    }
    loadData();
    return () => { cancelled = true; };
  }, [selectedModelId]);

  const handleExplain = async () => {
    setLoadingExplain(true);
    try {
      const res = await explainScore(selectedModelId);
      setExplanation(res.explanation || res.summary || "No explanation available.");
    } catch (err) {
      setExplanation("Explain feature not available yet.");
    }
    setLoadingExplain(false);
  };

  const handleRunSandbox = async (e) => {
    if (e) e.preventDefault();
    if (!sandboxInput.trim()) return;
    setLoadingSandbox(true);
    try {
      const result = await runSandbox(selectedModelId, sandboxInput);
      setSandboxResult(result);
    } catch (err) {
      setSandboxResult({ output: `Error: ${err.message}`, latency_ms: 0 });
    }
    setLoadingSandbox(false);
  };

  const presetPrompts = [
    { label: "Double Negative", text: "I don't dislike this product at all." },
    { label: "Sarcasm Test", text: "Oh great, another update that breaks everything. Just wonderful!" },
    { label: "Standard Positive", text: "The delivery was fast and the quality exceeded my expectations." },
  ];

  if (loadingModel && !model) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-200 font-sans">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-medium text-sm">Loading ModelMint Intelligence...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 text-white font-black px-2.5 py-1 rounded-lg text-lg tracking-wider">MM</div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">ModelMint</span>
        </div>
        <div className="flex items-center space-x-3">
          <select value={selectedModelId} onChange={(e) => setSelectedModelId(e.target.value)} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg transition cursor-pointer">
            {AVAILABLE_MODELS.map((m) => (<option key={m.id} value={m.id}>{m.label}</option>))}
          </select>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">System Operational</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-8">
        {model && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <h1 className="text-2xl font-bold text-white">{model.name}</h1>
                  <span className="bg-slate-800 text-slate-300 border border-slate-700 text-xs px-2.5 py-0.5 rounded-md font-mono">{model.task_type}</span>
                </div>
                <p className="text-slate-400 text-sm">{model.description}</p>
              </div>
              {evaluation && (
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between md:justify-end gap-4 min-w-[200px]">
                  <div className="text-left">
                    <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Trust Score</div>
                    <div className="text-2xl font-extrabold text-emerald-400">{evaluation.trust_score}<span className="text-sm font-normal text-slate-500">/100</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {loadingEval && (
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl mb-6 text-sm text-slate-400 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            Running live audit against Gemini...
          </div>
        )}

        {!loadingEval && evalError && (
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl mb-6 text-sm text-slate-400">
            Audit not available for this model: {evalError}. Try the Live Sandbox tab instead.
          </div>
        )}

        <div className="flex border-b border-slate-800 mb-6 space-x-8">
          <button onClick={() => setActiveTab("overview")} className={`pb-3 text-sm font-medium transition ${activeTab === "overview" ? "border-b-2 border-indigo-500 text-indigo-400" : "text-slate-400 hover:text-slate-200"}`}>Audit Breakdown</button>
          <button onClick={() => setActiveTab("sandbox")} className={`pb-3 text-sm font-medium transition ${activeTab === "sandbox" ? "border-b-2 border-indigo-500 text-indigo-400" : "text-slate-400 hover:text-slate-200"}`}>Live Sandbox</button>
        </div>

        {activeTab === "overview" && evaluation && !loadingEval && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { title: "Accuracy", data: evaluation.accuracy, color: "bg-blue-500" },
                { title: "Safety", data: evaluation.safety, color: "bg-emerald-500" },
                { title: "Reliability", data: evaluation.reliability, color: "bg-indigo-500" },
              ].map((persona, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-slate-300 text-sm">{persona.title}</span>
                    <span className="font-bold text-slate-100">{persona.data.score}/100</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mb-3 overflow-hidden">
                    <div className={`${persona.color} h-full rounded-full`} style={{ width: `${persona.data.score}%` }}></div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{persona.data.rationale}</p>
                </div>
              ))}
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">AI Score Explanation</h3>
                  <p className="text-xs text-slate-400">Generate synthesized insights behind these metrics.</p>
                </div>
                <button onClick={handleExplain} disabled={loadingExplain} className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm px-4 py-2 rounded-lg transition disabled:opacity-50">
                  {loadingExplain ? "Analyzing..." : "Explain Score"}
                </button>
              </div>
              {explanation && (<div className="mt-4 p-4 bg-indigo-950/40 border border-indigo-500/20 rounded-lg text-sm text-indigo-200 leading-relaxed">{explanation}</div>)}
            </div>
          </div>
        )}

        {activeTab === "sandbox" && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h2 className="text-base font-semibold text-slate-200 mb-1">Test Model Inference</h2>
            <p className="text-xs text-slate-400 mb-4">Run custom inputs through this model to evaluate output confidence and response latency.</p>
            <div className="mb-4">
              <span className="text-xs font-medium text-slate-400 block mb-2">Try Preset Edge Cases:</span>
              <div className="flex flex-wrap gap-2">
                {presetPrompts.map((preset, idx) => (
                  <button key={idx} type="button" onClick={() => setSandboxInput(preset.text)} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg transition">{preset.label}</button>
                ))}
              </div>
            </div>
            <form onSubmit={handleRunSandbox} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Input Text</label>
                <textarea rows={3} value={sandboxInput} onChange={(e) => setSandboxInput(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono" placeholder="Enter sample prompt..." />
              </div>
              <button type="submit" disabled={loadingSandbox} className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm px-5 py-2 rounded-lg transition disabled:opacity-50">
                {loadingSandbox ? "Running..." : "Run Inference"}
              </button>
            </form>
            {sandboxResult && (
              <div className="mt-6 border-t border-slate-800 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Output Result</span>
                  <span className="text-xs text-slate-500 font-mono">{sandboxResult.latency_ms}ms latency</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg text-emerald-400 font-mono text-sm break-words">
                  {JSON.stringify(sandboxResult.output ?? sandboxResult, null, 2)}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
