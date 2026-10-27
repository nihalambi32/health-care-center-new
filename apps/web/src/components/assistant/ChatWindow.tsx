import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MessageBubble } from './MessageBubble';
import { Disclaimer } from './Disclaimer';
import { Button } from '@/components/ui/Button';
import {
  useAssistantHistory,
  useSendAssistantMessage,
  useClearAssistantHistory,
} from '@/features/assistant/useAssistant';

export const ChatWindow: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: history = [], isLoading } = useAssistantHistory();
  const sendMessage = useSendAssistantMessage();
  const clearHistory = useClearAssistantHistory();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, sendMessage.isPending]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendMessage.isPending) return;

    const userMessage = input.trim();
    setInput('');

    try {
      await sendMessage.mutateAsync({
        message: userMessage,
        locale: i18n.language.startsWith('hi') ? 'hi' : 'en',
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-[600px] glass-panel rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-800/60">
      {/* Header */}
      <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-vital-emerald animate-ping" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {t('assistant.title')}
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          onClick={() => clearHistory.mutate()}
          className="text-xs text-slate-400 hover:text-vital-coral"
        >
          {t('assistant.clearHistory')}
        </Button>
      </div>

      {/* Mandatory Disclaimer Top Notice */}
      <div className="p-3 bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200/60 dark:border-slate-800/60">
        <Disclaimer />
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading ? (
          <div className="h-full flex items-center justify-center text-xs font-mono text-slate-400">
            LOADING CONVERSATION HISTORY...
          </div>
        ) : history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
            <span className="text-3xl">🩺</span>
            <p className="text-sm font-medium">
              Ask about hydration habits, sleep tips, or vital signs education.
            </p>
          </div>
        ) : (
          history.map((msg) => (
            <MessageBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              createdAt={msg.createdAt}
            />
          ))
        )}

        {sendMessage.isPending && (
          <div className="flex items-center space-x-2 text-xs font-mono text-primary-400 animate-pulse p-2">
            <span>BIO-WELLNESS AI PROCESSING...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/40 flex items-center space-x-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('assistant.placeholder')}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-white/70 dark:bg-slate-950/70 border border-slate-300/80 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={sendMessage.isPending}
          disabled={!input.trim()}
          rightIcon={<Send className="w-4 h-4" />}
        >
          {t('assistant.send')}
        </Button>
      </form>
    </div>
  );
};
