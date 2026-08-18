'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { loginAdmin } from '@/services/firebase/auth';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      await loginAdmin(
        email.trim(),
        password,
      );

      router.replace('/dashboard');
    } catch (err) {
      console.error(
        'ADMIN LOGIN ERROR:',
        err,
      );

      if (
        err instanceof Error
      ) {
        setError(err.message);
      } else {
        setError(
          'Unable to login.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Brand */}

        <div className="mb-8">
          <p className="text-cyan-400 text-sm font-semibold tracking-widest uppercase">
            Noida Drive
          </p>

          <h1 className="text-3xl font-bold text-white mt-2">
            Admin Panel
          </h1>

          <p className="text-slate-400 mt-2">
            Sign in to manage the marketplace.
          </p>
        </div>

        {/* Login Card */}

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl"
        >
          <div className="space-y-5">
            {/* Email */}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value,
                  )
                }
                placeholder="admin@example.com"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />
            </div>

            {/* Password */}

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value,
                  )
                }
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />
            </div>

            {/* Error */}

            {error && (
              <div className="rounded-xl border border-red-900 bg-red-950/40 px-4 py-3">
                <p className="text-sm text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-cyan-400 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? 'Signing in...'
                : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}