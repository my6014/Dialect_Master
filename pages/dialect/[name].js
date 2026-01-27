/**
 * 方言标签页面
 * 显示特定方言标签下的所有帖子
 */
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Sidebar from '../../components/Sidebar';
import PostCard from '../../components/PostCard';
import { useUser } from '../../hooks/useUser';

const API_BASE = 'http://127.0.0.1:8000';

// 方言标签颜色和描述
const DIALECT_INFO = {
    '粤语': { color: '#FF6B6B', region: '广东、广西、香港、澳门' },
    '四川话': { color: '#4ECDC4', region: '四川、重庆' },
    '东北话': { color: '#45B7D1', region: '辽宁、吉林、黑龙江' },
    '上海话': { color: '#96CEB4', region: '上海' },
    '闽南语': { color: '#FFEAA7', region: '福建、台湾' },
    '客家话': { color: '#DDA0DD', region: '广东、江西、福建' },
    '湖南话': { color: '#98D8C8', region: '湖南' },
    '河南话': { color: '#F7DC6F', region: '河南' },
    '山东话': { color: '#82E0AA', region: '山东' },
    '陕西话': { color: '#F0B27A', region: '陕西' },
    '温州话': { color: '#BB8FCE', region: '浙江温州' },
    '武汉话': { color: '#85C1E9', region: '湖北武汉' },
    '南京话': { color: '#F1948A', region: '江苏南京' },
    '苏州话': { color: '#A3E4D7', region: '江苏苏州' },
    '杭州话': { color: '#FAD7A0', region: '浙江杭州' },
    '天津话': { color: '#D7BDE2', region: '天津' },
    '山西话': { color: '#AED6F1', region: '山西' },
    '江西话': { color: '#A9DFBF', region: '江西' },
    '福州话': { color: '#F9E79F', region: '福建福州' },
    '潮汕话': { color: '#FADBD8', region: '广东潮汕' },
    '其他': { color: '#B0BEC5', region: '其他地区' }
};

export default function DialectPage() {
    const router = useRouter();
    const { name } = router.query;
    const { user, isAuthenticated } = useUser();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [total, setTotal] = useState(0);
    const [loadingMore, setLoadingMore] = useState(false);

    const dialectName = name ? decodeURIComponent(name) : '';
    const dialectInfo = DIALECT_INFO[dialectName] || DIALECT_INFO['其他'];

    // 获取帖子列表
    const fetchPosts = useCallback(async (pageNum = 1, append = false) => {
        if (!dialectName) return;

        if (pageNum === 1) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const res = await fetch(
                `${API_BASE}/api/posts/dialect/${encodeURIComponent(dialectName)}?page=${pageNum}&page_size=20`,
                { headers }
            );

            if (!res.ok) throw new Error('获取帖子失败');

            const data = await res.json();

            if (append) {
                setPosts(prev => [...prev, ...data.posts]);
            } else {
                setPosts(data.posts);
            }

            setTotal(data.total);
            setHasMore(data.has_more);
            setPage(pageNum);
        } catch (err) {
            console.error('获取帖子失败:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [dialectName]);

    useEffect(() => {
        if (dialectName) {
            fetchPosts(1);
        }
    }, [dialectName, fetchPosts]);

    // 加载更多
    const loadMore = () => {
        if (!loadingMore && hasMore) {
            fetchPosts(page + 1, true);
        }
    };

    // 处理点赞
    const handleLike = async (postId, liked) => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_BASE}/api/posts/${postId}/like`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setPosts(prev => prev.map(post =>
                post.id === postId
                    ? {
                        ...post,
                        is_liked: liked,
                        likes_count: liked ? post.likes_count + 1 : post.likes_count - 1
                    }
                    : post
            ));
        } catch (err) {
            console.error('点赞失败:', err);
        }
    };

    // 处理删除
    const handleDelete = async (postId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setPosts(prev => prev.filter(post => post.id !== postId));
                setTotal(prev => prev - 1);
            }
        } catch (err) {
            console.error('删除失败:', err);
        }
    };

    const handlePageChange = (pageId) => {
        if (pageId === 'dashboard') router.push('/dashboard');
        else if (pageId === 'asr') router.push('/asr_test');
        else if (pageId === 'community') router.push('/community');
        else if (pageId === 'settings') router.push('/settings/profile');
        else if (pageId === 'notifications') router.push('/notifications');
        else if (pageId === 'leaderboard') router.push('/leaderboard');
    };

    return (
        <>
            <Head>
                <title>#{dialectName} - 方言宝社区</title>
                <meta name="description" content={`浏览${dialectName}相关的帖子和录音分享`} />
            </Head>

            <div className="dialect-container">
                <Sidebar currentPage="community" onPageChange={handlePageChange} />

                <div className="dialect-content">
                    {/* 返回按钮 */}
                    <button className="back-btn" onClick={() => router.push('/community')}>
                        ← 返回社区
                    </button>

                    {/* 方言标签头部 */}
                    <div className="dialect-header" style={{ borderColor: dialectInfo.color }}>
                        <div className="dialect-info">
                            <h1 style={{ color: dialectInfo.color }}>#{dialectName}</h1>
                            <p className="region">📍 {dialectInfo.region}</p>
                            <p className="count">{total} 篇帖子</p>
                        </div>
                        <div
                            className="dialect-badge"
                            style={{ backgroundColor: `${dialectInfo.color}30`, color: dialectInfo.color }}
                        >
                            方言
                        </div>
                    </div>

                    {/* 帖子列表 */}
                    <div className="posts-section">
                        {loading ? (
                            <div className="loading-state">
                                <div className="loading-spinner"></div>
                                <p>加载中...</p>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="empty-state">
                                <span className="empty-icon">📝</span>
                                <h3>暂无帖子</h3>
                                <p>快来发布第一篇关于{dialectName}的帖子吧！</p>
                                {isAuthenticated && (
                                    <button
                                        className="create-btn"
                                        onClick={() => router.push('/post/create')}
                                    >
                                        ✏️ 发布帖子
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="posts-list">
                                    {posts.map(post => (
                                        <PostCard
                                            key={post.id}
                                            post={post}
                                            onLike={handleLike}
                                            onDelete={handleDelete}
                                            currentUserId={user?.id}
                                        />
                                    ))}
                                </div>

                                {hasMore && (
                                    <button
                                        className="load-more-btn"
                                        onClick={loadMore}
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
                .dialect-container {
                    display: flex;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                }

                .dialect-content {
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

                .dialect-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding: 1.5rem;
                    background: rgba(44, 95, 78, 0.15);
                    border-radius: 20px;
                    border: 2px solid;
                    margin-bottom: 2rem;
                }

                .dialect-info h1 {
                    font-size: 2rem;
                    margin: 0 0 0.5rem 0;
                }

                .region {
                    color: #94a3b8;
                    margin: 0 0 0.25rem 0;
                    font-size: 0.95rem;
                }

                .count {
                    color: #64748b;
                    margin: 0;
                    font-size: 0.9rem;
                }

                .dialect-badge {
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .posts-section {
                    min-height: 400px;
                }

                .loading-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 4rem 2rem;
                }

                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(123, 220, 147, 0.2);
                    border-top-color: #7bdc93;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 1rem;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .loading-state p {
                    color: #94a3b8;
                    margin: 0;
                }

                .empty-state {
                    text-align: center;
                    padding: 4rem 2rem;
                    background: rgba(44, 95, 78, 0.1);
                    border-radius: 20px;
                    border: 1px dashed rgba(123, 220, 147, 0.2);
                }

                .empty-icon {
                    font-size: 4rem;
                    display: block;
                    margin-bottom: 1rem;
                }

                .empty-state h3 {
                    color: #e2e8f0;
                    margin: 0 0 0.5rem 0;
                }

                .empty-state p {
                    color: #94a3b8;
                    margin: 0 0 1.5rem 0;
                }

                .create-btn {
                    padding: 0.875rem 2rem;
                    background: linear-gradient(135deg, #2c5f4e, #3d7a64);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .create-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(123, 220, 147, 0.3);
                }

                .posts-list {
                    display: flex;
                    flex-direction: column;
                }

                .load-more-btn {
                    display: block;
                    width: 100%;
                    padding: 1rem;
                    background: rgba(44, 95, 78, 0.2);
                    border: 1px solid rgba(123, 220, 147, 0.2);
                    border-radius: 12px;
                    color: #e2e8f0;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-top: 1rem;
                }

                .load-more-btn:hover:not(:disabled) {
                    background: rgba(44, 95, 78, 0.3);
                    border-color: rgba(123, 220, 147, 0.4);
                }

                .load-more-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .dialect-content {
                        margin-left: 0;
                        padding: 1rem;
                    }

                    .dialect-header {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .dialect-info h1 {
                        font-size: 1.5rem;
                    }
                }
            `}</style>
        </>
    );
}
