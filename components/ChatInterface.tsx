import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Stethoscope, Sparkles } from 'lucide-react';
import { ChatMessage, CityName } from '../types';
import { sendMessageToGemini, isGeminiConfigured, ConversationTurn } from '../services/geminiService';
import { INITIAL_CHAT_MESSAGE } from '../constants';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

interface ChatInterfaceProps {
  selectedCity: CityName;
  systemInstruction: string;
  triggerQuestion?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ selectedCity, systemInstruction, triggerQuestion }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'model',
      text: INITIAL_CHAT_MESSAGE,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isChatConfigured = isGeminiConfigured();

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    setMessages([
      {
        id: 'init',
        role: 'model',
        text: INITIAL_CHAT_MESSAGE,
        timestamp: new Date()
      }
    ]);
    setChatError(null);
  }, [systemInstruction]);

  // Handle trigger question from external button
  useEffect(() => {
    if (triggerQuestion && triggerQuestion.trim()) {
      setInput(triggerQuestion);
      // Small delay to ensure input is set
      setTimeout(() => {
        const sendButton = document.querySelector('[data-chat-send-button]') as HTMLButtonElement;
        if (sendButton) {
          sendButton.click();
        }
      }, 100);
    }
  }, [triggerQuestion]);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!isChatConfigured) {
      setChatError('Add a valid GEMINI_API_KEY in .env.local to chat with the copilot.');
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setChatError(null);

    try {
      const conversationTurns: ConversationTurn[] = [...messages.filter(msg => msg.id !== 'init'), userMsg].map((msg) => ({
        role: msg.role,
        text: msg.id === userMsg.id ? `[User Context: Currently viewing ${selectedCity}] ${msg.text}` : msg.text,
      }));

      const responseText = await sendMessageToGemini(conversationTurns, systemInstruction);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const fallbackText = err instanceof Error ? err.message : 'Something went wrong while contacting the copilot.';
      setChatError(fallbackText);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Sorry, I couldn't connect to the AirSafe network. Please check your connection.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex h-[465px] w-full flex-col overflow-hidden border-emerald-50 bg-white/90 shadow-lg shadow-emerald-100/50">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
              <Stethoscope size={18} strokeWidth={2.4} />
            </div>
            <div>
              <CardTitle className="text-lg">AirSafe Copilot</CardTitle>
              <CardDescription>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live guardian for {selectedCity}
                </span>
              </CardDescription>
            </div>
          </div>
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Gemini</Badge>
        </div>
        <p className="text-xs text-emerald-700/80">
          Ask about exposure risks, safe routines, or health guidance tailored to the latest particulate readings.
        </p>
        <div className="flex flex-col gap-1.5 pt-2 border-t border-emerald-100/50">
          <p className="text-[11px] text-emerald-500/90 italic flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-emerald-400"></span>
            Copilot is using {selectedCity}'s current values in its advice
          </p>
          <p className="text-[10px] text-amber-600/90 font-medium">
            Educational guidance only – not a medical diagnosis
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-dashed border-emerald-100/80 bg-gradient-to-br from-white via-white to-emerald-50/40">
        <div ref={scrollRef} className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={cn('flex flex-col gap-1 text-sm', msg.role === 'user' ? 'items-end text-emerald-900' : 'items-start text-slate-700')}>
                <div
                  className={cn(
                    'max-w-[90%] rounded-2xl border px-4 py-3 text-sm leading-relaxed shadow-sm',
                    msg.role === 'user'
                      ? 'rounded-tr-sm border-emerald-500/40 bg-emerald-500 text-white shadow-emerald-500/20'
                      : 'rounded-tl-sm border-emerald-100 bg-white/80'
                  )}
                >
                  {msg.role === 'model' ? (
                    <div className="space-y-2">
                      <ReactMarkdown
                        components={{
                          strong: ({ node, ...props }) => <span className="font-semibold text-emerald-700" {...props} />,
                          ul: ({ node, ...props }) => <ul className="ml-4 list-disc space-y-1" {...props} />,
                          li: ({ node, ...props }) => <li className="marker:text-emerald-500" {...props} />,
                          p: ({ node, ...props }) => <p className="leading-relaxed" {...props} />,
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
                <span className="text-xs text-emerald-400/80">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-full bg-emerald-100/70 p-2 text-emerald-600">
                  <Loader2 size={16} className="animate-spin" />
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm text-emerald-700 shadow-sm">
                  Synthesising guidance…
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <div className="relative flex items-center gap-2 rounded-xl border border-emerald-100 bg-white px-3 py-2 shadow-sm">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Quick check on ${selectedCity}…`}
              className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-emerald-300"
              disabled={isLoading || !isChatConfigured}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isLoading || !isChatConfigured}
              className="h-9 w-9 rounded-full bg-emerald-500 text-white transition hover:bg-emerald-600 disabled:opacity-60"
              data-chat-send-button
            >
              <Send size={16} />
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-emerald-500/80">
            <span className="flex items-center gap-1"><Sparkles size={12} className="text-emerald-400" /> Try: “How risky is an evening run?”</span>
            <span>AI guidance · verify before acting.</span>
          </div>
          {chatError && <p className="text-xs font-medium text-red-600">{chatError}</p>}
          {!isChatConfigured && !chatError && (
            <p className="text-xs text-amber-600">Add GEMINI_API_KEY in .env.local to enable responses.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
