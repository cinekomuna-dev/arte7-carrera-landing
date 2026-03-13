'use client';

import { useState } from 'react';
import { createClient } from '../../lib/supabase-browser';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Credenciales incorrectas');
      setLoading(false);
      return;
    }

    window.location.href = '/dashboard';
  }

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleLogin}>
        <div className="login-logo">
          <img src="/logo-blanco.png" alt="Arte7" style={{ height: 80, width: 'auto' }} />
        </div>
        <h1 className="login-title">DASHBOARD DE LEADS</h1>
        <p className="login-sub">// Acceso restringido — Arte7 Staff</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="login-error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'ENTRANDO...' : 'ENTRAR →'}
        </button>
      </form>
    </div>
  );
}
