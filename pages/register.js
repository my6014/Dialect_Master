import { useState } from 'react';
import Link from 'next/link';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '请求失败');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center">
      <div className="card fade-in" style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 8 }}>创建账号</h1>
          <p style={{ color: 'var(--text-muted)' }}>加入方言宝，开启文化之旅</p>
        </div>

        <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
          <div>
            <label className="label">用户名</label>
            <input
              className="input"
              placeholder="设置您的用户名"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">密码</label>
            <input
              className="input"
              placeholder="设置您的密码"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }} disabled={loading}>
            {loading ? '注册中...' : '立即注册'}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: 16, padding: 10, background: '#fee2e2', color: '#b91c1c', borderRadius: 8, fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{ marginTop: 16, padding: 10, background: '#dcfce7', color: '#15803d', borderRadius: 8, fontSize: '0.9rem' }}>
            注册成功! {JSON.stringify(result)}
          </div>
        )}

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          已有账号？ <Link href="/login" style={{ fontWeight: 600 }}>直接登录</Link>
          <span style={{ margin: '0 8px', opacity: 0.3 }}>|</span>
          <Link href="/" style={{ color: 'var(--text-muted)' }}>返回首页</Link>
        </div>
      </div>
    </div>
  );
}
