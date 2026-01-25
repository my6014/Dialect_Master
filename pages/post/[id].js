/**
 * 帖子详情页面
 * 显示单个帖子的完整内容和评论（评论功能将在 Phase 3 实现）
 */
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Sidebar from '../../components/Sidebar';
import { useUser } from '../../hooks/useUser';

const API_BASE = 'http://127.0.0.1:8000';

// 方言标签颜色
const DIALECT_COLORS = {
    '粤语': '#FF6B6B',
    '四川话': '#4ECDC4',
    '东北话': '#45B7D1',
    '上海话': '#96CEB4',
    '闽南语': '#FFEAA7',
    '客家话': '#DDA0DD',
    '湖南话': '#98D8C8',
    '河南话': '#F7DC6F',
    '山东话': '#82E0AA',
    '陕西话': '#F0B27A',
    '其他': '#B0BEC5'
};

// 等级颜色
const LEVEL_COLORS = {
    1: "#9CA3AF",
    2: "#60A5FA",
    3: "#34D399",
    4: "#FBBF24",
    5: "#F472B6",
    6: "#8B5CF6"
};

export default function PostDetail() {
    const router = useRouter();
    const { id } = router.query;
    const { user, isAuthenticated } = useUser();

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const audioRef = useRef(null);

    // 获取帖子详情
    useEffect(() => {
        if (!id) return;

        const fetchPost = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

                const res = await fetch(`${API_BASE}/api/posts/${id}`, { headers });

                if (res.status === 404) {
                    setError('帖子不存在或已被删除');
                    return;
                }

                if (!res.ok) {
                    throw new Error('获取帖子失败');
                }

                const data = await res.json();
                setPost(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    // 格式化时间
    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`;

        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // 播放/暂停音频
    const toggleAudio = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    // 处理点赞
    const handleLike = async () => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/posts/${id}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                // 更新本地状态
                setPost(prev => ({
                    ...prev,
                    is_liked: !prev.is_liked,
                    likes_count: prev.is_liked ? prev.likes_count - 1 : prev.likes_count + 1
                }));
            }
        } catch (err) {
            console.error('点赞失败:', err);
        }
    };

    // 处理删除
    const handleDelete = async () => {
        if (!showDeleteConfirm) {
            setShowDeleteConfirm(true);
            setTimeout(() => setShowDeleteConfirm(false), 3000);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/posts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                router.push('/community');
            } else {
                const data = await res.json();
                setError(data.detail || '删除失败');
            }
        } catch (err) {
            setError('删除失败');
        }
    };

    // 查看用户资料
    const goToUserProfile = () => {
        if (post?.author?.id) {
            router.push(`/user/${post.author.id}`);
        }
    };

    // 查看方言标签
    const goToDialect = () => {
        if (post?.dialect_tag) {
            router.push(`/dialect/${encodeURIComponent(post.dialect_tag)}`);
        }
    };

    const handlePageChange = (pageId) => {
        if (pageId === 'dashboard') router.push('/dashboard');
        else if (pageId === 'asr') router.push('/asr_test');
        else if (pageId === 'community') router.push('/community');
        else if (pageId === 'settings') router.push('/settings/profile');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <style jsx>{`
                    .loading-container {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    }
                    .loading-spinner {
                        width: 40px;
                        height: 40px;
                        border: 3px solid rgba(123, 220, 147, 0.2);
                        border-top-color: #7bdc93;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (error) {
        return (
            <>
                <Head>
                    <title>帖子不存在 - 方言宝</title>
                </Head>
                <div className="error-container">
                    <Sidebar currentPage="community" onPageChange={handlePageChange} />
                    <div className="error-content">
                        <div className="error-card">
                            <span className="error-icon">😔</span>
                            <h2>{error}</h2>
                            <button onClick={() => router.push('/community')}>
                                返回社区
                            </button>
                        </div>
                    </div>
                </div>
                <style jsx>{`
                    .error-container {
                        display: flex;
                        min-height: 100vh;
                        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    }
                    .error-content {
                        flex: 1;
                        margin-left: 100px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 2rem;
                    }
                    .error-card {
                        text-align: center;
                        padding: 3rem;
                        background: rgba(44, 95, 78, 0.15);
                        border-radius: 20px;
                        border: 1px solid rgba(123, 220, 147, 0.15);
                    }
                    .error-icon {
                        font-size: 4rem;
                        display: block;
                        margin-bottom: 1rem;
                    }
                    .error-card h2 {
                        color: #e2e8f0;
                        margin: 0 0 1.5rem 0;
                    }
                    .error-card button {
                        padding: 0.875rem 2rem;
                        background: linear-gradient(135deg, #2c5f4e, #3d7a64);
                        border: none;
                        border-radius: 10px;
                        color: white;
                        font-size: 1rem;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .error-card button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(123, 220, 147, 0.3);
                    }
                    @media (max-width: 768px) {
                        .error-content {
                            margin-left: 0;
                        }
                    }
                `}</style>
            </>
        );
    }

    const dialectColor = DIALECT_COLORS[post?.dialect_tag] || DIALECT_COLORS['其他'];
    const canDelete = user && post?.author?.id === user.id;

    return (
        <>
            <Head>
                <title>{post?.content?.slice(0, 30) || '帖子详情'} - 方言宝</title>
                <meta name="description" content={post?.content?.slice(0, 150)} />
            </Head>

            <div className="detail-container">
                <Sidebar currentPage="community" onPageChange={handlePageChange} />

                <div className="detail-content">
                    {/* 返回按钮 */}
                    <button className="back-btn" onClick={() => router.back()}>
                        ← 返回
                    </button>

                    {/* 帖子内容 */}
                    <article className="post-detail">
                        {/* 作者信息 */}
                        <header className="post-header">
                            <div className="author-info" onClick={goToUserProfile}>
                                <div className="avatar">
                                    {post.author.avatar_url ? (
                                        <img src={`${API_BASE}${post.author.avatar_url}`} alt={post.author.nickname || post.author.username} />
                                    ) : (
                                        <span className="avatar-initial">
                                            {(post.author.nickname || post.author.username || 'U')[0].toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="author-details">
                                    <span className="author-name">{post.author.nickname || post.author.username}</span>
                                    <div className="author-meta">
                                        <span className="level-badge" style={{ color: LEVEL_COLORS[post.author.level] }}>
                                            {post.author.level_name}
                                        </span>
                                        <span className="separator">·</span>
                                        <span className="post-time">{formatTime(post.created_at)}</span>
                                    </div>
                                </div>
                            </div>

                            {canDelete && (
                                <button
                                    className={`delete-btn ${showDeleteConfirm ? 'confirm' : ''}`}
                                    onClick={handleDelete}
                                >
                                    {showDeleteConfirm ? '确认删除？' : '🗑️ 删除'}
                                </button>
                            )}
                        </header>

                        {/* 帖子正文 */}
                        <div className="post-body">
                            <p className="post-text">{post.content}</p>

                            {/* 音频播放器 */}
                            {post.audio_url && (
                                <div className="audio-player">
                                    <button
                                        className={`play-btn ${isPlaying ? 'playing' : ''}`}
                                        onClick={toggleAudio}
                                    >
                                        {isPlaying ? '⏸️' : '▶️'}
                                    </button>
                                    <div className="audio-wave">
                                        {[...Array(20)].map((_, i) => (
                                            <span
                                                key={i}
                                                className={`wave-bar ${isPlaying ? 'active' : ''}`}
                                                style={{ animationDelay: `${i * 0.05}s` }}
                                            ></span>
                                        ))}
                                    </div>
                                    <span className="audio-label">🎤 方言录音</span>
                                    <audio
                                        ref={audioRef}
                                        src={`${API_BASE}${post.audio_url}`}
                                        onEnded={() => setIsPlaying(false)}
                                    />
                                </div>
                            )}
                        </div>

                        {/* 方言标签 */}
                        {post.dialect_tag && (
                            <div
                                className="dialect-tag"
                                style={{ backgroundColor: `${dialectColor}20`, borderColor: dialectColor }}
                                onClick={goToDialect}
                            >
                                <span style={{ color: dialectColor }}>#{post.dialect_tag}</span>
                            </div>
                        )}

                        {/* 互动栏 */}
                        <footer className="post-footer">
                            <div className="stats">
                                <button
                                    className={`stat-btn like-btn ${post.is_liked ? 'liked' : ''}`}
                                    onClick={handleLike}
                                >
                                    <span className="icon">{post.is_liked ? '❤️' : '🤍'}</span>
                                    <span className="label">{post.likes_count} 点赞</span>
                                </button>
                                <div className="stat-item">
                                    <span className="icon">💬</span>
                                    <span className="label">{post.comments_count} 评论</span>
                                </div>
                                <div className="stat-item">
                                    <span className="icon">👁️</span>
                                    <span className="label">{post.views_count} 浏览</span>
                                </div>
                            </div>
                        </footer>
                    </article>

                    {/* 评论区占位（Phase 3 实现） */}
                    <div className="comments-section">
                        <h3>💬 评论区</h3>
                        <div className="coming-soon">
                            <span className="icon">🚧</span>
                            <p>评论功能即将上线，敬请期待！</p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .detail-container {
                    display: flex;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                }

                .detail-content {
                    flex: 1;
                    margin-left: 100px;
                    padding: 2rem;
                    max-width: 800px;
                }

                .back-btn {
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    font-size: 0.9rem;
                    cursor: pointer;
                    padding: 0.5rem 0;
                    margin-bottom: 1.5rem;
                    transition: color 0.2s;
                }

                .back-btn:hover {
                    color: #7bdc93;
                }

                .post-detail {
                    background: rgba(44, 95, 78, 0.15);
                    border-radius: 20px;
                    border: 1px solid rgba(123, 220, 147, 0.15);
                    padding: 1.5rem;
                    margin-bottom: 1.5rem;
                }

                .post-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1.25rem;
                }

                .author-info {
                    display: flex;
                    gap: 1rem;
                    cursor: pointer;
                }

                .author-info:hover .author-name {
                    color: #7bdc93;
                }

                .avatar {
                    width: 52px;
                    height: 52px;
                    border-radius: 50%;
                    overflow: hidden;
                    background: linear-gradient(135deg, #2c5f4e, #3d7a64);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .avatar-initial {
                    color: white;
                    font-weight: 600;
                    font-size: 1.25rem;
                }

                .author-details {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .author-name {
                    color: #e2e8f0;
                    font-weight: 600;
                    font-size: 1.05rem;
                    transition: color 0.2s;
                }

                .author-meta {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.85rem;
                }

                .level-badge {
                    font-weight: 500;
                }

                .separator {
                    color: #64748b;
                }

                .post-time {
                    color: #64748b;
                }

                .delete-btn {
                    padding: 0.5rem 1rem;
                    background: transparent;
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    border-radius: 8px;
                    color: #94a3b8;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .delete-btn:hover,
                .delete-btn.confirm {
                    background: rgba(239, 68, 68, 0.2);
                    border-color: #ef4444;
                    color: #ef4444;
                }

                .post-body {
                    margin-bottom: 1rem;
                }

                .post-text {
                    color: #e2e8f0;
                    font-size: 1.1rem;
                    line-height: 1.8;
                    margin: 0;
                    white-space: pre-wrap;
                    word-break: break-word;
                }

                .audio-player {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-top: 1.25rem;
                    padding: 1rem 1.25rem;
                    background: rgba(26, 26, 46, 0.5);
                    border-radius: 16px;
                    border: 1px solid rgba(123, 220, 147, 0.1);
                }

                .play-btn {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #2c5f4e, #3d7a64);
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }

                .play-btn:hover {
                    transform: scale(1.05);
                    box-shadow: 0 4px 16px rgba(123, 220, 147, 0.4);
                }

                .play-btn.playing {
                    background: linear-gradient(135deg, #7bdc93, #2c5f4e);
                }

                .audio-wave {
                    display: flex;
                    align-items: center;
                    gap: 3px;
                    height: 28px;
                    flex: 1;
                }

                .wave-bar {
                    width: 3px;
                    height: 10px;
                    background: #64748b;
                    border-radius: 2px;
                }

                .wave-bar.active {
                    background: #7bdc93;
                    animation: wave 0.5s ease-in-out infinite alternate;
                }

                @keyframes wave {
                    from { height: 6px; }
                    to { height: 28px; }
                }

                .audio-label {
                    color: #94a3b8;
                    font-size: 0.9rem;
                    white-space: nowrap;
                }

                .dialect-tag {
                    display: inline-block;
                    padding: 0.5rem 1rem;
                    border-radius: 25px;
                    border: 1px solid;
                    margin-bottom: 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .dialect-tag:hover {
                    transform: scale(1.02);
                }

                .dialect-tag span {
                    font-size: 0.95rem;
                    font-weight: 600;
                }

                .post-footer {
                    padding-top: 1rem;
                    border-top: 1px solid rgba(123, 220, 147, 0.1);
                }

                .stats {
                    display: flex;
                    gap: 2rem;
                }

                .stat-btn,
                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                }

                .stat-btn:hover {
                    opacity: 0.8;
                }

                .stat-btn .icon,
                .stat-item .icon {
                    font-size: 1.1rem;
                }

                .stat-btn .label,
                .stat-item .label {
                    color: #94a3b8;
                    font-size: 0.95rem;
                }

                .like-btn.liked .label {
                    color: #ef4444;
                }

                .like-btn.liked {
                    animation: likeAnim 0.3s ease;
                }

                @keyframes likeAnim {
                    50% { transform: scale(1.1); }
                }

                .comments-section {
                    background: rgba(44, 95, 78, 0.15);
                    border-radius: 20px;
                    border: 1px solid rgba(123, 220, 147, 0.15);
                    padding: 1.5rem;
                }

                .comments-section h3 {
                    color: #e2e8f0;
                    font-size: 1.1rem;
                    margin: 0 0 1rem 0;
                }

                .coming-soon {
                    text-align: center;
                    padding: 2rem;
                    background: rgba(26, 26, 46, 0.3);
                    border-radius: 12px;
                }

                .coming-soon .icon {
                    font-size: 2.5rem;
                    display: block;
                    margin-bottom: 0.75rem;
                }

                .coming-soon p {
                    color: #94a3b8;
                    margin: 0;
                }

                @media (max-width: 768px) {
                    .detail-content {
                        margin-left: 0;
                        padding: 1rem;
                    }

                    .post-detail {
                        padding: 1.25rem;
                    }

                    .avatar {
                        width: 44px;
                        height: 44px;
                    }

                    .post-text {
                        font-size: 1rem;
                    }

                    .stats {
                        gap: 1rem;
                    }
                }
            `}</style>
        </>
    );
}
