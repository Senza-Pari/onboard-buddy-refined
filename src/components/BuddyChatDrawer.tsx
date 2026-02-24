import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Bot, Volume2, Square } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useBuddyContext } from '../hooks/useBuddyContext';
import useAuthStore from '../stores/authStore';

type Msg = { role: 'user' | 'assistant'; content: string };

const PROJECT_ID = 'tsfnrqcrttxaorcxkhoy';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || `https://${PROJECT_ID}.supabase.co`;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const CHAT_URL = `${SUPABASE_URL}/functions/v1/onboarding-buddy`;
const TTS_URL = `${SUPABASE_URL}/functions/v1/elevenlabs-tts`;

const QUICK_CHIPS = [
  "What's next?",
  "My progress",
  "Who should I meet?",
];

function stripMarkdown(md: string): string {
  return md
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/!\[.*?\]\(.+?\)/g, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

async function streamChat({
  messages,
  context,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  context: string;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({ messages, context }),
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({ error: 'Request failed' }));
    onError(body.error || 'Something went wrong');
    return;
  }

  if (!resp.body) {
    onError('No response body');
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let done = false;

  while (!done) {
    const { done: readerDone, value } = await reader.read();
    if (readerDone) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
      let line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.startsWith(':') || line.trim() === '') continue;
      if (!line.startsWith('data: ')) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === '[DONE]') { done = true; break; }
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        buffer = line + '\n' + buffer;
        break;
      }
    }
  }

  // flush remaining
  if (buffer.trim()) {
    for (let raw of buffer.split('\n')) {
      if (!raw) continue;
      if (raw.endsWith('\r')) raw = raw.slice(0, -1);
      if (raw.startsWith(':') || raw.trim() === '') continue;
      if (!raw.startsWith('data: ')) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === '[DONE]') continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}

interface BuddyChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEMO_MSG_LIMIT = 10;

const BuddyChatDrawer: React.FC<BuddyChatDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [loadingTtsIndex, setLoadingTtsIndex] = useState<number | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const context = useBuddyContext();
  const { user } = useAuthStore();
  const isGuest = user?.id === 'demo-user';
  const isLimitReached = isGuest && messageCount >= DEMO_MSG_LIMIT;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    setPlayingIndex(null);
  }, []);

  const playTts = useCallback(async (text: string, index: number) => {
    // If already playing this message, stop it
    if (playingIndex === index) {
      stopAudio();
      return;
    }

    // Stop any current playback
    stopAudio();
    setLoadingTtsIndex(index);

    try {
      const plainText = stripMarkdown(text);
      const response = await fetch(TTS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({ text: plainText, voiceId: 'JBFqnCBsd6RMkjVDRZzb' }),
      });

      if (!response.ok) {
        throw new Error('TTS request failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        stopAudio();
      };

      audio.onerror = () => {
        stopAudio();
      };

      setLoadingTtsIndex(null);
      setPlayingIndex(index);
      await audio.play();
    } catch (err) {
      console.error('TTS playback error:', err);
      setLoadingTtsIndex(null);
      stopAudio();
    }
  }, [playingIndex, stopAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopAudio();
  }, [stopAudio]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading || isLimitReached) return;

    setMessageCount((c) => c + 1);

    const userMsg: Msg = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    let assistantSoFar = '';
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
          );
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: [...messages, userMsg],
        context,
        onDelta: upsertAssistant,
        onDone: () => setIsLoading(false),
        onError: (msg) => {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: `⚠️ ${msg}` },
          ]);
          setIsLoading(false);
        },
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ Connection error. Please try again.' },
      ]);
      setIsLoading(false);
    }
  };

  const getTtsIcon = (index: number) => {
    if (loadingTtsIndex === index) {
      return <Loader2 size={14} className="animate-spin text-neutral-400" />;
    }
    if (playingIndex === index) {
      return <Square size={14} className="text-primary-600" />;
    }
    return <Volume2 size={14} className="text-neutral-400" />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-lg flex flex-col"
            style={{ maxHeight: '65vh' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <Bot size={18} className="text-primary-700" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">Buddy</h3>
                  <p className="text-xs text-neutral-500">
                    {isGuest
                      ? `${Math.max(0, DEMO_MSG_LIMIT - messageCount)}/${DEMO_MSG_LIMIT} messages left`
                      : 'Your onboarding assistant'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
              >
                <X size={18} className="text-neutral-500" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-6">
                  <Bot size={32} className="mx-auto text-primary-300 mb-2" />
                  <p className="text-sm text-neutral-500 mb-4">
                    Hi! I'm Buddy. Ask me anything about your onboarding.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {QUICK_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        onClick={() => send(chip)}
                        className="px-3 py-1.5 text-xs font-medium rounded-full bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary-100 text-primary-900 rounded-br-md'
                        : 'bg-neutral-100 text-neutral-800 rounded-bl-md'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <>
                        <div className="prose prose-sm prose-neutral max-w-none [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                        <div className="flex justify-end mt-1">
                          <button
                            onClick={() => playTts(msg.content, i)}
                            disabled={loadingTtsIndex === i}
                            className="p-1 rounded-full hover:bg-neutral-200 transition-colors disabled:cursor-wait"
                            aria-label={playingIndex === i ? 'Stop reading' : 'Read aloud'}
                          >
                            {getTtsIcon(i)}
                          </button>
                        </div>
                      </>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                <div className="flex justify-start">
                  <div className="bg-neutral-100 rounded-2xl rounded-bl-md px-3 py-2">
                    <Loader2 size={16} className="animate-spin text-neutral-400" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-neutral-100 pb-safe">
              {isLimitReached ? (
                <div className="text-center space-y-2">
                  <p className="text-sm text-neutral-600">
                    You've used all {DEMO_MSG_LIMIT} demo messages! 🎉
                  </p>
                  <a
                    href="/signup"
                    className="inline-block px-4 py-2 text-sm font-medium rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                  >
                    Sign up for unlimited access
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && send(input)}
                    placeholder="Ask Buddy anything..."
                    className="flex-1 px-4 py-2.5 text-sm rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => send(input)}
                    disabled={!input.trim() || isLoading}
                    className="p-2.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BuddyChatDrawer;
