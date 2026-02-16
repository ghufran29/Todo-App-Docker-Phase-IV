'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/src/hooks/useAuth';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) router.push('/tasks');
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 text-center">
        <div className="animate-fade-in inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary mb-6">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Powered by AI Agent + MCP
        </div>

        <h1 className="animate-fade-in-up text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground leading-tight mb-5">
          Task Management{' '}
          <span className="gradient-text">with AI</span>
        </h1>

        <p className="animate-fade-in-up delay-100 text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Manage your tasks with natural language. Tell the AI what you need and it handles the rest through intelligent tool calling.
        </p>

        <div className="animate-fade-in-up delay-200 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth/signup"
            className="gradient-bg text-white px-7 py-3 rounded-xl text-base font-semibold hover:opacity-90 transition-opacity"
          >
            Get Started Free
          </Link>
          <Link
            href="/auth/signin"
            className="bg-muted text-foreground px-7 py-3 rounded-xl text-base font-semibold hover:bg-muted/80 transition-colors border border-border"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
              title: 'AI Chat Assistant',
              desc: 'Manage tasks through natural conversation with an intelligent AI agent.',
              color: 'text-violet-600 bg-violet-100 dark:text-violet-400 dark:bg-violet-500/10',
            },
            {
              icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
              title: 'Task Management',
              desc: 'Create, edit, prioritize, and track tasks with due dates and statuses.',
              color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-500/10',
            },
            {
              icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
              title: 'Secure & Private',
              desc: 'JWT authentication with complete data isolation per user.',
              color: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10',
            },
          ].map((f, i) => (
            <div
              key={f.title}
              className={`animate-fade-in-up delay-${(i + 1) * 100} rounded-xl border border-border bg-card p-6 hover:border-primary/20 transition-colors`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${f.color}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
