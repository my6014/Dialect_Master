import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Sidebar from '../../components/Sidebar';
import PostCard from '../../components/PostCard';


// API 基础 URL
const API_BASE = 'http://127.0.0.1:8000';

// 等级名称映射
const LEVEL_NAMES = {
  1: "方言新手",
  2: "方言学徒",
  3: "方言爱好者",
  4: "方言达人",
  5: "方言大师",
  6: "方言宗师"
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

export default function UserProfile() {
  const router = useRouter();
  const { id } = router.query;



  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // 帖子相关状态
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // 获取当前登录用户
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    if (userId && token) {
      setCurrentUser({ id: parseInt(userId), token });
    }
  }, []);

  // 获取用户资料
  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const res = await fetch(`${API_BASE}/api/users/${id}`, { headers });

        if (!res.ok) {
          if (res.status === 404) {
            setError('用户不存在');
          } else {
            setError('获取用户资料失败');
          }
          return;
        }

        const data = await res.json();
        setUser(data);
        setIsFollowing(data.is_following);
      } catch (err) {
        setError('网络错误，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  // 关注/取消关注
  const handleFollow = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    setFollowLoading(true);
    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const res = await fetch(`${API_BASE}/api/users/${id}/follow`, {
        method: method,
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        const prevIsFollowing = isFollowing;
        setIsFollowing(data.is_following);

        if (prevIsFollowing !== data.is_following) {
          setUser(prev => ({
            ...prev,
            followers_count: data.is_following
              ? prev.followers_count + 1
              : Math.max(0, prev.followers_count - 1)
          }));
        }
      }
    } catch (err) {
      console.error('关注操作失败:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  // 获取用户帖子
  useEffect(() => {
    if (!id) return;

    const fetchPosts = async () => {
      setLoadingPosts(true);
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const res = await fetch(`${API_BASE}/api/posts/user/${id}?page=1&page_size=20`, { headers });

        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
        }
      } catch (err) {
        console.error('获取帖子失败:', err);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [id]);

  // 处理点赞
  const handleLike = async (postId) => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      });

      if (res.ok) {
        const data = await res.json();

        // 更新帖子列表中的点赞状态
        setPosts(prevPosts => prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              is_liked: data.is_liked,
              likes_count: data.likes_count
            };
          }
          return post;
        }));
      }
    } catch (err) {
      console.error('点赞失败:', err);
    }
  };

  // 处理删除
  const handleDelete = async (postId) => {
    if (!currentUser) return;

    try {
      const res = await fetch(`${API_BASE}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      });

      if (res.ok) {
        // 从列表中移除
        setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
      }
    } catch (err) {
      console.error('删除失败:', err);
    }
  };

  const isOwnProfile = currentUser && parseInt(id) === currentUser.id;

  const handlePageChange = (pageId) => {
    if (pageId === 'dashboard') {
      router.push('/dashboard');
    } else if (pageId === 'asr') {
      router.push('/asr_test');
    } else if (pageId === 'community') {
      router.push('/community');
    } else if (pageId === 'settings') {
      router.push('/settings/profile');
    } else if (pageId === 'notifications') {
      router.push('/notifications');
    } else if (pageId === 'leaderboard') {
      router.push('/leaderboard');
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <Sidebar onPageChange={handlePageChange} />
        <div className="profile-content">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>加载中...</p>
          </div>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <Sidebar onPageChange={handlePageChange} />
        <div className="profile-content">
          <div className="error-message">
            <span className="error-icon">😕</span>
            <h2>{error}</h2>
            <button onClick={() => router.back()}>返回</button>
          </div>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{user?.nickname || user?.username} - 方言宝</title>
        <meta name="description" content={`${user?.nickname || user?.username} 的个人主页 - 方言宝社区`} />
      </Head>

      <div className="profile-container">
        <Sidebar onPageChange={handlePageChange} />

        <div className="profile-content">
          {/* 用户头部信息 */}
          <div className="profile-header">
            <div className="avatar-section">
              <div className="avatar-wrapper">
                {user?.avatar_url ? (
                  <img
                    src={`${API_BASE}${user.avatar_url}`}
                    alt={user.nickname || user.username}
                    className="avatar"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {(user?.nickname || user?.username || '?')[0].toUpperCase()}
                  </div>
                )}
                <div
                  className="level-badge"
                  style={{ backgroundColor: LEVEL_COLORS[user?.level || 1] }}
                >
                  Lv.{user?.level || 1}
                </div>
              </div>
            </div>

            <div className="user-info">
              <div className="name-row">
                <h1 className="nickname">{user?.nickname || user?.username}</h1>
                {user?.dialect && (
                  <span className="dialect-tag">#{user.dialect}</span>
                )}
              </div>

              <p className="username">@{user?.username}</p>

              <p className="bio">{user?.bio || '这个人很懒，还没有写简介...'}</p>

              <div className="meta-info">
                {user?.hometown && (
                  <span className="meta-item">
                    <span className="meta-icon">📍</span>
                    {user.hometown}
                  </span>
                )}
                <span className="meta-item">
                  <span className="meta-icon">⭐</span>
                  {LEVEL_NAMES[user?.level || 1]}
                </span>
                <span className="meta-item">
                  <span className="meta-icon">🏆</span>
                  {user?.points || 0} 积分
                </span>
              </div>

              <div className="stats-row">
                <div
                  className="stat-item clickable"
                  onClick={() => router.push(`/user/${user.id}/followers`)}
                >
                  <span className="stat-value">{user?.followers_count || 0}</span>
                  <span className="stat-label">粉丝</span>
                </div>
                <div
                  className="stat-item clickable"
                  onClick={() => router.push(`/user/${user.id}/following`)}
                >
                  <span className="stat-value">{user?.following_count || 0}</span>
                  <span className="stat-label">关注</span>
                </div>
              </div>

              <div className="action-buttons">
                {isOwnProfile ? (
                  <button
                    className="btn-edit"
                    onClick={() => router.push('/settings/profile')}
                  >
                    ✏️ 编辑资料
                  </button>
                ) : (
                  <button
                    className={`btn-follow ${isFollowing ? 'following' : ''}`}
                    onClick={handleFollow}
                    disabled={followLoading}
                  >
                    {followLoading ? '...' : (isFollowing ? '✓ 已关注' : '+ 关注')}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 用户动态（待实现） */}
          <div className="profile-tabs">
            <div className="tab active">动态</div>
            <div className="tab">喜欢</div>
          </div>

          <div className="posts-section">
            {loadingPosts ? (
              <div className="loading-posts">
                <div className="spinner-small"></div>
                <span>加载动态中...</span>
              </div>
            ) : posts.length > 0 ? (
              <div className="posts-list">
                {posts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={currentUser?.id}
                    onLike={handleLike}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-posts">
                <span className="empty-icon">📝</span>
                <p>暂无动态</p>
                {isOwnProfile && (
                  <button
                    className="btn-create-post"
                    onClick={() => router.push('/post/create')}
                  >
                    发布第一条动态
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{styles}</style>
    </>
  );
}

const styles = `
  .profile-container {
    display: flex;
    min-height: 100vh;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  }

  .profile-content {
    flex: 1;
    margin-left: 280px;
    padding: 2rem;
    max-width: 900px;
  }

  .loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 50vh;
    color: #94a3b8;
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 3px solid #2c5f4e;
    border-top: 3px solid #7bdc93;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .error-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 50vh;
    color: #e2e8f0;
    text-align: center;
  }

  .error-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .error-message button {
    margin-top: 1.5rem;
    padding: 0.75rem 2rem;
    background: linear-gradient(135deg, #2c5f4e, #3d7a64);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.3s ease;
  }

  .error-message button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(123, 220, 147, 0.3);
  }

  .profile-header {
    display: flex;
    gap: 2rem;
    padding: 2rem;
    background: rgba(44, 95, 78, 0.2);
    border-radius: 20px;
    border: 1px solid rgba(123, 220, 147, 0.2);
    backdrop-filter: blur(10px);
    margin-bottom: 2rem;
  }

  .avatar-section {
    flex-shrink: 0;
  }

  .avatar-wrapper {
    position: relative;
    width: 140px;
    height: 140px;
  }

  .avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid #2c5f4e;
  }

  .avatar-placeholder {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, #2c5f4e, #3d7a64);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    color: #7bdc93;
    font-weight: bold;
    border: 4px solid #2c5f4e;
  }

  .level-badge {
    position: absolute;
    bottom: 0;
    right: 0;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: bold;
    color: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .user-info {
    flex: 1;
  }

  .name-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.25rem;
  }

  .nickname {
    font-size: 1.75rem;
    font-weight: 700;
    color: #e2e8f0;
    margin: 0;
  }

  .dialect-tag {
    padding: 0.25rem 0.75rem;
    background: rgba(123, 220, 147, 0.2);
    color: #7bdc93;
    border-radius: 20px;
    font-size: 0.875rem;
  }

  .username {
    color: #94a3b8;
    font-size: 0.95rem;
    margin: 0 0 1rem 0;
  }

  .bio {
    color: #cbd5e1;
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  .meta-info {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #94a3b8;
    font-size: 0.875rem;
  }

  .meta-icon {
    font-size: 1rem;
  }

  .stats-row {
    display: flex;
    gap: 2rem;
    margin-bottom: 1.5rem;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #7bdc93;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #94a3b8;
  }

  .stat-item.clickable {
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .stat-item.clickable:hover {
    transform: translateY(-2px);
  }

  .stat-item.clickable:hover .stat-value {
    text-shadow: 0 0 10px rgba(123, 220, 147, 0.4);
  }

  .action-buttons {
    display: flex;
    gap: 1rem;
  }

  .btn-edit, .btn-follow {
    padding: 0.75rem 1.5rem;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
  }

  .btn-edit {
    background: rgba(44, 95, 78, 0.3);
    color: #7bdc93;
    border: 1px solid #2c5f4e;
  }

  .btn-edit:hover {
    background: rgba(44, 95, 78, 0.5);
  }

  .btn-follow {
    background: linear-gradient(135deg, #2c5f4e, #3d7a64);
    color: white;
  }

  .btn-follow:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(123, 220, 147, 0.3);
  }

  .btn-follow.following {
    background: rgba(44, 95, 78, 0.3);
    color: #7bdc93;
    border: 1px solid #2c5f4e;
  }

  .btn-follow:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .profile-tabs {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid rgba(123, 220, 147, 0.2);
    padding-bottom: 1rem;
  }

  .tab {
    padding: 0.75rem 1.5rem;
    color: #94a3b8;
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 8px;
  }

  .tab:hover {
    color: #e2e8f0;
    background: rgba(44, 95, 78, 0.2);
  }

  .tab.active {
    color: #7bdc93;
    background: rgba(123, 220, 147, 0.1);
  }

  .posts-section {
    min-height: 200px;
  }

  .loading-posts {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: #94a3b8;
  }

  .spinner-small {
    width: 32px;
    height: 32px;
    border: 3px solid #2c5f4e;
    border-top: 3px solid #7bdc93;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 0.5rem;
  }

  .empty-posts {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    color: #94a3b8;
    text-align: center;
    background: rgba(44, 95, 78, 0.1);
    border-radius: 16px;
    border: 1px dashed rgba(123, 220, 147, 0.2);
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .empty-posts p {
    margin: 0 0 1.5rem 0;
    font-size: 1.1rem;
  }

  .btn-create-post {
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #2c5f4e, #3d7a64);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-create-post:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(123, 220, 147, 0.3);
  }

  @media (max-width: 768px) {
    .profile-content {
      margin-left: 0;
      padding: 1rem;
    }

    .profile-header {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .name-row {
      flex-direction: column;
    }

    .meta-info {
      justify-content: center;
    }

    .stats-row {
      justify-content: center;
    }

    .action-buttons {
      justify-content: center;
    }
  }
`;
