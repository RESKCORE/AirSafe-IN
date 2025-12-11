import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Search, Send, X, Loader2, Sparkles, ChevronDown } from 'lucide-react';
import { CityName } from '../types';
import { sendMessageToGemini, isGeminiConfigured, ConversationTurn } from '../services/geminiService';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

interface InlineCopilotSearchProps {
  selectedCity: CityName;
  systemInstruction: string;
}

interface QAPair {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
}

export interface InlineCopilotSearchRef {
  submitQuestion: (question: string) => Promise<void>;
}

const InlineCopilotSearch = forwardRef<InlineCopilotSearchRef, InlineCopilotSearchProps>(
  ({ selectedCity, systemInstruction }, ref) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<QAPair[]>([]);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isChatConfigured = isGeminiConfigured();
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-collapse after inactivity
  useEffect(() => {
    if (isExpanded && conversation.length > 0) {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      inactivityTimerRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, 180000); // 3 minutes
    }
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [isExpanded, conversation]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
        setIsFocused(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isExpanded]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) && isExpanded) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  // Expose submitQuestion method via ref
  useImperativeHandle(ref, () => ({
    submitQuestion: async (question: string) => {
      if (!question.trim()) return;
      
      if (!isChatConfigured) {
        setError('Add GEMINI_API_KEY in .env.local to use the copilot.');
        return;
      }

      setIsLoading(true);
      setError(null);
      setIsExpanded(true);

      try {
        const conversationTurns: ConversationTurn[] = conversation.map(qa => [
          { role: 'user' as const, text: qa.question },
          { role: 'model' as const, text: qa.answer }
        ]).flat();
        
        conversationTurns.push({
          role: 'user',
          text: `[User Context: Currently viewing ${selectedCity}] ${question}`
        });

        const response = await sendMessageToGemini(conversationTurns, systemInstruction);

        const newQA: QAPair = {
          id: Date.now().toString(),
          question: question,
          answer: response,
          timestamp: new Date()
        };

        setConversation(prev => [...prev, newQA]);
      } catch (err) {
        console.error('Copilot error:', err);
        setError('Unable to reach the copilot. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  }), [conversation, selectedCity, systemInstruction, isChatConfigured]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!isChatConfigured) {
      setError('Add GEMINI_API_KEY in .env.local to use the copilot.');
      return;
    }

    const userQuestion = input.trim();
    setInput('');
    setIsLoading(true);
    setError(null);
    setIsExpanded(true);

    try {
      // Build conversation turns
      const conversationTurns: ConversationTurn[] = conversation.map(qa => [
        { role: 'user' as const, text: qa.question },
        { role: 'model' as const, text: qa.answer }
      ]).flat();
      
      conversationTurns.push({
        role: 'user',
        text: `[User Context: Currently viewing ${selectedCity}] ${userQuestion}`
      });

      const response = await sendMessageToGemini(conversationTurns, systemInstruction);

      const newQA: QAPair = {
        id: Date.now().toString(),
        question: userQuestion,
        answer: response,
        timestamp: new Date()
      };

      setConversation(prev => [...prev, newQA]);
    } catch (err) {
      console.error('Copilot error:', err);
      setError('Unable to reach the copilot. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsExpanded(false);
    setIsFocused(false);
    setInput('');
  };

  const visibleConversation = showAllHistory ? conversation : conversation.slice(-2);
  const hasHiddenHistory = conversation.length > 2 && !showAllHistory;

  return (
    <div className="relative w-full" ref={panelRef}>
      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={cn(
            'flex items-center gap-2 rounded-full border bg-white px-4 transition-all duration-200',
            isFocused || isExpanded
              ? 'border-emerald-400 shadow-lg shadow-emerald-100/50 py-3'
              : 'border-emerald-100 py-2.5',
            !isChatConfigured && 'opacity-60'
          )}
        >
          <Search size={16} className={cn('text-emerald-400 transition-colors', isFocused && 'text-emerald-600')} />
          {isChatConfigured && (isFocused || isExpanded) && (
            <span className="flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => !isExpanded && setIsFocused(false)}
            placeholder={
              isFocused || isExpanded
                ? `Ask about air in ${selectedCity} or get health guidance…`
                : 'Search cities or ask AI copilot'
            }
            className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-emerald-300"
          />
          {!isChatConfigured && (isFocused || isExpanded) && (
            <div className="absolute -bottom-8 left-0 text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded">
              Add GEMINI_API_KEY to .env.local
            </div>
          )}
          {input.trim() && (
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white transition hover:bg-emerald-600 disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          )}
          {isExpanded && conversation.length > 0 && (
            <button
              type="button"
              onClick={handleClose}
              className="flex h-7 w-7 items-center justify-center rounded-full text-emerald-500 hover:bg-emerald-50"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </form>

      {/* Quick Suggestions - Show when focused but no conversation yet */}
      {isFocused && !isExpanded && conversation.length === 0 && input.length === 0 && isChatConfigured && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-emerald-100 bg-white p-3 shadow-lg md:w-[500px]">
          <p className="text-xs text-emerald-600/80 mb-2 font-medium">Try asking:</p>
          <div className="space-y-1.5">
            {[
              `How risky is the air in ${selectedCity} today?`,
              'Should I exercise outdoors this evening?',
              'What precautions should I take?'
            ].map((suggestion, idx) => (
              <button
                key={idx}
                onClick={async () => {
                  setInput(suggestion);
                  setIsFocused(false);
                  
                  if (!isChatConfigured) {
                    setError('Add GEMINI_API_KEY in .env.local to use the copilot.');
                    return;
                  }

                  setIsLoading(true);
                  setError(null);
                  setIsExpanded(true);

                  try {
                    const conversationTurns: ConversationTurn[] = [];
                    conversationTurns.push({
                      role: 'user',
                      text: `[User Context: Currently viewing ${selectedCity}] ${suggestion}`
                    });

                    const response = await sendMessageToGemini(conversationTurns, systemInstruction);

                    const newQA: QAPair = {
                      id: Date.now().toString(),
                      question: suggestion,
                      answer: response,
                      timestamp: new Date()
                    };

                    setConversation([newQA]);
                    setInput('');
                  } catch (err) {
                    console.error('Copilot error:', err);
                    setError('Unable to reach the copilot. Please try again.');
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="w-full text-left text-xs text-emerald-700 hover:bg-emerald-50 px-3 py-2 rounded-lg transition flex items-center gap-2"
              >
                <Sparkles size={12} className="text-emerald-400" />
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Expanded Panel */}
      {(isExpanded || isLoading) && (
        <>
          {/* Mobile Overlay */}
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" onClick={handleClose} />
          
          {/* Panel */}
          <div className="fixed inset-x-4 top-20 bottom-4 z-50 overflow-y-auto rounded-3xl border border-emerald-100 bg-white shadow-2xl md:absolute md:inset-x-auto md:top-full md:right-0 md:bottom-auto md:left-auto md:mt-2 md:w-[600px] md:max-h-[60vh]">
            <div className="p-4 space-y-4">

              {/* Close button for mobile */}
              <div className="flex items-center justify-between mb-2 md:hidden">
                <h3 className="text-sm font-semibold text-emerald-700">AirSafe Copilot</h3>
                <button
                  onClick={handleClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-emerald-500 hover:bg-emerald-50"
                >
                  <X size={18} />
                </button>
              </div>
              
            {/* History Toggle */}
            {hasHiddenHistory && (
              <button
                onClick={() => setShowAllHistory(!showAllHistory)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-2 text-xs text-emerald-600 hover:bg-emerald-50"
              >
                <ChevronDown size={14} />
                View {conversation.length - 2} previous answer{conversation.length - 2 > 1 ? 's' : ''}
              </button>
            )}

            {/* Conversation */}
            {visibleConversation.map((qa) => (
              <div key={qa.id} className="space-y-3">
                {/* User Question */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-emerald-500 px-4 py-2.5 text-sm text-white shadow-sm">
                    {qa.question}
                  </div>
                </div>

                {/* AI Answer */}
                <div className="flex justify-start">
                  <div className="max-w-[90%] rounded-2xl rounded-tl-sm border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30 px-4 py-3 text-sm text-slate-700 shadow-sm">
                    <div className="space-y-2">
                      <ReactMarkdown
                        components={{
                          strong: ({ node, ...props }) => (
                            <span className="font-semibold text-emerald-700" {...props} />
                          ),
                          ul: ({ node, ...props }) => <ul className="ml-4 list-disc space-y-1" {...props} />,
                          li: ({ node, ...props }) => <li className="marker:text-emerald-500" {...props} />,
                          p: ({ node, ...props }) => <p className="leading-relaxed" {...props} />,
                          h3: ({ node, ...props }) => (
                            <h3 className="font-semibold text-emerald-700 mb-1" {...props} />
                          ),
                        }}
                      >
                        {qa.answer}
                      </ReactMarkdown>
                    </div>
                    <p className="mt-2 text-xs text-emerald-400">
                      {qa.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm text-emerald-700 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Analyzing air quality data…</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600">
                {error}
              </div>
            )}

            {/* Footer Hint */}
            <div className="flex items-center justify-between border-t border-emerald-100 pt-3 text-[10px] text-emerald-500/80">
              <span className="flex items-center gap-1">
                <Sparkles size={12} className="text-emerald-400" /> AI guidance • verify before acting
              </span>
              <span>Powered by Gemini</span>
            </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

export default InlineCopilotSearch;
