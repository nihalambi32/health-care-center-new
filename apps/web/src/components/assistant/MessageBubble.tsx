import React from 'react';
import { Bot, User as UserIcon } from 'lucide-react';
import { cn } from '@/utils';

interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ role, content }) => {
  const isAssistant = role === 'assistant' || role === 'system';

  return (
    <div
      className={cn(
        'flex items-start space-x-3 w-full mb-4',
        isAssistant ? 'justify-start' : 'justify-end'
      )}
    >
      {isAssistant && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 to-vital-emerald flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-primary-500/20">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
          isAssistant
            ? 'glass-card border border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-100 rounded-tl-sm'
            : 'bg-primary-500 text-white rounded-tr-sm shadow-md shadow-primary-500/20 font-medium'
        )}
      >
        <p className="whitespace-pre-wrap">{content}</p>
      </div>

      {!isAssistant && (
        <div className="w-8 h-8 rounded-xl bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 flex-shrink-0">
          <UserIcon className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
