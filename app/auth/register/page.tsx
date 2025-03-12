'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error registering user');
      }

      router.push('/auth/login?registered=true');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background-primary)' }}>
      <div className="p-8 rounded-lg w-96 shadow-xl" style={{ background: 'var(--background-secundary)' }}>
        <h1 className="text-3xl font-bold mb-6 text-center" style={{ color: 'var(--color-primary)' }}>
          Create Account
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1" style={{ color: 'var(--color-secondary)' }}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-700"
              style={{ 
                background: 'var(--background-primary)',
                color: 'var(--color-primary)'
              }}
              required
            />
          </div>
          <div>
            <label className="block mb-1" style={{ color: 'var(--color-secondary)' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-700"
              style={{ 
                background: 'var(--background-primary)',
                color: 'var(--color-primary)'
              }}
              required
            />
          </div>
          <div>
            <label className="block mb-1" style={{ color: 'var(--color-secondary)' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-700"
              style={{ 
                background: 'var(--background-primary)',
                color: 'var(--color-primary)'
              }}
              required
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full p-3 rounded-lg bg-teal-500 text-white font-medium hover:bg-teal-600 transition-colors disabled:bg-teal-800 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4 text-center" style={{ color: 'var(--color-secondary)' }}>
          Already have an account?{' '}
          <Link href="/auth/login" className="text-teal-500 hover:text-teal-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}