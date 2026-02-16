'use client';

import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded gradient-bg flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} TodoAI
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
            <span>Next.js</span>
            <span>FastAPI</span>
            <span>OpenAI Agents</span>
            <span>MCP</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
