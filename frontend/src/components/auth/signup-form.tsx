'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';

const SignupForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { register } = useAuth();

  const getStrength = (pw: string) => {
    let s = 0;
    if (pw.length >= 8) s += 25;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s += 25;
    if (/[0-9]/.test(pw)) s += 25;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pw)) s += 25;
    return s;
  };

  const strength = getStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !/\S+@\S+\.\S+/.test(email)) { setError('Valid email is required'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (!/[a-z]/.test(password)) { setError('Password needs a lowercase letter'); return; }
    if (!/[A-Z]/.test(password)) { setError('Password needs an uppercase letter'); return; }
    if (!/[0-9]/.test(password)) { setError('Password needs a number'); return; }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) { setError('Password needs a special character'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }

    setLoading(true);
    try {
      await register(email, password, confirmPassword);
      setSuccess('Account created! Redirecting...');
      setTimeout(() => router.push('/tasks'), 1200);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Create account</h1>
          <p className="text-sm text-muted-foreground mt-1">Get started with TodoAI</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="animate-scale-in rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            {success && (
              <div className="animate-scale-in rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-600 dark:text-green-400">
                {success}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                className="w-full px-3.5 py-2.5 rounded-lg bg-input border border-border text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                className="w-full px-3.5 py-2.5 rounded-lg bg-input border border-border text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Min 8 chars, upper, lower, number, special"
                autoComplete="new-password"
              />
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[25, 50, 75, 100].map((threshold) => (
                      <div
                        key={threshold}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          strength >= threshold
                            ? threshold <= 25 ? 'bg-destructive' : threshold <= 50 ? 'bg-yellow-500' : threshold <= 75 ? 'bg-blue-500' : 'bg-green-500'
                            : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-[10px] mt-1 ${
                    strength <= 25 ? 'text-destructive' : strength <= 50 ? 'text-yellow-500' : strength <= 75 ? 'text-blue-500' : 'text-green-500'
                  }`}>
                    {strength <= 25 ? 'Weak' : strength <= 50 ? 'Fair' : strength <= 75 ? 'Good' : 'Strong'}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                className="w-full px-3.5 py-2.5 rounded-lg bg-input border border-border text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-bg text-white py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link href="/auth/signin" className="font-medium text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;
