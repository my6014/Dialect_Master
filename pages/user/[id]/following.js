import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Sidebar from '../../../components/Sidebar';
import UserList from '../../../components/UserList';

const API_BASE = 'http://127.0.0.1:8000';

export default function FollowingPage() {
    const router = useRouter();
    const { id } = router.query;
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        if (userId && token) {
            setCurrentUser({ id: parseInt(userId), token });
        }
    }, []);

    useEffect(() => {
        if (!id) return;
        const fetchFollowing = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                const res = await fetch(`${API_BASE}/api/users/${id}/following?page=1&size=50`, { headers });
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data.items);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchFollowing();
    }, [id]);

    const handleFollowToggle = async (targetId, isFollowing) => {
        if (!currentUser) {
            router.push('/login');
            return;
        }

        try {
            const method = isFollowing ? 'DELETE' : 'POST';
            const res = await fetch(`${API_BASE}/api/users/${targetId}/follow`, {
                method,
                headers: {
                    'Authorization': `Bearer ${currentUser.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                const data = await res.json();
                setUsers(prev => prev.map(u => {
                    if (u.id === targetId) {
                        return {
                            ...u,
                            is_following: data.is_following,
                            followers_count: data.is_following ? u.followers_count + 1 : u.followers_count - 1
                        };
                    }
                    return u;
                }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="page-container">
            <Head><title>关注列表 - 方言宝</title></Head>
            <Sidebar />
            <div className="content">
                <div className="header">
                    <button onClick={() => router.back()} className="back-btn">← 返回个人主页</button>
                    <h1>关注列表</h1>
                </div>

                {loading ? (
                    <div className="loading">
                        <div className="spinner"></div>
                        <p>加载中...</p>
                    </div>
                ) : (
                    <UserList
                        users={users}
                        currentUserId={currentUser?.id}
                        onFollowToggle={handleFollowToggle}
                    />
                )}
            </div>
            <style jsx>{`
                .page-container {
                    display: flex;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                }
                .content {
                    flex: 1;
                    margin-left: 280px;
                    padding: 2rem;
                    max-width: 800px;
                }
                .header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid rgba(123, 220, 147, 0.2);
                }
                .header h1 {
                    font-size: 1.5rem;
                    color: #e2e8f0;
                    margin: 0;
                }
                .back-btn {
                    padding: 0.5rem 1rem;
                    background: rgba(44, 95, 78, 0.3);
                    color: #94a3b8;
                    border: 1px solid rgba(123, 220, 147, 0.2);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .back-btn:hover {
                    background: rgba(44, 95, 78, 0.5);
                    color: white;
                }
                .loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 50vh;
                    color: #94a3b8;
                }
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid #2c5f4e;
                    border-top: 3px solid #7bdc93;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 1rem;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @media (max-width: 768px) {
                    .content {
                        margin-left: 0;
                        padding: 1rem;
                        padding-bottom: 80px; /* Mobile sidebar height */
                    }
                }
            `}</style>
        </div>
    );
}
