/**
 * 帖子详情页面
 * 显示单个帖子的完整内容和评论
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
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // 评论相关状态
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [commentsPage, setCommentsPage] = useState(1);
    const [hasMoreComments, setHasMoreComments] = useState(false);
    const [totalComments, setTotalComments] = useState(0);

    // 点赞动画状态
    const [likeAnimating, setLikeAnimating] = useState(false);
    const [commentLikeAnimating, setCommentLikeAnimating] = useState({});

    const audioRef = useRef(null);
    const commentInputRef = useRef(null);
    const replyInputRef = useRef(null);

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

                // 获取评论
                fetchComments(1);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    // 获取评论列表
    const fetchComments = async (page = 1) => {
        if (!id) return;

        setCommentsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const res = await fetch(
                `${API_BASE}/api/posts/${id}/comments?page=${page}&page_size=10`,
                { headers }
            );

            if (res.ok) {
                const data = await res.json();
                if (page === 1) {
                    setComments(data.comments);
                } else {
                    setComments(prev => [...prev, ...data.comments]);
                }
                setHasMoreComments(data.has_more);
                setTotalComments(data.total);
                setCommentsPage(page);
            }
        } catch (err) {
            console.error('获取评论失败:', err);
        } finally {
            setCommentsLoading(false);
        }
    };

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

    // 处理帖子点赞
    const handleLike = async () => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        // 触发点赞动画
        setLikeAnimating(true);
        setTimeout(() => setLikeAnimating(false), 600);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/posts/${id}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const result = await res.json();
                setPost(prev => ({
                    ...prev,
                    is_liked: result.is_liked,
                    likes_count: result.likes_count
                }));
            }
        } catch (err) {
            console.error('点赞失败:', err);
        }
    };

    // 处理评论点赞
    const handleCommentLike = async (commentId, isReply = false, parentId = null) => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        // 触发点赞动画
        setCommentLikeAnimating(prev => ({ ...prev, [commentId]: true }));
        setTimeout(() => {
            setCommentLikeAnimating(prev => ({ ...prev, [commentId]: false }));
        }, 600);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/comments/${commentId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const result = await res.json();

                // 更新评论状态
                setComments(prev => prev.map(comment => {
                    if (comment.id === commentId) {
                        return {
                            ...comment,
                            is_liked: result.is_liked,
                            likes_count: result.likes_count
                        };
                    }
                    // 检查是否是回复
                    if (comment.replies) {
                        return {
                            ...comment,
                            replies: comment.replies.map(reply => {
                                if (reply.id === commentId) {
                                    return {
                                        ...reply,
                                        is_liked: result.is_liked,
                                        likes_count: result.likes_count
                                    };
                                }
                                return reply;
                            })
                        };
                    }
                    return comment;
                }));
            }
        } catch (err) {
            console.error('评论点赞失败:', err);
        }
    };

    // 发表评论
    const handleSubmitComment = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        const content = newComment.trim();
        if (!content) return;

        setSubmittingComment(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/posts/${id}/comments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content })
            });

            if (res.ok) {
                const newCommentData = await res.json();
                setComments(prev => [newCommentData, ...prev]);
                setNewComment('');
                setTotalComments(prev => prev + 1);

                // 更新帖子评论数
                setPost(prev => ({
                    ...prev,
                    comments_count: prev.comments_count + 1
                }));
            }
        } catch (err) {
            console.error('发表评论失败:', err);
        } finally {
            setSubmittingComment(false);
        }
    };

    // 发表回复
    const handleSubmitReply = async (e, parentId) => {
        e.preventDefault();

        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        const content = replyContent.trim();
        if (!content) return;

        setSubmittingComment(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/posts/${id}/comments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content, parent_id: parentId })
            });

            if (res.ok) {
                const newReplyData = await res.json();

                // 更新评论的回复列表
                setComments(prev => prev.map(comment => {
                    if (comment.id === parentId) {
                        return {
                            ...comment,
                            replies: [...(comment.replies || []), newReplyData],
                            reply_count: comment.reply_count + 1
                        };
                    }
                    return comment;
                }));

                setReplyContent('');
                setReplyTo(null);
                setTotalComments(prev => prev + 1);

                // 更新帖子评论数
                setPost(prev => ({
                    ...prev,
                    comments_count: prev.comments_count + 1
                }));
            }
        } catch (err) {
            console.error('发表回复失败:', err);
        } finally {
            setSubmittingComment(false);
        }
    };

    // 删除评论
    const handleDeleteComment = async (commentId, isReply = false, parentId = null) => {
        if (!confirm('确定要删除这条评论吗？')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                if (isReply && parentId) {
                    // 删除回复
                    setComments(prev => prev.map(comment => {
                        if (comment.id === parentId) {
                            return {
                                ...comment,
                                replies: comment.replies.filter(r => r.id !== commentId),
                                reply_count: comment.reply_count - 1
                            };
                        }
                        return comment;
                    }));
                } else {
                    // 删除顶级评论
                    setComments(prev => prev.filter(c => c.id !== commentId));
                }

                setTotalComments(prev => prev - 1);
                setPost(prev => ({
                    ...prev,
                    comments_count: Math.max(0, prev.comments_count - 1)
                }));
            }
        } catch (err) {
            console.error('删除评论失败:', err);
        }
    };

    // 处理删除帖子
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
    const goToUserProfile = (userId) => {
        if (userId) {
            router.push(`/user/${userId}`);
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

    // 渲染单个评论
    const renderComment = (comment, isReply = false, parentId = null) => {
        const canDeleteComment = user && comment.author?.id === user.id;
        const isLikeAnimating = commentLikeAnimating[comment.id];

        return (
            <div
                key={comment.id}
                className={`comment-item ${isReply ? 'reply' : ''}`}
                style={isReply ? {
                    marginLeft: '2.5rem',
                    paddingLeft: '1rem',
                    borderLeft: '2px solid rgba(123, 220, 147, 0.3)',
                    background: 'rgba(26, 26, 46, 0.2)'
                } : {}}
            >
                <div className="comment-avatar" onClick={() => goToUserProfile(comment.author?.id)}>
                    {comment.author?.avatar_url ? (
                        <img
                            src={`${API_BASE}${comment.author.avatar_url}`}
                            alt={comment.author.nickname || comment.author.username}
                            style={{
                                width: '36px',
                                height: '36px',
                                maxWidth: '36px',
                                maxHeight: '36px',
                                objectFit: 'cover',
                                borderRadius: '50%'
                            }}
                        />
                    ) : (
                        <span className="avatar-initial">
                            {(comment.author?.nickname || comment.author?.username || 'U')[0].toUpperCase()}
                        </span>
                    )}
                </div>

                <div className="comment-content">
                    <div className="comment-header">
                        <span
                            className="comment-author"
                            onClick={() => goToUserProfile(comment.author?.id)}
                            style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
                        >
                            {comment.author?.nickname || comment.author?.username}
                        </span>
                        <span
                            className="comment-level"
                            style={{ color: LEVEL_COLORS[comment.author?.level || 1], marginLeft: '0.5rem', fontSize: '0.8rem' }}
                        >
                            {comment.author?.level_name}
                        </span>
                        <span className="comment-time" style={{ color: '#ffffff', marginLeft: '0.5rem', fontSize: '0.8rem' }}>{formatTime(comment.created_at)}</span>
                    </div>

                    <p className="comment-text" style={{ color: '#ffffff', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>{comment.content}</p>

                    {comment.audio_url && (
                        <div className="comment-audio">
                            <audio controls src={`${API_BASE}${comment.audio_url}`} />
                        </div>
                    )}

                    <div className="comment-actions">
                        <button
                            className={`action-btn like-action ${comment.is_liked ? 'liked' : ''} ${isLikeAnimating ? 'animating' : ''}`}
                            onClick={() => handleCommentLike(comment.id, isReply, parentId)}
                        >
                            <span className="like-icon">{comment.is_liked ? '❤️' : '🤍'}</span>
                            <span>{comment.likes_count || 0}</span>
                            {isLikeAnimating && <span className="like-burst">💖</span>}
                        </button>

                        {!isReply && (
                            <button
                                className="action-btn reply-action"
                                onClick={() => {
                                    setReplyTo(replyTo === comment.id ? null : comment.id);
                                    setReplyContent('');
                                    setTimeout(() => replyInputRef.current?.focus(), 100);
                                }}
                            >
                                💬 回复
                            </button>
                        )}

                        {canDeleteComment && (
                            <button
                                className="action-btn delete-action"
                                onClick={() => handleDeleteComment(comment.id, isReply, parentId)}
                            >
                                🗑️ 删除
                            </button>
                        )}
                    </div>

                    {/* 回复输入框 */}
                    {replyTo === comment.id && (
                        <form className="reply-form" onSubmit={(e) => handleSubmitReply(e, comment.id)}>
                            <input
                                ref={replyInputRef}
                                type="text"
                                placeholder={`回复 @${comment.author?.nickname || comment.author?.username}...`}
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                maxLength={1000}
                            />
                            <button
                                type="submit"
                                disabled={!replyContent.trim() || submittingComment}
                            >
                                {submittingComment ? '发送中...' : '发送'}
                            </button>
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => {
                                    setReplyTo(null);
                                    setReplyContent('');
                                }}
                            >
                                取消
                            </button>
                        </form>
                    )}

                    {/* 回复列表 */}
                    {!isReply && comment.replies && comment.replies.length > 0 && (
                        <div className="replies-list">
                            {comment.replies.map(reply => renderComment(reply, true, comment.id))}
                        </div>
                    )}

                    {/* 查看更多回复 */}
                    {!isReply && comment.reply_count > (comment.replies?.length || 0) && (
                        <button
                            className="load-more-replies"
                            onClick={() => {
                                // TODO: 加载更多回复
                                console.log('加载更多回复');
                            }}
                        >
                            查看更多 {comment.reply_count - (comment.replies?.length || 0)} 条回复
                        </button>
                    )}
                </div>
            </div>
        );
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
                            <div className="author-info" onClick={() => goToUserProfile(post.author?.id)}>
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
                                    className={`stat-btn like-btn ${post.is_liked ? 'liked' : ''} ${likeAnimating ? 'animating' : ''}`}
                                    onClick={handleLike}
                                >
                                    <span className="icon">{post.is_liked ? '❤️' : '🤍'}</span>
                                    <span className="label">{post.likes_count} 点赞</span>
                                    {likeAnimating && (
                                        <div className="like-particles">
                                            {[...Array(6)].map((_, i) => (
                                                <span key={i} className="particle" style={{ '--i': i }}>💖</span>
                                            ))}
                                        </div>
                                    )}
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

                    {/* 评论区 */}
                    <div className="comments-section">
                        <h3>💬 评论区 <span className="comment-count">({totalComments})</span></h3>

                        {/* 发表评论 */}
                        {isAuthenticated ? (
                            <form className="comment-form" onSubmit={handleSubmitComment}>
                                <div className="form-avatar">
                                    {user?.avatar_url ? (
                                        <img
                                            src={`${API_BASE}${user.avatar_url}`}
                                            alt={user.nickname || user.username}
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                maxWidth: '40px',
                                                maxHeight: '40px',
                                                objectFit: 'cover',
                                                borderRadius: '50%'
                                            }}
                                        />
                                    ) : (
                                        <span className="avatar-initial">
                                            {(user?.nickname || user?.username || 'U')[0].toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="form-input-wrapper">
                                    <textarea
                                        ref={commentInputRef}
                                        placeholder="发表你的评论..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        maxLength={1000}
                                        rows={3}
                                    />
                                    <div className="form-actions">
                                        <span className="char-count">{newComment.length}/1000</span>
                                        <button
                                            type="submit"
                                            disabled={!newComment.trim() || submittingComment}
                                        >
                                            {submittingComment ? '发送中...' : '发表评论'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div className="login-prompt">
                                <p>登录后参与评论</p>
                                <button onClick={() => router.push('/login')}>去登录</button>
                            </div>
                        )}

                        {/* 评论列表 */}
                        <div className="comments-list">
                            {commentsLoading && comments.length === 0 ? (
                                <div className="comments-loading">
                                    <div className="loading-spinner small"></div>
                                    <p>加载评论中...</p>
                                </div>
                            ) : comments.length > 0 ? (
                                <>
                                    {comments.map(comment => renderComment(comment))}

                                    {hasMoreComments && (
                                        <button
                                            className="load-more-btn"
                                            onClick={() => fetchComments(commentsPage + 1)}
                                            disabled={commentsLoading}
                                        >
                                            {commentsLoading ? '加载中...' : '加载更多评论'}
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className="no-comments">
                                    <span className="icon">💭</span>
                                    <p>暂无评论，来发表第一条评论吧！</p>
                                </div>
                            )}
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
                    position: relative;
                }

                .stat-btn:hover {
                    opacity: 0.8;
                }

                .stat-btn .icon,
                .stat-item .icon {
                    font-size: 1.1rem;
                    transition: transform 0.2s;
                }

                .stat-btn .label,
                .stat-item .label {
                    color: #94a3b8;
                    font-size: 0.95rem;
                }

                .like-btn.liked .label {
                    color: #ef4444;
                }

                .like-btn.animating .icon {
                    animation: heartBeat 0.6s ease-in-out;
                }

                @keyframes heartBeat {
                    0% { transform: scale(1); }
                    25% { transform: scale(1.3); }
                    50% { transform: scale(1); }
                    75% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }

                .like-particles {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    pointer-events: none;
                }

                .particle {
                    position: absolute;
                    font-size: 0.8rem;
                    animation: particleBurst 0.6s ease-out forwards;
                    animation-delay: calc(var(--i) * 0.05s);
                }

                @keyframes particleBurst {
                    0% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(0);
                    }
                    100% {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(2);
                    }
                }

                /* 评论区样式 */
                .comments-section {
                    background: rgba(44, 95, 78, 0.15);
                    border-radius: 20px;
                    border: 1px solid rgba(123, 220, 147, 0.15);
                    padding: 1.5rem;
                }

                .comments-section h3 {
                    color: #e2e8f0;
                    font-size: 1.1rem;
                    margin: 0 0 1.5rem 0;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .comment-count {
                    color: #64748b;
                    font-weight: normal;
                    font-size: 0.9rem;
                }

                /* 评论表单 */
                .comment-form {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 1px solid rgba(123, 220, 147, 0.1);
                }

                .form-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    overflow: hidden;
                    background: linear-gradient(135deg, #2c5f4e, #3d7a64);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .form-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .form-input-wrapper {
                    flex: 1;
                }

                .form-input-wrapper textarea {
                    width: 100%;
                    padding: 0.875rem 1rem;
                    background: rgba(26, 26, 46, 0.5);
                    border: 1px solid rgba(123, 220, 147, 0.2);
                    border-radius: 12px;
                    color: #e2e8f0;
                    font-size: 0.95rem;
                    resize: none;
                    transition: all 0.2s;
                }

                .form-input-wrapper textarea:focus {
                    outline: none;
                    border-color: #7bdc93;
                    box-shadow: 0 0 0 3px rgba(123, 220, 147, 0.1);
                }

                .form-input-wrapper textarea::placeholder {
                    color: #64748b;
                }

                .form-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 0.75rem;
                }

                .char-count {
                    color: #64748b;
                    font-size: 0.8rem;
                }

                .form-actions button {
                    padding: 0.625rem 1.25rem;
                    background: linear-gradient(135deg, #2c5f4e, #3d7a64);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .form-actions button:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(123, 220, 147, 0.3);
                }

                .form-actions button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* 登录提示 */
                .login-prompt {
                    text-align: center;
                    padding: 1.5rem;
                    background: rgba(26, 26, 46, 0.3);
                    border-radius: 12px;
                    margin-bottom: 1.5rem;
                }

                .login-prompt p {
                    color: #94a3b8;
                    margin: 0 0 1rem 0;
                }

                .login-prompt button {
                    padding: 0.625rem 1.5rem;
                    background: linear-gradient(135deg, #2c5f4e, #3d7a64);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .login-prompt button:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(123, 220, 147, 0.3);
                }

                /* 评论列表 */
                .comments-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .comment-item {
                    display: flex;
                    gap: 0.875rem;
                    padding: 1rem;
                    background: rgba(26, 26, 46, 0.3);
                    border-radius: 12px;
                    transition: all 0.2s;
                }

                .comment-item:hover {
                    background: rgba(26, 26, 46, 0.5);
                }

                .comment-item.reply {
                    margin-left: 2.5rem;
                    background: rgba(26, 26, 46, 0.2);
                    padding: 0.875rem;
                }

                .comment-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    overflow: hidden;
                    background: linear-gradient(135deg, #2c5f4e, #3d7a64);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    cursor: pointer;
                    position: relative; /* 添加定位上下文 */
                }

                .comment-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block; /* 防止行内元素间隙 */
                    max-width: 100%; /*以此确保不超出容器*/
                }

                .comment-content {
                    flex: 1;
                    min-width: 0;
                }

                .comment-header {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.375rem;
                    flex-wrap: wrap;
                }

                .comment-author {
                    color: #e2e8f0;
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: color 0.2s;
                }

                .comment-author:hover {
                    color: #7bdc93;
                }

                .comment-level {
                    font-size: 0.75rem;
                    font-weight: 500;
                }

                .comment-time {
                    color: #64748b;
                    font-size: 0.8rem;
                }

                .comment-text {
                    color: #ffffff;
                    font-size: 0.95rem; /* 稍微加大一点字号以提升可读性 */
                    line-height: 1.6;
                    margin: 0;
                    word-break: break-word;
                }

                .comment-audio {
                    margin-top: 0.5rem;
                }

                .comment-audio audio {
                    width: 100%;
                    max-width: 300px;
                    height: 32px;
                }

                .comment-actions {
                    display: flex;
                    gap: 1rem;
                    margin-top: 0.625rem;
                }

                .action-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    background: transparent;
                    border: none;
                    color: #64748b;
                    font-size: 0.8rem;
                    cursor: pointer;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    transition: all 0.2s;
                    position: relative;
                }

                .action-btn:hover {
                    color: #94a3b8;
                    background: rgba(123, 220, 147, 0.1);
                }

                .like-action.liked {
                    color: #ef4444;
                }

                .like-action.animating .like-icon {
                    animation: heartBeat 0.6s ease-in-out;
                }

                .like-burst {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    animation: burstOut 0.5s ease-out forwards;
                    pointer-events: none;
                }

                .delete-action:hover {
                    color: #ef4444;
                    background: rgba(239, 68, 68, 0.1);
                }

                /* 回复表单 */
                .reply-form {
                    display: flex;
                    gap: 0.5rem;
                    margin-top: 0.75rem;
                    flex-wrap: wrap;
                }

                .reply-form input {
                    flex: 1;
                    min-width: 200px;
                    padding: 0.5rem 0.875rem;
                    background: rgba(26, 26, 46, 0.5);
                    border: 1px solid rgba(123, 220, 147, 0.2);
                    border-radius: 8px;
                    color: #e2e8f0;
                    font-size: 0.85rem;
                }

                .reply-form input:focus {
                    outline: none;
                    border-color: #7bdc93;
                }

                .reply-form input::placeholder {
                    color: #64748b;
                }

                .reply-form button {
                    padding: 0.5rem 1rem;
                    background: linear-gradient(135deg, #2c5f4e, #3d7a64);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .reply-form button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .reply-form .cancel-btn {
                    background: transparent;
                    border: 1px solid rgba(123, 220, 147, 0.3);
                    color: #94a3b8;
                }

                .reply-form .cancel-btn:hover {
                    border-color: #7bdc93;
                    color: #7bdc93;
                }

                /* 回复列表 */
                .replies-list {
                    margin-top: 0.75rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .load-more-replies {
                    background: transparent;
                    border: none;
                    color: #7bdc93;
                    font-size: 0.85rem;
                    cursor: pointer;
                    padding: 0.5rem 0;
                    margin-top: 0.5rem;
                    transition: opacity 0.2s;
                }

                .load-more-replies:hover {
                    opacity: 0.8;
                }

                /* 加载更多评论 */
                .load-more-btn {
                    width: 100%;
                    padding: 0.875rem;
                    background: rgba(44, 95, 78, 0.2);
                    border: 1px solid rgba(123, 220, 147, 0.2);
                    border-radius: 10px;
                    color: #7bdc93;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .load-more-btn:hover:not(:disabled) {
                    background: rgba(44, 95, 78, 0.3);
                    border-color: #7bdc93;
                }

                .load-more-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* 无评论状态 */
                .no-comments {
                    text-align: center;
                    padding: 2.5rem;
                    background: rgba(26, 26, 46, 0.2);
                    border-radius: 12px;
                }

                .no-comments .icon {
                    font-size: 2.5rem;
                    display: block;
                    margin-bottom: 0.75rem;
                }

                .no-comments p {
                    color: #94a3b8;
                    margin: 0;
                }

                /* 评论加载状态 */
                .comments-loading {
                    text-align: center;
                    padding: 2rem;
                }

                .comments-loading p {
                    color: #94a3b8;
                    margin: 0.75rem 0 0 0;
                }

                .loading-spinner.small {
                    width: 24px;
                    height: 24px;
                    border-width: 2px;
                    margin: 0 auto;
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

                    .comment-form {
                        flex-direction: column;
                    }

                    .form-avatar {
                        display: none;
                    }

                    .comment-item.reply {
                        margin-left: 1.5rem;
                    }

                    .reply-form {
                        flex-direction: column;
                    }

                    .reply-form input {
                        min-width: 100%;
                    }

                    .reply-form button {
                        width: auto;
                    }
                }
            `}</style>
        </>
    );
}
