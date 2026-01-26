/**
 * PostCard - 帖子卡片组件
 * 在社区动态流中显示单个帖子
 */
import { useState, useRef } from 'react';
import { useRouter } from 'next/router';

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

export default function PostCard({ post, onLike, onDelete, currentUserId }) {
    const router = useRouter();
    const [isPlaying, setIsPlaying] = useState(false);
    const [likeAnimating, setLikeAnimating] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const audioRef = useRef(null);

    const { author, content, audio_url, dialect_tag, likes_count, comments_count, views_count, created_at, is_liked, id } = post;

    // 格式化时间
    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`;

        return date.toLocaleDateString('zh-CN');
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

    // 音频结束处理
    const handleAudioEnded = () => {
        setIsPlaying(false);
    };

    // 点击头像/用户名查看用户资料
    const goToUserProfile = (e) => {
        e.stopPropagation();
        router.push(`/user/${author.id}`);
    };

    // 点击帖子查看详情
    const goToPostDetail = () => {
        router.push(`/post/${id}`);
    };

    // 点击方言标签
    const goToDialect = (e) => {
        e.stopPropagation();
        router.push(`/dialect/${encodeURIComponent(dialect_tag)}`);
    };

    // 处理删除
    const handleDelete = (e) => {
        e.stopPropagation();
        if (showDeleteConfirm) {
            onDelete && onDelete(id);
            setShowDeleteConfirm(false);
        } else {
            setShowDeleteConfirm(true);
            setTimeout(() => setShowDeleteConfirm(false), 3000);
        }
    };

    // 处理点赞
    const handleLike = (e) => {
        e.stopPropagation();
        if (!is_liked) {
            setLikeAnimating(true);
            setTimeout(() => setLikeAnimating(false), 600);
        }
        onLike && onLike(id, !is_liked);
    };

    const dialectColor = DIALECT_COLORS[dialect_tag] || DIALECT_COLORS['其他'];
    const canDelete = currentUserId && author.id === currentUserId;

    return (
        <div className="post-card" onClick={goToPostDetail}>
            {/* 帖子头部 */}
            <div className="post-header">
                <div className="author-info" onClick={goToUserProfile}>
                    <div className="avatar">
                        {author.avatar_url ? (
                            <img src={`${API_BASE}${author.avatar_url}`} alt={author.nickname || author.username} />
                        ) : (
                            <span className="avatar-initial">
                                {(author.nickname || author.username || 'U')[0].toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="author-details">
                        <span className="author-name">{author.nickname || author.username}</span>
                        <span className="author-level" style={{ color: getLevelColor(author.level) }}>
                            {author.level_name}
                        </span>
                    </div>
                </div>
                <div className="post-meta">
                    <span className="post-time">{formatTime(created_at)}</span>
                    {canDelete && (
                        <button className={`delete-btn ${showDeleteConfirm ? 'confirm' : ''}`} onClick={handleDelete}>
                            {showDeleteConfirm ? '确认删除？' : '🗑️'}
                        </button>
                    )}
                </div>
            </div>

            {/* 帖子内容 */}
            <div className="post-content">
                <p>{content}</p>

                {/* 音频播放器 */}
                {audio_url && (
                    <div className="audio-player" onClick={(e) => e.stopPropagation()}>
                        <button className={`play-btn ${isPlaying ? 'playing' : ''}`} onClick={toggleAudio}>
                            {isPlaying ? '⏸️' : '▶️'}
                        </button>
                        <div className="audio-wave">
                            {[...Array(12)].map((_, i) => (
                                <span key={i} className={`wave-bar ${isPlaying ? 'active' : ''}`} style={{ animationDelay: `${i * 0.1}s` }}></span>
                            ))}
                        </div>
                        <span className="audio-label">方言录音</span>
                        <audio
                            ref={audioRef}
                            src={`${API_BASE}${audio_url}`}
                            onEnded={handleAudioEnded}
                        />
                    </div>
                )}
            </div>

            {/* 方言标签 */}
            {dialect_tag && (
                <div className="dialect-tag" style={{ backgroundColor: `${dialectColor}20`, borderColor: dialectColor }} onClick={goToDialect}>
                    <span style={{ color: dialectColor }}>#{dialect_tag}</span>
                </div>
            )}

            {/* 帖子底部互动栏 */}
            <div className="post-footer">
                <button className={`action-btn like-btn ${is_liked ? 'liked' : ''} ${likeAnimating ? 'animating' : ''}`} onClick={handleLike}>
                    <span className="icon">{is_liked ? '❤️' : '🤍'}</span>
                    <span className="count">{likes_count}</span>
                    {likeAnimating && (
                        <div className="like-particles">
                            {[...Array(6)].map((_, i) => (
                                <span key={i} className="particle" style={{ '--i': i }}>💖</span>
                            ))}
                        </div>
                    )}
                </button>
                <button className="action-btn comment-btn">
                    <span className="icon">💬</span>
                    <span className="count">{comments_count}</span>
                </button>
                <button className="action-btn views-btn">
                    <span className="icon">👁️</span>
                    <span className="count">{views_count >= 1000 ? `${(views_count / 1000).toFixed(1)}k` : views_count}</span>
                </button>
            </div>

            <style jsx>{`
                .post-card {
                    background: rgba(44, 95, 78, 0.15);
                    border-radius: 16px;
                    border: 1px solid rgba(123, 220, 147, 0.15);
                    padding: 1.25rem;
                    margin-bottom: 1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .post-card:hover {
                    border-color: rgba(123, 220, 147, 0.3);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
                }

                .post-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 0.75rem;
                }

                .author-info {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                }

                .author-info:hover .author-name {
                    color: #7bdc93;
                }

                .avatar {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    overflow: hidden;
                    background: linear-gradient(135deg, #2c5f4e, #3d7a64);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .avatar-initial {
                    color: white;
                    font-weight: 600;
                    font-size: 1.1rem;
                }

                .author-details {
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                }

                .author-name {
                    color: #e2e8f0;
                    font-weight: 600;
                    font-size: 0.95rem;
                    transition: color 0.2s;
                }

                .author-level {
                    font-size: 0.75rem;
                    font-weight: 500;
                }

                .post-meta {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .post-time {
                    color: #64748b;
                    font-size: 0.8rem;
                }

                .delete-btn {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 0.25rem 0.5rem;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    transition: all 0.2s;
                }

                .delete-btn.confirm {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                .delete-btn:hover {
                    background: rgba(239, 68, 68, 0.2);
                }

                .post-content {
                    margin-bottom: 0.75rem;
                }

                .post-content p {
                    color: #e2e8f0;
                    line-height: 1.6;
                    margin: 0;
                    white-space: pre-wrap;
                    word-break: break-word;
                }

                .audio-player {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-top: 0.75rem;
                    padding: 0.75rem 1rem;
                    background: rgba(26, 26, 46, 0.5);
                    border-radius: 12px;
                    border: 1px solid rgba(123, 220, 147, 0.1);
                }

                .play-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #2c5f4e, #3d7a64);
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1rem;
                    transition: all 0.2s;
                }

                .play-btn:hover {
                    transform: scale(1.05);
                    box-shadow: 0 4px 12px rgba(123, 220, 147, 0.3);
                }

                .play-btn.playing {
                    background: linear-gradient(135deg, #7bdc93, #2c5f4e);
                }

                .audio-wave {
                    display: flex;
                    align-items: center;
                    gap: 3px;
                    height: 20px;
                }

                .wave-bar {
                    width: 3px;
                    height: 8px;
                    background: #64748b;
                    border-radius: 2px;
                    transition: height 0.1s;
                }

                .wave-bar.active {
                    background: #7bdc93;
                    animation: wave 0.5s ease-in-out infinite alternate;
                }

                @keyframes wave {
                    from { height: 4px; }
                    to { height: 20px; }
                }

                .audio-label {
                    color: #94a3b8;
                    font-size: 0.8rem;
                    margin-left: auto;
                }

                .dialect-tag {
                    display: inline-block;
                    padding: 0.35rem 0.75rem;
                    border-radius: 20px;
                    border: 1px solid;
                    margin-bottom: 0.75rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .dialect-tag:hover {
                    transform: scale(1.02);
                }

                .dialect-tag span {
                    font-size: 0.85rem;
                    font-weight: 500;
                }

                .post-footer {
                    display: flex;
                    gap: 1.5rem;
                    padding-top: 0.75rem;
                    border-top: 1px solid rgba(123, 220, 147, 0.1);
                }

                .action-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 0.4rem 0.6rem;
                    border-radius: 8px;
                    transition: all 0.2s;
                }

                .action-btn:hover {
                    background: rgba(123, 220, 147, 0.1);
                }

                .action-btn .icon {
                    font-size: 1rem;
                }

                .action-btn .count {
                    color: #94a3b8;
                    font-size: 0.85rem;
                }

                .like-btn.liked .count {
                    color: #ef4444;
                }

                .like-btn.liked {
                    animation: likeAnim 0.3s ease;
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
                    50% {
                        opacity: 1;
                    }
                    100% {
                        opacity: 0;
                        transform: translate(
                            calc(-50% + cos(var(--i) * 60deg) * 30px),
                            calc(-50% + sin(var(--i) * 60deg) * 30px)
                        ) scale(1.5);
                    }
                }

                @media (max-width: 640px) {
                    .post-card {
                        padding: 1rem;
                    }

                    .avatar {
                        width: 38px;
                        height: 38px;
                    }

                    .post-footer {
                        gap: 1rem;
                    }
                }
            `}</style>
        </div>
    );
}

// 等级颜色映射
function getLevelColor(level) {
    const colors = {
        1: "#9CA3AF",
        2: "#60A5FA",
        3: "#34D399",
        4: "#FBBF24",
        5: "#F472B6",
        6: "#8B5CF6"
    };
    return colors[level] || colors[1];
}
