"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../hooks/useCaroSocket";
import { SendHorizontal } from "lucide-react";

interface ChatBoxProps {
  messages: ChatMessage[];
  onSendMessage: (msg: string) => void;
  currentUserName: string;
}

export default function ChatBox({ messages, onSendMessage, currentUserName }: ChatBoxProps) {
  const [msg, setMsg] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const emojis = ["😄", "😭", "😡", "👍", "❤️", "🔥", "🤔", "👏"];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text: string) => {
    if (text.trim()) {
      onSendMessage(text.trim());
      setMsg("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="p-4 border-b bg-slate-50 font-bold text-slate-700">Live Chat</div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((m, i) => {
          const isMe = m.userName === currentUserName;
          const isSystem = m.userName === "Hệ thống";
          return (
            <div key={i} className={`flex flex-col ${isSystem ? 'items-center' : isMe ? 'items-end' : 'items-start'}`}>
              {isSystem ? (
                <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{m.msg}</span>
              ) : (
                <>
                  <span className="text-xs text-slate-500 mb-1 ml-1">{m.userName}</span>
                  <div className={`px-4 py-2 max-w-[85%] rounded-2xl ${isMe ? 'bg-purple-600 text-white rounded-br-sm shadow-md' : 'bg-slate-100 text-slate-800 rounded-bl-sm'}`}>
                    {m.msg}
                  </div>
                </>
              )}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Emoji Bar */}
      <div className="flex gap-2 p-2 px-4 border-t bg-slate-50 overflow-x-auto hide-scrollbar">
        {emojis.map((em, i) => (
          <button key={i} onClick={() => handleSend(em)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-xl">
            {em}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 bg-white flex gap-2 w-full">
        <input 
          type="text" 
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(msg)}
          placeholder="Nhắn tin..."
          className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none w-0 min-w-0"
        />
        <button 
          onClick={() => handleSend(msg)}
          disabled={!msg.trim()}
          className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors flex-shrink-0"
        >
          <SendHorizontal className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
