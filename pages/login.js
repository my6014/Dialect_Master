import { useState } from 'react';
import Link from 'next/link';
import { Zap, User, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
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
      const res = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '请求失败');
      } else {
        setResult(data);
        // 登录成功后跳转到 dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2c5f4e 0%, #3a6b5a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div className="fade-in" style={{
        width: '100%',
        maxWidth: '450px'
      }}>
        {/* Logo Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            background: 'linear-gradient(135deg, #7bdc93 0%, rgba(123, 220, 147, 0.8) 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
          }}>
            <Zap size={32} color="#2c5f4e" />
          </div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: 'white',
            marginBottom: '0.5rem'
          }}>
            方言宝
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.95rem'
          }}>
            方言学习平台
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          background: 'white',
          borderRadius: '1.5rem',
          padding: '2.5rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: '#2c5f4e',
              marginBottom: '0.5rem'
            }}>
              欢迎回来 👋
            </h2>
            <p style={{
              color: '#64748b',
              fontSize: '0.9rem'
            }}>
              请登录您的账号以继续学习
            </p>
          </div>

          <form onSubmit={submit} style={{ display: 'grid', gap: '1.25rem' }}>
            {/* Username Input */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#2c5f4e'
              }}>
                用户名
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b'
                }} />
                <input
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 3rem',
                    borderRadius: '0.75rem',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  placeholder="请输入用户名"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onFocus={(e) => e.target.style.borderColor = '#7bdc93'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#2c5f4e'
              }}>
                密码
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b'
                }} />
                <input
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 3rem',
                    borderRadius: '0.75rem',
                    border: '2px solid #e2e8f0',
                    fontSize: '1rem',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  placeholder="请输入密码"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={(e) => e.target.style.borderColor = '#7bdc93'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: 'linear-gradient(135deg, #2c5f4e 0%, #3a6b5a 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 20px rgba(44, 95, 78, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {loading ? '登录中...' : (
                <>
                  登录
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div style={{
              marginTop: '1rem',
              padding: '0.875rem',
              background: '#fee2e2',
              color: '#b91c1c',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              border: '1px solid #fecaca'
            }}>
              ❌ {error}
            </div>
          )}

          {/* Success Message */}
          {result && (
            <div style={{
              marginTop: '1rem',
              padding: '0.875rem',
              background: '#dcfce7',
              color: '#15803d',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              border: '1px solid #bbf7d0'
            }}>
              ✅ 登录成功！正在跳转...
            </div>
          )}

          {/* Footer Links */}
          <div style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #e2e8f0',
            textAlign: 'center',
            fontSize: '0.9rem',
            color: '#64748b'
          }}>
            还没有账号？{' '}
            <Link href="/register" style={{
              color: '#2c5f4e',
              fontWeight: 600,
              textDecoration: 'none'
            }}>
              立即注册
            </Link>
            <span style={{ margin: '0 0.5rem', opacity: 0.3 }}>|</span>
            <Link href="/" style={{
              color: '#64748b',
              textDecoration: 'none'
            }}>
              返回首页
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.85rem'
        }}>
          © 2026 方言宝 · 传承文化，学习方言
        </div>
      </div>
    </div>
  );
}
