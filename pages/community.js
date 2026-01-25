import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Sidebar from '../components/Sidebar';
import { useUser } from '../hooks/useUser';

export default function Community() {
    const router = useRouter();
    const { user, isAuthenticated, loading } = useUser();
    const [currentPage, setCurrentPage] = useState('community');

    const handlePageChange = (pageId) => {
        if (pageId === 'dashboard') {
            router.push('/dashboard');
        } else if (pageId === 'asr') {
            router.push('/asr_test');
        } else if (pageId === 'community') {
            // Already on community
        } else if (pageId === 'settings') {
            router.push('/settings/profile');
        } else {
            setCurrentPage(pageId);
        }
    };

    return (
        <>
            <Head>
                <title>社区 - 方言宝</title>
                <meta name="description" content="方言宝社区 - 与方言爱好者交流分享" />
            </Head>

            <div className="community-container">
                <Sidebar currentPage={currentPage} onPageChange={handlePageChange} />

                <div className="community-content">
                    {/* 页面标题 */}
                    <div className="page-header">
                        <h1>🏠 方言社区</h1>
                        <p>与全国各地的方言爱好者一起交流学习</p>
                    </div>

                    {/* 即将上线提示 */}
                    <div className="coming-soon-card">
                        <div className="icon-wrapper">
                            <span className="main-icon">🚧</span>
                        </div>
                        <h2>社区功能正在开发中</h2>
                        <p>我们正在紧锣密鼓地开发社区功能，敬请期待！</p>

                        <div className="feature-preview">
                            <h3>即将推出的功能</h3>
                            <div className="features-grid">
                                <div className="feature-item">
                                    <span className="feature-icon">📝</span>
                                    <span className="feature-name">发布动态</span>
                                    <span className="feature-desc">分享方言录音和心得</span>
                                </div>
                                <div className="feature-item">
                                    <span className="feature-icon">💬</span>
                                    <span className="feature-name">评论互动</span>
                                    <span className="feature-desc">与其他用户交流讨论</span>
                                </div>
                                <div className="feature-item">
                                    <span className="feature-icon">❤️</span>
                                    <span className="feature-name">点赞收藏</span>
                                    <span className="feature-desc">发现优质方言内容</span>
                                </div>
                                <div className="feature-item">
                                    <span className="feature-icon">👥</span>
                                    <span className="feature-name">关注好友</span>
                                    <span className="feature-desc">建立方言学习圈</span>
                                </div>
                                <div className="feature-item">
                                    <span className="feature-icon">🏆</span>
                                    <span className="feature-name">积分排行</span>
                                    <span className="feature-desc">激励持续学习</span>
                                </div>
                                <div className="feature-item">
                                    <span className="feature-icon">🔔</span>
                                    <span className="feature-name">消息通知</span>
                                    <span className="feature-desc">不错过任何动态</span>
                                </div>
                            </div>
                        </div>

                        {isAuthenticated ? (
                            <div className="user-ready">
                                <span className="check-icon">✅</span>
                                <span>你已登录，社区上线后将第一时间通知你！</span>
                            </div>
                        ) : (
                            <button
                                className="btn-login"
                                onClick={() => router.push('/login')}
                            >
                                先去登录账号
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .community-container {
                    display: flex;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                }

                .community-content {
                    flex: 1;
                    margin-left: 100px;
                    padding: 2rem;
                    max-width: 900px;
                }

                .page-header {
                    margin-bottom: 2rem;
                }

                .page-header h1 {
                    font-size: 2rem;
                    color: #e2e8f0;
                    margin: 0 0 0.5rem 0;
                }

                .page-header p {
                    color: #94a3b8;
                    margin: 0;
                    font-size: 1rem;
                }

                .coming-soon-card {
                    background: rgba(44, 95, 78, 0.15);
                    border-radius: 24px;
                    border: 1px solid rgba(123, 220, 147, 0.2);
                    padding: 3rem;
                    text-align: center;
                    backdrop-filter: blur(10px);
                }

                .icon-wrapper {
                    margin-bottom: 1.5rem;
                }

                .main-icon {
                    font-size: 4rem;
                    animation: bounce 2s infinite;
                }

                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                .coming-soon-card h2 {
                    color: #e2e8f0;
                    font-size: 1.5rem;
                    margin: 0 0 0.75rem 0;
                }

                .coming-soon-card > p {
                    color: #94a3b8;
                    font-size: 1rem;
                    margin: 0 0 2rem 0;
                }

                .feature-preview {
                    background: rgba(26, 26, 46, 0.5);
                    border-radius: 16px;
                    padding: 2rem;
                    margin-bottom: 2rem;
                }

                .feature-preview h3 {
                    color: #7bdc93;
                    font-size: 1rem;
                    margin: 0 0 1.5rem 0;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 1rem;
                }

                .feature-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 1.25rem 1rem;
                    background: rgba(44, 95, 78, 0.2);
                    border-radius: 12px;
                    border: 1px solid rgba(123, 220, 147, 0.1);
                    transition: all 0.3s ease;
                }

                .feature-item:hover {
                    background: rgba(44, 95, 78, 0.3);
                    border-color: rgba(123, 220, 147, 0.3);
                    transform: translateY(-2px);
                }

                .feature-icon {
                    font-size: 1.75rem;
                    margin-bottom: 0.5rem;
                }

                .feature-name {
                    color: #e2e8f0;
                    font-weight: 600;
                    font-size: 0.9rem;
                    margin-bottom: 0.25rem;
                }

                .feature-desc {
                    color: #64748b;
                    font-size: 0.75rem;
                }

                .user-ready {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    color: #7bdc93;
                    font-size: 0.95rem;
                    padding: 1rem;
                    background: rgba(123, 220, 147, 0.1);
                    border-radius: 10px;
                }

                .check-icon {
                    font-size: 1.25rem;
                }

                .btn-login {
                    padding: 0.875rem 2rem;
                    background: linear-gradient(135deg, #2c5f4e, #3d7a64);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .btn-login:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(123, 220, 147, 0.3);
                }

                @media (max-width: 768px) {
                    .community-content {
                        margin-left: 0;
                        padding: 1rem;
                    }

                    .coming-soon-card {
                        padding: 2rem 1.5rem;
                    }

                    .feature-preview {
                        padding: 1.5rem;
                    }

                    .features-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            `}</style>
        </>
    );
}
