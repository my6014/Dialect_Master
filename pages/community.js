/**
 * 社区首页
 * 显示帖子动态流、方言标签筛选和热门方言统计
 */
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Sidebar from '../components/Sidebar';
import PostCard from '../components/PostCard';
import { useUser } from '../hooks/useUser';

const API_BASE = 'http://127.0.0.1:8000';

// 热门方言标签
const POPULAR_DIALECTS = [
    '粤语', '四川话', '东北话', '上海话', '闽南语',
    '客家话', '湖南话', '河南话', '山东话', '陕西话'
];

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
    '陕西话': '#F0B27A'
};

export default function Community() {
    const router = useRouter();
    const { user, isAuthenticated, loading: userLoading } = useUser();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [selectedDialect, setSelectedDialect] = useState(null);
    const [dialectStats, setDialectStats] = useState([]);
    const [currentTab, setCurrentTab] = useState('all'); // 'all' or 'following'

    // 获取帖子列表
    const fetchPosts = useCallback(async (pageNum = 1, dialect = null, tab = 'all', append = false) => {
        if (pageNum === 1) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            let url = `${API_BASE}/api/posts?page=${pageNum}&page_size=20`;
            if (dialect) {
                url += `&dialect=${encodeURIComponent(dialect)}`;
            }
            if (tab === 'following') {
                url += `&following=true`;
            }

            const res = await fetch(url, { headers });

            if (!res.ok) throw new Error('获取帖子失败');

            const data = await res.json();

            if (append) {
                setPosts(prev => [...prev, ...data.posts]);
            } else {
                setPosts(data.posts);
            }

            setHasMore(data.has_more);
            setPage(pageNum);
        } catch (err) {
            console.error('获取帖子失败:', err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    // 获取方言统计
    const fetchDialectStats = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/api/posts/dialects/stats`);
            if (res.ok) {
                const data = await res.json();
                setDialectStats(data.stats || []);
            }
        } catch (err) {
            console.error('获取方言统计失败:', err);
        }
    }, []);

    useEffect(() => {
        fetchPosts(1, selectedDialect, currentTab);
        fetchDialectStats();
    }, [fetchPosts, fetchDialectStats, selectedDialect, currentTab]);

    // 加载更多
    const loadMore = () => {
        if (!loadingMore && hasMore) {
            fetchPosts(page + 1, selectedDialect, currentTab, true);
        }
    };

    // 选择方言标签
    const handleDialectSelect = (dialect) => {
        if (selectedDialect === dialect) {
            setSelectedDialect(null);
        } else {
            setSelectedDialect(dialect);
        }
        setPage(1);
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

            // 更新本地状态
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
            }
        } catch (err) {
            console.error('删除失败:', err);
        }
    };

    const handlePageChange = (pageId) => {
        if (pageId === 'dashboard') {
            router.push('/dashboard');
        } else if (pageId === 'asr') {
            router.push('/asr_test');
        } else if (pageId === 'community') {
            // Already on community
        } else if (pageId === 'settings') {
            router.push('/settings/profile');
        } else if (pageId === 'notifications') {
            router.push('/notifications');
        } else if (pageId === 'leaderboard') {
            router.push('/leaderboard');
        }
    };

    return (
        <>
            <Head>
                <title>社区 - 方言宝</title>
                <meta name="description" content="方言宝社区 - 与方言爱好者交流分享" />
            </Head>

            <div className="community-container">
                <Sidebar currentPage="community" onPageChange={handlePageChange} />

                <div className="community-content">
                    {/* 页面标题 */}
                    <div className="page-header">
                        <div className="header-left">
                            <h1>🏠 方言社区</h1>
                            <p>与全国各地的方言爱好者一起交流学习</p>
                        </div>
                        {isAuthenticated && (
                            <button
                                className="create-post-btn"
                                onClick={() => router.push('/post/create')}
                            >
                                ✏️ 发布动态
                            </button>
                        )}
                    </div>

                    {/* 动态/关注 Tab */}
                    <div className="tabs-container">
                        <button
                            className={`tab-item ${currentTab === 'all' ? 'active' : ''}`}
                            onClick={() => setCurrentTab('all')}
                        >
                            全部动态
                        </button>
                        {isAuthenticated && (
                            <button
                                className={`tab-item ${currentTab === 'following' ? 'active' : ''}`}
                                onClick={() => setCurrentTab('following')}
                            >
                                关注的人
                            </button>
                        )}
                    </div>

                    {/* 方言标签筛选 */}
                    <div className="dialect-filter">
                        <div className="filter-header">
                            <span className="filter-label">🏷️ 方言标签</span>
                            {selectedDialect && (
                                <button
                                    className="clear-filter"
                                    onClick={() => setSelectedDialect(null)}
                                >
                                    清除筛选
                                </button>
                            )}
                        </div>
                        <div className="dialect-tags">
                            {POPULAR_DIALECTS.map(dialect => (
                                <button
                                    key={dialect}
                                    className={`dialect-tag ${selectedDialect === dialect ? 'selected' : ''}`}
                                    style={{
                                        '--tag-color': DIALECT_COLORS[dialect],
                                        borderColor: selectedDialect === dialect ? DIALECT_COLORS[dialect] : 'transparent',
                                        backgroundColor: selectedDialect === dialect ? `${DIALECT_COLORS[dialect]}20` : 'rgba(44, 95, 78, 0.2)'
                                    }}
                                    onClick={() => handleDialectSelect(dialect)}
                                >
                                    #{dialect}
                                </button>
                            ))}
                            <button
                                className="more-dialects"
                                onClick={() => router.push('/dialects')}
                            >
                                更多 →
                            </button>
                        </div>
                    </div>

                    {/* 帖子动态流 */}
                    <div className="posts-section">
                        {loading ? (
                            <div className="loading-state">
                                <div className="loading-spinner"></div>
                                <p>加载中...</p>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="empty-state">
                                <span className="empty-icon">📝</span>
                                <h3>
                                    {selectedDialect
                                        ? `暂无 #${selectedDialect} 相关帖子`
                                        : (currentTab === 'following' ? '你关注的人还没发过帖子' : '社区还没有帖子')
                                    }
                                </h3>
                                <p>
                                    {selectedDialect
                                        ? '试试其他方言标签，或者发布第一篇帖子！'
                                        : (currentTab === 'following' ? '去关注更多有趣的人吧！' : '快来发布第一篇动态，分享你的方言故事吧！')
                                    }
                                </p>
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
                                        {loadingMore ? (
                                            <>
                                                <span className="btn-spinner"></span>
                                                加载中...
                                            </>
                                        ) : (
                                            '加载更多'
                                        )}
                                    </button>
                                )}

                                {!hasMore && posts.length > 0 && (
                                    <div className="no-more">
                                        — 没有更多了 —
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* 右侧边栏 - 热门方言 */}
                <aside className="right-sidebar">
                    <div className="sidebar-card">
                        <h3>🔥 热门方言</h3>
                        <div className="hot-dialects">
                            {dialectStats.length > 0 ? (
                                dialectStats.slice(0, 8).map((item, index) => (
                                    <div
                                        key={item.tag}
                                        className="hot-dialect-item"
                                        onClick={() => router.push(`/dialect/${encodeURIComponent(item.tag)}`)}
                                    >
                                        <span className="rank">#{index + 1}</span>
                                        <span
                                            className="dialect-name"
                                            style={{ color: DIALECT_COLORS[item.tag] || '#e2e8f0' }}
                                        >
                                            {item.tag}
                                        </span>
                                        <span className="post-count">{item.count} 帖</span>
                                    </div>
                                ))
                            ) : (
                                <div className="no-stats">
                                    <p>暂无数据</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {!isAuthenticated && (
                        <div className="sidebar-card login-prompt">
                            <h3>👋 加入社区</h3>
                            <p>登录后即可发布动态、点赞评论</p>
                            <button onClick={() => router.push('/login')}>
                                登录 / 注册
                            </button>
                        </div>
                    )}
                </aside>
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
                    max-width: 700px;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1.5rem;
                }

                .header-left h1 {
                    font-size: 1.75rem;
                    color: #e2e8f0;
                    margin: 0 0 0.5rem 0;
                }

                .header-left p {
                    color: #94a3b8;
                    margin: 0;
                    font-size: 0.95rem;
                }

                .create-post-btn {
                    padding: 0.75rem 1.5rem;
                    background: linear-gradient(135deg, #2c5f4e, #3d7a64);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                }

                .create-post-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(123, 220, 147, 0.3);
                }

                .tabs-container {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                    border-bottom: 1px solid rgba(123, 220, 147, 0.2);
                    padding-bottom: 0.5rem;
                }

                .tab-item {
                    padding: 0.75rem 1.5rem;
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 500;
                }

                .tab-item:hover {
                    color: #e2e8f0;
                    background: rgba(44, 95, 78, 0.2);
                }

                .tab-item.active {
                    color: #7bdc93;
                    background: rgba(123, 220, 147, 0.1);
                    font-weight: 600;
                }

                .dialect-filter {
                    background: rgba(44, 95, 78, 0.15);
                    border-radius: 16px;
                    border: 1px solid rgba(123, 220, 147, 0.15);
                    padding: 1rem 1.25rem;
                    margin-bottom: 1.5rem;
                }

                .filter-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.75rem;
                }

                .filter-label {
                    color: #e2e8f0;
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .clear-filter {
                    background: transparent;
                    border: none;
                    color: #7bdc93;
                    font-size: 0.8rem;
                    cursor: pointer;
                    padding: 0.25rem 0.5rem;
                }

                .clear-filter:hover {
                    text-decoration: underline;
                }

                .dialect-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .dialect-tag {
                    padding: 0.4rem 0.875rem;
                    border-radius: 20px;
                    border: 1px solid transparent;
                    color: #e2e8f0;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .dialect-tag:hover {
                    border-color: var(--tag-color);
                    background-color: rgba(123, 220, 147, 0.1) !important;
                }

                .dialect-tag.selected {
                    color: var(--tag-color);
                    font-weight: 600;
                }

                .more-dialects {
                    padding: 0.4rem 0.875rem;
                    background: transparent;
                    border: 1px dashed rgba(123, 220, 147, 0.3);
                    border-radius: 20px;
                    color: #94a3b8;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .more-dialects:hover {
                    border-color: #7bdc93;
                    color: #7bdc93;
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
                    font-size: 1.1rem;
                }

                .empty-state p {
                    color: #94a3b8;
                    margin: 0 0 1.5rem 0;
                    font-size: 0.95rem;
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
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
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
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .btn-spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                .no-more {
                    text-align: center;
                    color: #64748b;
                    padding: 2rem;
                    font-size: 0.9rem;
                }

                .right-sidebar {
                    width: 280px;
                    padding: 2rem 1rem 2rem 0;
                    flex-shrink: 0;
                }

                .sidebar-card {
                    background: rgba(44, 95, 78, 0.15);
                    border-radius: 16px;
                    border: 1px solid rgba(123, 220, 147, 0.15);
                    padding: 1.25rem;
                    margin-bottom: 1rem;
                }

                .sidebar-card h3 {
                    color: #e2e8f0;
                    font-size: 1rem;
                    margin: 0 0 1rem 0;
                }

                .hot-dialects {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .hot-dialect-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.5rem 0.75rem;
                    background: rgba(26, 26, 46, 0.3);
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .hot-dialect-item:hover {
                    background: rgba(123, 220, 147, 0.1);
                }

                .rank {
                    color: #64748b;
                    font-size: 0.8rem;
                    width: 24px;
                }

                .dialect-name {
                    flex: 1;
                    font-weight: 500;
                    font-size: 0.9rem;
                }

                .post-count {
                    color: #64748b;
                    font-size: 0.8rem;
                }

                .no-stats {
                    text-align: center;
                    padding: 1rem;
                }

                .no-stats p {
                    color: #64748b;
                    margin: 0;
                    font-size: 0.9rem;
                }

                .login-prompt {
                    text-align: center;
                }

                .login-prompt p {
                    color: #94a3b8;
                    font-size: 0.9rem;
                    margin: 0 0 1rem 0;
                }

                .login-prompt button {
                    width: 100%;
                    padding: 0.75rem;
                    background: linear-gradient(135deg, #2c5f4e, #3d7a64);
                    border: none;
                    border-radius: 10px;
                    color: white;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .login-prompt button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(123, 220, 147, 0.3);
                }

                @media (max-width: 1024px) {
                    .right-sidebar {
                        display: none;
                    }
                }

                @media (max-width: 768px) {
                    .community-content {
                        margin-left: 0;
                        padding: 1rem;
                    }

                    .page-header {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .create-post-btn {
                        width: 100%;
                    }

                    .dialect-filter {
                        padding: 1rem;
                    }
                }
            `}</style>
        </>
    );
}
