import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from './api/client';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const reply = await sendChatMessage(userMsg.content, newMessages);
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, something went wrong." }]);
    }
    setLoading(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full w-14 h-14 shadow-xl flex items-center justify-center text-xl z-40 transition"
      >
        💬
      </button>
    );
  }

  return (
    <div className={fullScreen ? "fixed inset-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col z-40 overflow-hidden" : "fixed bottom-6 right-6 w-80 h-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col z-40 overflow-hidden"}>
      <div className="bg-slate-800 px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-200">ModelMint Assistant</span>
        <button onClick={() => setFullScreen(!fullScreen)} className="text-slate-400 hover:text-slate-200 text-sm mr-2">{fullScreen ? "⤡" : "⤢"}</button>
        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-200 text-sm">✕</button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <div className="text-xs text-slate-500 text-center mt-8">Ask me about trust scores, models, or how ModelMint works.</div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`text-xs rounded-lg px-3 py-2 max-w-[85%] ${m.role === "user" ? "bg-indigo-600 text-white ml-auto" : "bg-slate-800 text-slate-200"}`}>
            {m.content}
          </div>
        ))}
        {loading && <div className="text-xs text-slate-500">Thinking...</div>}
      </div>
      <form onSubmit={handleSend} className="p-3 border-t border-slate-800 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        />
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-2 rounded-lg transition">Send</button>
      </form>
    </div>
  );
}




