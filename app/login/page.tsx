'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Invalid credentials');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      setError('An error occurred');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background-primary)' }}>
      <div className="p-8 rounded-lg w-96" style={{ background: 'var(--background-secundary)' }}>
        <h1 className="text-2xl mb-6 text-center" style={{ color: 'var(--color-primary)' }}>Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded"
              style={{ 
                background: 'var(--background-primary)',
                color: 'var(--color-primary)'
              }}
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded"
              style={{ 
                background: 'var(--background-primary)',
                color: 'var(--color-primary)'
              }}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full p-2 rounded bg-teal-500 text-white hover:bg-teal-600"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}