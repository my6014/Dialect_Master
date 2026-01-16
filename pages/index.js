import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8001/hello.php')
      .then(r => r.json())
      .then(setData)
      .catch(setError);
  }, []);

  return (
    <div className="center" style={{ flexDirection: 'column', paddingBottom: 40 }}>
      <div className="card fade-in" style={{ maxWidth: 600, width: '100%', textAlign: 'center', padding: '48px 32px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: 16, background: 'linear-gradient(135deg, #4F46E5 0%, #E11D48 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          方言宝
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', marginBottom: 32 }}>
          探索方言的魅力，连接过去与未来。
          <br />
          <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>前端: Next.js • 后端: PHP</span>
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 40 }}>
          <Link href="/register" className="btn btn-primary" style={{ minWidth: 120 }}>
            立即注册
          </Link>
          <Link href="/login" className="btn btn-outline" style={{ minWidth: 120 }}>
            登录账号
          </Link>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, textAlign: 'left' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: 12, color: 'var(--text-muted)' }}>系统状态检测</h2>
          {error && (
            <div style={{ padding: 12, borderRadius: 8, background: '#fee2e2', color: '#b91c1c', fontSize: '0.9rem' }}>
              ❌ 后端连接失败: {String(error)}
            </div>
          )}
          {data ? (
            <div style={{ padding: 12, borderRadius: 8, background: '#dcfce7', color: '#15803d', fontSize: '0.9rem' }}>
              ✅ 后端连接正常: {JSON.stringify(data)}
            </div>
          ) : !error && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              ⏳ 正在连接后端服务...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

