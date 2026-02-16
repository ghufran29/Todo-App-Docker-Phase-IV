'use client';

import React, { useState } from 'react';
import { ToolCall } from '../../types/chat';

interface ToolCallBadgeProps {
  toolCall: ToolCall;
}

const ToolCallBadge: React.FC<ToolCallBadgeProps> = ({ toolCall }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-border overflow-hidden text-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-muted/50 hover:bg-muted transition-colors"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
        <span className="font-medium text-foreground truncate">{toolCall.tool}</span>
        <svg
          className={`ml-auto w-3 h-3 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-3 py-2.5 border-t border-border space-y-2 animate-scale-in">
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Arguments</p>
            <pre className="p-2 bg-muted rounded text-foreground/80 overflow-x-auto text-[11px] leading-relaxed">
              {JSON.stringify(toolCall.arguments, null, 2)}
            </pre>
          </div>
          {toolCall.result !== undefined && toolCall.result !== null && (
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Result</p>
              <pre className="p-2 bg-muted rounded text-foreground/80 overflow-x-auto text-[11px] leading-relaxed">
                {typeof toolCall.result === 'string'
                  ? toolCall.result
                  : JSON.stringify(toolCall.result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ToolCallBadge;
