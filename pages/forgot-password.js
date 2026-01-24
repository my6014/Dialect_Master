import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, Mail, Shield, Lock, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
    const [step, setStep] = useState(1); // 1: 输入邮箱, 2: 输入验证码和新密码, 3: 成功
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [codeSending, setCodeSending] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // 倒计时效果
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // 发送验证码
    const sendCode = async () => {
        if (!email) {
            setError('请输入邮箱地址');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('请输入有效的邮箱地址');
            return;
        }

        setCodeSending(true);
        setError(null);

        try {
            const res = await fetch('http://localhost:8000/send-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, purpose: 'reset_password' }),
            });
            const data = await res.json();

            if (data.error) {
                setError(data.error);
            } else {
                setCountdown(60);
                setStep(2);
            }
        } catch (err) {
            setError('发送验证码失败，请稍后重试');
        } finally {
            setCodeSending(false);
        }
    };

    // 重置密码
    const resetPassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError('两次输入的密码不一致');
            return;
        }

        if (newPassword.length < 6) {
            setError('密码长度至少6位');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch('http://localhost:8000/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, new_password: newPassword }),
            });
            const data = await res.json();

            if (data.error) {
                setError(data.error);
            } else {
                setStep(3);
            }
        } catch (err) {
            setError('重置密码失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem 1rem 0.75rem 3rem',
        borderRadius: '0.75rem',
        border: '2px solid #e2e8f0',
        fontSize: '1rem',
        transition: 'all 0.2s',
        outline: 'none'
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

                {/* Main Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '1.5rem',
                    padding: '2.5rem',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    {/* Step 1: Enter Email */}
                    {step === 1 && (
                        <>
                            <div style={{ marginBottom: '2rem' }}>
                                <h2 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 600,
                                    color: '#2c5f4e',
                                    marginBottom: '0.5rem'
                                }}>
                                    找回密码 🔐
                                </h2>
                                <p style={{
                                    color: '#64748b',
                                    fontSize: '0.9rem'
                                }}>
                                    请输入您注册时使用的邮箱地址
                                </p>
                            </div>

                            <div style={{ display: 'grid', gap: '1.25rem' }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        color: '#2c5f4e'
                                    }}>
                                        邮箱地址
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={18} style={{
                                            position: 'absolute',
                                            left: '1rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#64748b'
                                        }} />
                                        <input
                                            type="email"
                                            style={inputStyle}
                                            placeholder="输入您的邮箱地址"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            onFocus={(e) => e.target.style.borderColor = '#7bdc93'}
                                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={sendCode}
                                    disabled={codeSending}
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem',
                                        background: 'linear-gradient(135deg, #2c5f4e 0%, #3a6b5a 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.75rem',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        cursor: codeSending ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.3s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        opacity: codeSending ? 0.7 : 1
                                    }}
                                >
                                    {codeSending ? '发送中...' : (
                                        <>
                                            发送验证码
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}

                    {/* Step 2: Enter Code and New Password */}
                    {step === 2 && (
                        <>
                            <div style={{ marginBottom: '2rem' }}>
                                <h2 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 600,
                                    color: '#2c5f4e',
                                    marginBottom: '0.5rem'
                                }}>
                                    重置密码 🔑
                                </h2>
                                <p style={{
                                    color: '#64748b',
                                    fontSize: '0.9rem'
                                }}>
                                    验证码已发送至 <span style={{ color: '#2c5f4e', fontWeight: 500 }}>{email}</span>
                                </p>
                            </div>

                            <form onSubmit={resetPassword} style={{ display: 'grid', gap: '1.25rem' }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        color: '#2c5f4e'
                                    }}>
                                        验证码
                                    </label>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <div style={{ position: 'relative', flex: 1 }}>
                                            <Shield size={18} style={{
                                                position: 'absolute',
                                                left: '1rem',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#64748b'
                                            }} />
                                            <input
                                                style={inputStyle}
                                                placeholder="输入6位验证码"
                                                value={code}
                                                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                onFocus={(e) => e.target.style.borderColor = '#7bdc93'}
                                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                                required
                                                maxLength={6}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={sendCode}
                                            disabled={codeSending || countdown > 0}
                                            style={{
                                                padding: '0.75rem 1rem',
                                                background: countdown > 0 ? '#e2e8f0' : 'linear-gradient(135deg, #7bdc93 0%, rgba(123, 220, 147, 0.9) 100%)',
                                                color: countdown > 0 ? '#64748b' : '#2c5f4e',
                                                border: 'none',
                                                borderRadius: '0.75rem',
                                                fontSize: '0.875rem',
                                                fontWeight: 600,
                                                cursor: (codeSending || countdown > 0) ? 'not-allowed' : 'pointer',
                                                whiteSpace: 'nowrap',
                                                transition: 'all 0.3s',
                                                minWidth: '100px'
                                            }}
                                        >
                                            {codeSending ? '发送中...' : countdown > 0 ? `${countdown}s` : '重新发送'}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        color: '#2c5f4e'
                                    }}>
                                        新密码
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
                                            type="password"
                                            style={inputStyle}
                                            placeholder="设置新密码（至少6位）"
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            onFocus={(e) => e.target.style.borderColor = '#7bdc93'}
                                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        color: '#2c5f4e'
                                    }}>
                                        确认新密码
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
                                            type="password"
                                            style={inputStyle}
                                            placeholder="再次输入新密码"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            onFocus={(e) => e.target.style.borderColor = '#7bdc93'}
                                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

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
                                >
                                    {loading ? '重置中...' : (
                                        <>
                                            重置密码
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'transparent',
                                        color: '#64748b',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '0.75rem',
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <ArrowLeft size={16} />
                                    返回修改邮箱
                                </button>
                            </form>
                        </>
                    )}

                    {/* Step 3: Success */}
                    {step === 3 && (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '5rem',
                                height: '5rem',
                                background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem'
                            }}>
                                <CheckCircle size={40} color="#15803d" />
                            </div>
                            <h2 style={{
                                fontSize: '1.5rem',
                                fontWeight: 600,
                                color: '#2c5f4e',
                                marginBottom: '0.75rem'
                            }}>
                                密码重置成功！🎉
                            </h2>
                            <p style={{
                                color: '#64748b',
                                fontSize: '0.9rem',
                                marginBottom: '2rem'
                            }}>
                                您的密码已成功重置，请使用新密码登录
                            </p>
                            <Link href="/login" style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.875rem 2rem',
                                background: 'linear-gradient(135deg, #2c5f4e 0%, #3a6b5a 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.75rem',
                                fontSize: '1rem',
                                fontWeight: 600,
                                textDecoration: 'none',
                                transition: 'all 0.3s'
                            }}>
                                前往登录
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    )}

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

                    {/* Footer Links */}
                    {step !== 3 && (
                        <div style={{
                            marginTop: '2rem',
                            paddingTop: '1.5rem',
                            borderTop: '1px solid #e2e8f0',
                            textAlign: 'center',
                            fontSize: '0.9rem',
                            color: '#64748b'
                        }}>
                            想起密码了？{' '}
                            <Link href="/login" style={{
                                color: '#2c5f4e',
                                fontWeight: 600,
                                textDecoration: 'none'
                            }}>
                                返回登录
                            </Link>
                            <span style={{ margin: '0 0.5rem', opacity: 0.3 }}>|</span>
                            <Link href="/register" style={{
                                color: '#64748b',
                                textDecoration: 'none'
                            }}>
                                注册新账号
                            </Link>
                        </div>
                    )}
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
