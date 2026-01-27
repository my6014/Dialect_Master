import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Sidebar from '../components/Sidebar';
import { useUser } from '../hooks/useUser';

const API_BASE = 'http://127.0.0.1:8000';

const LEVEL_NAMES = {
    1: "方言新手",
    2: "方言学徒",
    3: "方言爱好者",
    4: "方言达人",
    5: "方言大师",
    6: "方言宗师"
};

const LEVEL_COLORS = {
    1: "#9CA3AF",
    2: "#60A5FA",
    3: "#34D399",
    4: "#FBBF24",
    5: "#F472B6",
    6: "#8B5CF6"
};

export default function LeaderboardPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useUser();

    const [activeTab, setActiveTab] = useState('total'); // total, weekly, monthly
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myStatus, setMyStatus] = useState(null);
    const [checkinLoading, setCheckinLoading] = useState(false);

    const fetchLeaderboard = async (type) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/points/leaderboard?type=${type}&limit=50`);
            if (res.ok) {
                const data = await res.json();
                setLeaderboard(data);
            }
        } catch (error) {
            console.error("Fetch leaderboard error:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyStatus = async () => {
        if (!isAuthenticated) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/points/status`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMyStatus(data);
            }
        } catch (error) {
            console.error("Fetch status error:", error);
        }
    };

    useEffect(() => {
        fetchLeaderboard(activeTab);
    }, [activeTab]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchMyStatus();
        }
    }, [isAuthenticated]);

    const handleCheckin = async () => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        setCheckinLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/points/checkin`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success) {
                // 刷新状态
                fetchMyStatus();
                // 如果排行榜有自己，也可能需要刷新，简单起见直接刷新
                fetchLeaderboard(activeTab);
                alert(data.message);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Checkin error:", error);
            alert("签到失败，请稍后重试");
        } finally {
            setCheckinLoading(false);
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
        <div className="page-container">
            <Head>
                <title>排行榜 - 方言宝</title>
                <meta name="description" content="查看方言社区排行榜，参与每日签到" />
            </Head>

            <Sidebar activeTab="leaderboard" onPageChange={handlePageChange} />

            <div className="content">
                {/* 顶部个人状态卡片 */}
                {isAuthenticated && myStatus && (
                    <div className="status-card">
                        <div className="status-info">
                            <div className="points-display">
                                <span className="label">当前积分</span>
                                <span className="value">{myStatus.points}</span>
                            </div>
                            <div className="level-display">
                                <div className="level-badge" style={{ backgroundColor: LEVEL_COLORS[myStatus.level] }}>
                                    Lv.{myStatus.level} {myStatus.level_name}
                                </div>
                                {myStatus.next_level_points && (
                                    <div className="level-progress">
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${(myStatus.points / myStatus.next_level_points) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="progress-text">
                                            距离下一级还需 {myStatus.next_level_points - myStatus.points} 积分
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="checkin-section">
                            <div className="streak-info">
                                <span className="streak-days">{myStatus.streak_days}</span>
                                <span className="streak-label">连续签到天数</span>
                            </div>
                            <button
                                className={`checkin-btn ${myStatus.is_checked_in ? 'checked' : ''}`}
                                onClick={handleCheckin}
                                disabled={myStatus.is_checked_in || checkinLoading}
                            >
                                {checkinLoading ? '签到中...' : myStatus.is_checked_in ? '今日已签到' : '立即签到'}
                            </button>
                        </div>
                    </div>
                )}

                {/* 排行榜区域 */}
                <div className="leaderboard-section">
                    <div className="tabs">
                        <button
                            className={`tab-btn ${activeTab === 'total' ? 'active' : ''}`}
                            onClick={() => setActiveTab('total')}
                        >
                            🏆 总积分榜
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'weekly' ? 'active' : ''}`}
                            onClick={() => setActiveTab('weekly')}
                        >
                            📅 周贡献榜
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'monthly' ? 'active' : ''}`}
                            onClick={() => setActiveTab('monthly')}
                        >
                            🗓️ 月贡献榜
                        </button>
                    </div>

                    <div className="list-container">
                        <div className="list-header">
                            <span className="col-rank">排名</span>
                            <span className="col-user">用户</span>
                            <span className="col-level">等级</span>
                            <span className="col-points">积分</span>
                        </div>

                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                            </div>
                        ) : leaderboard.length > 0 ? (
                            <div className="list-body">
                                {leaderboard.map((item, index) => (
                                    <div key={item.id} className={`list-row rank-${index + 1}`}>
                                        <span className="col-rank">
                                            {index + 1 <= 3 ? (
                                                <span className={`rank-icon rank-${index + 1}`}>
                                                    {['🥇', '🥈', '🥉'][index]}
                                                </span>
                                            ) : (
                                                <span className="rank-num">{index + 1}</span>
                                            )}
                                        </span>
                                        <div className="col-user" onClick={() => router.push(`/user/${item.id}`)}>
                                            <div className="avatar">
                                                {item.avatar_url ? (
                                                    <img src={`${API_BASE}${item.avatar_url}`} alt={item.nickname} />
                                                ) : (
                                                    <span className="avatar-initial">
                                                        {(item.nickname || item.username)[0].toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="username" title={item.nickname || item.username}>
                                                {item.nickname || item.username}
                                                {user && user.id === item.id && <span className="me-badge">我</span>}
                                            </span>
                                        </div>
                                        <div className="col-level">
                                            <span
                                                className="level-tag"
                                                style={{
                                                    color: LEVEL_COLORS[item.level],
                                                    backgroundColor: `${LEVEL_COLORS[item.level]}20`,
                                                    borderColor: LEVEL_COLORS[item.level]
                                                }}
                                            >
                                                Lv.{item.level} {item.level_name}
                                            </span>
                                        </div>
                                        <span className="col-points">{item.points}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                暂无数据
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .page-container {
                    display: flex;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    color: #e2e8f0;
                }
                
                .content {
                    flex: 1;
                    margin-left: 100px;
                    padding: 2rem;
                    max-width: 1000px;
                }
                
                .status-card {
                    background: rgba(44, 95, 78, 0.15);
                    border: 1px solid rgba(123, 220, 147, 0.2);
                    border-radius: 20px;
                    padding: 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    backdrop-filter: blur(10px);
                }
                
                .status-info {
                    flex: 1;
                    display: flex;
                    gap: 3rem;
                }
                
                .points-display {
                    display: flex;
                    flex-direction: column;
                }
                
                .points-display .label {
                    color: #94a3b8;
                    font-size: 0.9rem;
                    margin-bottom: 0.5rem;
                }
                
                .points-display .value {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: #7bdc93;
                    text-shadow: 0 0 20px rgba(123, 220, 147, 0.3);
                }
                
                .level-display {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 0.8rem;
                    min-width: 200px;
                }
                
                .level-badge {
                    align-self: flex-start;
                    padding: 0.4rem 1rem;
                    border-radius: 20px;
                    color: white;
                    font-weight: 600;
                    font-size: 0.9rem;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
                }
                
                .progress-bar {
                    height: 6px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 3px;
                    overflow: hidden;
                    margin-bottom: 0.3rem;
                }
                
                .progress-fill {
                    height: 100%;
                    background: #7bdc93;
                    border-radius: 3px;
                }
                
                .progress-text {
                    font-size: 0.8rem;
                    color: #94a3b8;
                }
                
                .checkin-section {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                    padding-left: 2rem;
                    border-left: 1px solid rgba(255,255,255,0.1);
                }
                
                .streak-info {
                    text-align: center;
                }
                
                .streak-days {
                    display: block;
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: #e2e8f0;
                }
                
                .streak-label {
                    font-size: 0.8rem;
                    color: #94a3b8;
                }
                
                .checkin-btn {
                    padding: 0.8rem 2rem;
                    border-radius: 12px;
                    border: none;
                    background: linear-gradient(135deg, #2c5f4e, #3d7a64);
                    color: white;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(44, 95, 78, 0.4);
                }
                
                .checkin-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(44, 95, 78, 0.5);
                }
                
                .checkin-btn.checked {
                    background: rgba(255,255,255,0.1);
                    color: #94a3b8;
                    cursor: default;
                    box-shadow: none;
                }
                
                .leaderboard-section {
                    background: rgba(26, 26, 46, 0.4);
                    border: 1px solid rgba(123, 220, 147, 0.1);
                    border-radius: 20px;
                    overflow: hidden;
                }
                
                .tabs {
                    display: flex;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                
                .tab-btn {
                    flex: 1;
                    padding: 1.2rem;
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .tab-btn:hover {
                    color: #e2e8f0;
                    background: rgba(255,255,255,0.02);
                }
                
                .tab-btn.active {
                    color: #7bdc93;
                    border-bottom: 2px solid #7bdc93;
                    background: rgba(123, 220, 147, 0.05);
                }
                
                .list-container {
                    padding: 1rem;
                }
                
                .list-header {
                    display: flex;
                    padding: 1rem;
                    color: #94a3b8;
                    font-size: 0.9rem;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                
                .col-rank { width: 80px; text-align: center; }
                .col-user { flex: 1; padding-left: 1rem; }
                .col-level { width: 150px; text-align: center; }
                .col-points { width: 100px; text-align: right; font-family: monospace; }
                
                .list-body {
                    max-height: 600px;
                    overflow-y: auto;
                }
                
                .list-row {
                    display: flex;
                    align-items: center;
                    padding: 1rem;
                    transition: all 0.2s;
                    border-radius: 10px;
                    margin-bottom: 0.2rem;
                }
                
                .list-row:hover {
                    background: rgba(255,255,255,0.05);
                }
                
                .rank-num {
                    display: inline-block;
                    width: 28px;
                    height: 28px;
                    line-height: 28px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 50%;
                    font-size: 0.9rem;
                    font-weight: 600;
                }
                
                .rank-icon {
                    font-size: 1.5rem;
                }
                
                .col-user {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    cursor: pointer;
                }
                
                .avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    overflow: hidden;
                    background: rgba(255,255,255,0.1);
                }
                
                .avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .avatar-initial {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: #e2e8f0;
                }
                
                .username {
                    font-weight: 500;
                    color: #e2e8f0;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .me-badge {
                    font-size: 0.7rem;
                    background: #7bdc93;
                    color: #1a1a2e;
                    padding: 0.1rem 0.4rem;
                    border-radius: 4px;
                    font-weight: 700;
                }
                
                .level-tag {
                    padding: 0.3rem 0.8rem;
                    border-radius: 15px;
                    font-size: 0.8rem;
                    border: 1px solid;
                }
                
                .col-points {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #7bdc93;
                }
                
                .rank-1 { background: linear-gradient(90deg, rgba(255,215,0,0.1), transparent); }
                .rank-2 { background: linear-gradient(90deg, rgba(192,192,192,0.1), transparent); }
                .rank-3 { background: linear-gradient(90deg, rgba(205,127,50,0.1), transparent); }
                
                .loading-state, .empty-state {
                    padding: 3rem;
                    text-align: center;
                    color: #94a3b8;
                }
                
                .spinner {
                    width: 30px;
                    height: 30px;
                    border: 3px solid rgba(123,220,147,0.3);
                    border-top-color: #7bdc93;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                @media (max-width: 768px) {
                    .content {
                        margin-left: 0;
                        padding: 1rem;
                        padding-bottom: 80px;
                    }
                    
                    .status-card {
                        flex-direction: column;
                        gap: 1.5rem;
                        align-items: stretch;
                        padding: 1.5rem;
                    }
                    
                    .checkin-section {
                        border-left: none;
                        border-top: 1px solid rgba(255,255,255,0.1);
                        padding-left: 0;
                        padding-top: 1.5rem;
                        justify-content: space-between;
                    }
                    
                    .col-level { display: none; }
                }
            `}</style>
        </div>
    );
}
