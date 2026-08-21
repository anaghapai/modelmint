import React, { useEffect, useState } from 'react';
import { getModelDetail, evaluateModel, explainScore, runSandbox } from './api/client';

export default function App() {
  const [model, setModel] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Interactive Sandbox State
  const [sandboxInput, setSandboxInput] = useState("This product works well, but customer support was terrible!");
  const [sandboxResult, setSandboxResult] = useState(null);
  const [loadingSandbox, setLoadingSandbox] = useState(false);

  // Comparison View State
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    async function loadData() {
      const modelData = await getModelDetail("sentiment-distilbert");
      const evalData = await evaluateModel("sentiment-distilbert");
      setModel(modelData);
      setEvaluation(evalData);
    }
    loadData();
  }, []);

  const handleExplain = async () => {
    setLoadingExplain(true);
    const res = await explainScore("sentiment-distilbert");
    setExplanation(res.summary);
    setLoadingExplain(false);
  };

  const handleRunSandbox = async (e) => {
    if (e) e.preventDefault();
    if (!sandboxInput.trim()) return;
    setLoadingSandbox(true);
    const result = await runSandbox("sentiment-distilbert", sandboxInput);
    setSandboxResult(result);
    setLoadingSandbox(false);
  };

  const presetPrompts = [
    { label: "Double Negative", text: "I don't dislike this product at all." },
    { label: "Sarcasm Test", text: "Oh great, another update that breaks everything. Just wonderful!" },
    { label: "Standard Positive", text: "The delivery was fast and the quality exceeded my expectations." },
  ];

  if (!model || !evaluation) {
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
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 text-white font-black px-2.5 py-1 rounded-lg text-lg tracking-wider">MM</div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            ModelMint
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowComparison(!showComparison)}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg transition"
          >
            {showComparison ? "Close Comparison" : "⚡ Compare Models"}
          </button>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ● System Operational
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-8">
        {/* Model Header Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-2xl font-bold text-white">{model.name}</h1>
                <span className="bg-slate-800 text-slate-300 border border-slate-700 text-xs px-2.5 py-0.5 rounded-md font-mono">
                  {model.task_type}
                </span>
              </div>
              <p className="text-slate-400 text-sm">{model.description}</p>
            </div>

            {/* Overall Trust Score Badge */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between md:justify-end gap-4 min-w-[200px]">
              <div className="text-left">
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Trust Score</div>
                <div className="text-2xl font-extrabold text-emerald-400">{evaluation.trust_score}<span className="text-sm font-normal text-slate-500">/100</span></div>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-400 flex items-center justify-center font-bold text-xs text-emerald-400">
                87%
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/60">
            {model.tags?.map((tag) => (
              <span key={tag} className="text-xs bg-slate-800/80 text-slate-400 px-2.5 py-1 rounded-md font-medium">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Claim Mismatch Alert */}
        {evaluation.claim_mismatch?.has_mismatch && (
          <div className="bg-amber-950/40 border border-amber-500/30 p-4 rounded-xl mb-6 flex items-start space-x-3">
            <span className="text-amber-400 text-lg">⚠️</span>
            <div className="text-sm">
              <span className="font-bold text-amber-300 block mb-0.5">Claim Mismatch Detected</span>
              <span className="text-amber-200/80">
                Marketing claim <span className="underline decoration-amber-500/50">"{evaluation.claim_mismatch.claim_analyzed}"</span> contradicts empirical findings: <strong className="text-amber-200">"{evaluation.claim_mismatch.empirical_reality}"</strong>.
              </span>
            </div>
          </div>
        )}

        {/* Side-by-Side Model Comparison Toggle */}
        {showComparison && (
          <div className="bg-slate-900 border border-indigo-500/30 p-6 rounded-2xl mb-6">
            <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-4">Model Benchmark Comparison</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="font-bold text-white block mb-1">DistilBERT Classifier (Current)</span>
                <span className="text-emerald-400 font-mono text-xs block mb-2">Trust Score: 87.7/100</span>
                <span className="text-slate-400 text-xs">Latency: ~120ms | Size: 66M Params</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 opacity-70">
                <span className="font-bold text-white block mb-1">RoBERTa Base (Baseline)</span>
                <span className="text-blue-400 font-mono text-xs block mb-2">Trust Score: 92.1/100</span>
                <span className="text-slate-400 text-xs">Latency: ~340ms | Size: 125M Params</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 mb-6 space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 text-sm font-medium transition ${
              activeTab === "overview"
                ? "border-b-2 border-indigo-500 text-indigo-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Audit Breakdown
          </button>
          <button
            onClick={() => setActiveTab("sandbox")}
            className={`pb-3 text-sm font-medium transition ${
              activeTab === "sandbox"
                ? "border-b-2 border-indigo-500 text-indigo-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Live Sandbox
          </button>
        </div>

        {/* Tab 1: Audit Breakdown */}
        {activeTab === "overview" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { title: "Accuracy", data: evaluation.accuracy, color: "bg-blue-500", tip: "Evaluates correct classification on standard and edge-case datasets." },
                { title: "Safety", data: evaluation.safety, color: "bg-emerald-500", tip: "Measures resistance to jailbreaks, prompt injection, and policy breaches." },
                { title: "Reliability", data: evaluation.reliability, color: "bg-indigo-500", tip: "Tracks average latency, response stability, and output formatting." },
              ].map((persona, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-xl group relative">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-medium text-slate-300 text-sm">{persona.title}</span>
                      <span className="text-xs text-slate-500 cursor-help" title={persona.tip}>ⓘ</span>
                    </div>
                    <span className="font-bold text-slate-100">{persona.data.score}/100</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mb-3 overflow-hidden">
                    <div 
                      className={`${persona.color} h-full rounded-full`} 
                      style={{ width: `${persona.data.score}%` }}
                    ></div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">{persona.data.rationale}</p>
                </div>
              ))}
            </div>

            {/* Explain Score Section */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">AI Score Explanation</h3>
                  <p className="text-xs text-slate-400">Generate synthesized insights behind these metrics.</p>
                </div>
                <button
                  onClick={handleExplain}
                  disabled={loadingExplain}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm px-4 py-2 rounded-lg transition disabled:opacity-50"
                >
                  {loadingExplain ? "Analyzing..." : "Explain Score"}
                </button>
              </div>

              {explanation && (
                <div className="mt-4 p-4 bg-indigo-950/40 border border-indigo-500/20 rounded-lg text-sm text-indigo-200 leading-relaxed">
                  {explanation}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Live Sandbox */}
        {activeTab === "sandbox" && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h2 className="text-base font-semibold text-slate-200 mb-1">Test Model Inference</h2>
            <p className="text-xs text-slate-400 mb-4">Run custom inputs through this model to evaluate output confidence and response latency.</p>

            {/* Preset Test Prompts */}
            <div className="mb-4">
              <span className="text-xs font-medium text-slate-400 block mb-2">Try Preset Edge Cases:</span>
              <div className="flex flex-wrap gap-2">
                {presetPrompts.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSandboxInput(preset.text)}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg transition"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleRunSandbox} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Input Text</label>
                <textarea
                  rows={3}
                  value={sandboxInput}
                  onChange={(e) => setSandboxInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="Enter sample prompt..."
                />
              </div>

              <button
                type="submit"
                disabled={loadingSandbox}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm px-5 py-2 rounded-lg transition disabled:opacity-50"
              >
                {loadingSandbox ? "Running..." : "Run Inference"}
              </button>
            </form>

            {sandboxResult && (
              <div className="mt-6 border-t border-slate-800 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Output Result</span>
                  <span className="text-xs text-slate-500 font-mono">{sandboxResult.latency_ms}ms latency</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg text-emerald-400 font-mono text-sm">
                  {sandboxResult.output}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}