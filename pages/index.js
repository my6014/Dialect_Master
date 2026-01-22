import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Zap, LogIn, UserPlus, Sparkles, Mic, BookOpen, TrendingUp } from 'lucide-react';

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/hello')
      .then(r => r.json())
      .then(setData)
      .catch(setError);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2c5f4e 0%, #3a6b5a 50%, #2c5f4e 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Decoration */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(123, 220, 147, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        left: '-5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(123, 220, 147, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      <div className="fade-in" style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Logo Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <div style={{
            width: '5rem',
            height: '5rem',
            background: 'linear-gradient(135deg, #7bdc93 0%, rgba(123, 220, 147, 0.8) 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            animation: 'float 3s ease-in-out infinite'
          }}>
            <Zap size={40} color="#2c5f4e" strokeWidth={2.5} />
          </div>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: 800,
            color: 'white',
            marginBottom: '1rem',
            letterSpacing: '-0.02em',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
          }}>
            方言宝
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1.25rem',
            marginBottom: '0.5rem',
            fontWeight: 500
          }}>
            探索方言的魅力，连接过去与未来
          </p>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.95rem'
          }}>
            传承文化 · 学习方言 · 语音识别
          </p>
        </div>

        {/* Feature Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          maxWidth: '900px',
          width: '100%',
          marginBottom: '3rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center',
            transition: 'all 0.3s'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}>
            <Mic size={32} color="#7bdc93" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.5rem' }}>语音识别</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>
              智能方言语音转文字
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center',
            transition: 'all 0.3s'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}>
            <BookOpen size={32} color="#7bdc93" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.5rem' }}>方言学习</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>
              系统化学习各地方言
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center',
            transition: 'all 0.3s'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}>
            <TrendingUp size={32} color="#7bdc93" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ color: 'white', fontSize: '1.1rem', marginBottom: '0.5rem' }}>学习统计</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>
              可视化学习进度分析
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          background: 'white',
          borderRadius: '1.5rem',
          padding: '1.5rem 2.0rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          maxWidth: '420px',
          width: '100%',
          marginBottom: '2rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#2c5f4e',
            marginBottom: '1.25rem',
            textAlign: 'center'
          }}>
            开始您的方言学习之旅
          </h2>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {/* 直接体验按钮 */}
            <Link href="/dashboard" style={{ textDecoration: 'none' }}>
              <button style={{
                width: '100%',
                padding: '1rem',
                background: 'linear-gradient(135deg, #7bdc93 0%, rgba(123, 220, 147, 0.8) 100%)',
                color: '#2c5f4e',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '1.05rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(123, 220, 147, 0.3)'
              }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 20px rgba(123, 220, 147, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(123, 220, 147, 0.3)';
                }}>
                <Sparkles size={20} />
                立即体验
              </button>
            </Link>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem'
            }}>
              {/* 注册按钮 */}
              <Link href="/register" style={{ textDecoration: 'none' }}>
                <button style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: 'linear-gradient(135deg, #2c5f4e 0%, #3a6b5a 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(44, 95, 78, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}>
                  <UserPlus size={18} />
                  注册
                </button>
              </Link>

              {/* 登录按钮 */}
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <button style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: 'white',
                  color: '#2c5f4e',
                  border: '2px solid #2c5f4e',
                  borderRadius: '0.75rem',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#2c5f4e';
                    e.target.style.color = 'white';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.color = '#2c5f4e';
                    e.target.style.transform = 'translateY(0)';
                  }}>
                  <LogIn size={18} />
                  登录
                </button>
              </Link>
            </div>
          </div>

          {/* System Status */}
          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid #e2e8f0'
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#64748b',
              marginBottom: '0.75rem'
            }}>
              系统状态
            </h3>
            {error && (
              <div style={{
                padding: '0.75rem',
                borderRadius: '0.5rem',
                background: '#fee2e2',
                color: '#b91c1c',
                fontSize: '0.85rem',
                border: '1px solid #fecaca'
              }}>
                ❌ 后端连接失败
              </div>
            )}
            {data ? (
              <div style={{
                padding: '0.75rem',
                borderRadius: '0.5rem',
                background: '#dcfce7',
                color: '#15803d',
                fontSize: '0.85rem',
                border: '1px solid #bbf7d0'
              }}>
                ✅ 系统运行正常
              </div>
            ) : !error && (
              <div style={{
                padding: '0.75rem',
                borderRadius: '0.5rem',
                background: '#f1f5f9',
                color: '#64748b',
                fontSize: '0.85rem'
              }}>
                ⏳ 正在连接服务器...
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.85rem'
        }}>
          <p style={{ marginBottom: '0.5rem' }}>
            前端: Next.js · 后端: Python (FastAPI) · AI: SenseVoice
          </p>
          <p>
            © 2026 方言宝 · 传承文化，学习方言
          </p>
        </div>
      </div>

      {/* Float Animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}
