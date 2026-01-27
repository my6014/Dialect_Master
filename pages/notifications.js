import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Sidebar from '../components/Sidebar';
import { useUser } from '../hooks/useUser';
import {
    Check,
    Heart,
    MessageCircle,
    Reply,
    UserPlus,
    Bell,
    ExternalLink
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

export default function Notifications() {
    const router = useRouter();
    const { user, isAuthenticated, loading: userLoading, setUnreadCount } = useUser();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

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

    const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
        if (pageNum === 1) setLoading(true);
        else setLoadingMore(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch(`${API_BASE}/api/notifications?page=${pageNum}&size=20`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                if (append) {
                    setNotifications(prev => [...prev, ...data.items]);
                } else {
                    setNotifications(data.items);
                }
                setHasMore((pageNum * 20) < data.total);
                setPage(pageNum);
            }
        } catch (err) {
            console.error('获取通知失败:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        if (!userLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else {
                fetchNotifications();
            }
        }
    }, [userLoading, isAuthenticated, router, fetchNotifications]);

    // 标记单条已读
    const handleMarkRead = async (id, e) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_BASE}/api/notifications/${id}/read`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));

            // 更新全局未读数
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('标记已读失败:', err);
        }
    };

    // 全部标记已读
    const handleMarkAllRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_BASE}/api/notifications/read-all`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('全部标记已读失败:', err);
        }
    };

    // 点击通知跳转
    const handleNotificationClick = (notification) => {
        // 先标记已读
        if (!notification.is_read) {
            handleMarkRead(notification.id, { stopPropagation: () => { } });
        }

        // 跳转逻辑
        if (notification.type === 'follow') {
            router.push(`/user/${notification.actor_id}`);
        } else if (notification.post_id) {
            router.push(`/post/${notification.post_id}`);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'like': return <Heart size={18} fill="#ef4444" color="#ef4444" />;
            case 'comment': return <MessageCircle size={18} color="#3b82f6" />;
            case 'reply': return <Reply size={18} color="#8b5cf6" />;
            case 'follow': return <UserPlus size={18} color="#10b981" />;
            case 'system': return <Bell size={18} color="#f59e0b" />;
            default: return <Bell size={18} />;
        }
    };

    const handlePageChange = (pageId) => {
        if (pageId === 'dashboard') router.push('/dashboard');
        else if (pageId === 'community') router.push('/community');
        else if (pageId === 'asr') router.push('/asr_test');
        else if (pageId === 'settings') router.push('/settings/profile');
        else if (pageId === 'leaderboard') router.push('/leaderboard');
        else if (pageId === 'notifications') { } // Already here
    };

    return (
        <>
            <Head>
                <title>消息中心 - 方言宝</title>
            </Head>

            <div className="notifications-container">
                <Sidebar currentPage="notifications" onPageChange={handlePageChange} />

                <div className="notifications-content">
                    <div className="page-header">
                        <div className="header-left">
                            <h1>🔔 消息中心</h1>
                            <p>查看与您互动的所有消息</p>
                        </div>
                        <button className="read-all-btn" onClick={handleMarkAllRead}>
                            <Check size={16} /> 全部已读
                        </button>
                    </div>

                    <div className="notifications-list">
                        {loading ? (
                            <div className="loading-state">
                                <span className="spinner"></span>
                                <p>加载中...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">🔕</div>
                                <h3>暂无新消息</h3>
                                <p>当有人与您互动时，消息会出现在这里</p>
                            </div>
                        ) : (
                            <>
                                {notifications.map(item => (
                                    <div
                                        key={item.id}
                                        className={`notification-item ${!item.is_read ? 'unread' : ''}`}
                                        onClick={() => handleNotificationClick(item)}
                                    >
                                        <div className="item-icon-wrapper">
                                            {getIcon(item.type)}
                                        </div>

                                        <div className="item-content">
                                            <div className="item-header">
                                                <div className="actor-info">
                                                    {item.actor ? (
                                                        <>
                                                            <img
                                                                src={item.actor.avatar_url ? `${API_BASE}${item.actor.avatar_url}` : null}
                                                                alt={item.actor.nickname}
                                                                className="actor-avatar"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                    e.target.nextSibling.style.display = 'flex';
                                                                }}
                                                            />
                                                            <div className="avatar-placeholder" style={{ display: item.actor.avatar_url ? 'none' : 'flex' }}>
                                                                {(item.actor.nickname || 'U')[0].toUpperCase()}
                                                            </div>
                                                            <span className="actor-name">{item.actor.nickname || item.actor.username}</span>
                                                        </>
                                                    ) : (
                                                        <span className="actor-name">系统通知</span>
                                                    )}
                                                    <span className="action-text">{item.content}</span>
                                                </div>
                                                <span className="time-ago">{formatTime(item.created_at)}</span>
                                            </div>

                                        </div>

                                        {!item.is_read && (
                                            <button
                                                className="mark-read-btn"
                                                onClick={(e) => handleMarkRead(item.id, e)}
                                                title="标记为已读"
                                            >
                                                <div className="unread-dot"></div>
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {hasMore && (
                                    <button
                                        className="load-more-btn"
                                        onClick={() => fetchNotifications(page + 1, true)}
                                        disabled={loadingMore}
                                    >
                                        {loadingMore ? '加载中...' : '加载更多'}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .notifications-container {
                    display: flex;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                }

                .notifications-content {
                    flex: 1;
                    margin-left: 100px;
                    padding: 2rem;
                    max-width: 800px;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }

                .header-left h1 {
                    font-size: 1.75rem;
                    color: #e2e8f0;
                    margin: 0 0 0.5rem 0;
                }

                .header-left p {
                    color: #94a3b8;
                    margin: 0;
                }

                .read-all-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: rgba(44, 95, 78, 0.3);
                    border: 1px solid rgba(123, 220, 147, 0.2);
                    border-radius: 8px;
                    color: #7bdc93;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .read-all-btn:hover {
                    background: rgba(44, 95, 78, 0.5);
                }

                .notifications-list {
                    background: rgba(44, 95, 78, 0.1);
                    border-radius: 16px;
                    border: 1px solid rgba(123, 220, 147, 0.1);
                    overflow: hidden;
                }

                .notification-item {
                    display: flex;
                    gap: 1rem;
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid rgba(123, 220, 147, 0.1);
                    cursor: pointer;
                    transition: background 0.2s;
                    position: relative;
                }

                .notification-item:hover {
                    background: rgba(123, 220, 147, 0.05);
                }

                .notification-item.unread {
                    background: rgba(123, 220, 147, 0.1);
                }
                
                .notification-item.unread:hover {
                     background: rgba(123, 220, 147, 0.15);
                }

                .item-icon-wrapper {
                    display: flex;
                    align-items: flex-start;
                    padding-top: 0.25rem;
                }

                .item-content {
                    flex: 1;
                }

                .item-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 0.25rem;
                }

                .actor-info {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }

                .actor-avatar, .avatar-placeholder {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    object-fit: cover;
                }
                
                .avatar-placeholder {
                    background: #2c5f4e;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: bold;
                }

                .actor-name {
                    font-weight: 600;
                    color: #e2e8f0;
                }

                .action-text {
                    color: #94a3b8;
                }

                .time-ago {
                    font-size: 0.8rem;
                    color: #64748b;
                    white-space: nowrap;
                    margin-left: 1rem;
                }

                .unread-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #ef4444;
                    box-shadow: 0 0 5px rgba(239, 68, 68, 0.5);
                }

                .mark-read-btn {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 0.5rem;
                    display: flex;
                    align-items: center;
                }

                .loading-state, .empty-state {
                    padding: 3rem;
                    text-align: center;
                    color: #94a3b8;
                }
                
                .spinner {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(123, 220, 147, 0.3);
                    border-top-color: #7bdc93;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 0.5rem;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .empty-icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                }
                
                .load-more-btn {
                    width: 100%;
                    padding: 1rem;
                    background: transparent;
                    border: none;
                    color: #7bdc93;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                
                .load-more-btn:hover:not(:disabled) {
                    background: rgba(44, 95, 78, 0.2);
                }
                
                .load-more-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .notifications-content {
                        margin-left: 0;
                        padding: 1rem;
                    }
                }
            `}</style>
        </>
    );
}
