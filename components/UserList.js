import { useRouter } from 'next/router';

const API_BASE = 'http://127.0.0.1:8000';

const UserList = ({ users, onFollowToggle, currentUserId }) => {
    const router = useRouter();

    if (!users || users.length === 0) {
        return (
            <div className="empty-list">
                <span className="empty-icon">👥</span>
                <p>暂无用户</p>
                <style jsx>{`
                    .empty-list {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        padding: 3rem;
                        color: #94a3b8;
                    }
                    .empty-icon {
                        font-size: 3rem;
                        margin-bottom: 1rem;
                        opacity: 0.5;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="user-list">
            {users.map(user => (
                <div key={user.id} className="user-item">
                    <div
                        className="user-avatar-wrapper"
                        onClick={() => router.push(`/user/${user.id}`)}
                    >
                        {user.avatar_url ? (
                            <img
                                src={`${API_BASE}${user.avatar_url}`}
                                alt={user.nickname}
                                className="user-avatar"
                            />
                        ) : (
                            <div className="avatar-placeholder">
                                {(user.nickname || user.username || '?')[0].toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="user-info">
                        <div className="name-row">
                            <h3
                                className="user-name"
                                onClick={() => router.push(`/user/${user.id}`)}
                            >
                                {user.nickname || user.username}
                            </h3>
                            <span
                                className="level-badge"
                                style={{ backgroundColor: getLevelColor(user.level || 1) }}
                            >
                                Lv.{user.level || 1}
                            </span>
                        </div>
                        <p className="user-handle">@{user.username}</p>
                        {user.bio && <p className="user-bio">{user.bio}</p>}
                        <div className="user-stats">
                            <span>{user.followers_count} 粉丝</span>
                            <span>{user.following_count} 关注</span>
                        </div>
                    </div>

                    {currentUserId && user.id !== currentUserId && (
                        <button
                            className={`btn-follow ${user.is_following ? 'following' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onFollowToggle(user.id, user.is_following);
                            }}
                        >
                            {user.is_following ? '已关注' : '+ 关注'}
                        </button>
                    )}
                </div>
            ))}

            <style jsx>{`
                .user-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                
                .user-item {
                    display: flex;
                    align-items: center;
                    padding: 1.5rem;
                    background: rgba(26, 26, 46, 0.4);
                    border: 1px solid rgba(123, 220, 147, 0.1);
                    border-radius: 12px;
                    transition: all 0.3s ease;
                }
                
                .user-item:hover {
                    background: rgba(26, 26, 46, 0.6);
                    border-color: rgba(123, 220, 147, 0.3);
                    transform: translateY(-2px);
                }
                
                .user-avatar-wrapper {
                    width: 60px;
                    height: 60px;
                    margin-right: 1.5rem;
                    cursor: pointer;
                    flex-shrink: 0;
                }
                
                .user-avatar {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid #2c5f4e;
                }
                
                .avatar-placeholder {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #2c5f4e, #3d7a64);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #7bdc93;
                    font-weight: bold;
                    font-size: 1.5rem;
                    border: 2px solid #2c5f4e;
                }
                
                .user-info {
                    flex: 1;
                    min-width: 0; /* Prevent text overflow */
                }
                
                .name-row {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 0.25rem;
                }
                
                .user-name {
                    margin: 0;
                    font-size: 1.1rem;
                    color: #e2e8f0;
                    cursor: pointer;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .user-name:hover {
                    color: #7bdc93;
                    text-decoration: underline;
                }
                
                .level-badge {
                    padding: 0.1rem 0.4rem;
                    border-radius: 10px;
                    font-size: 0.7rem;
                    color: white;
                    font-weight: bold;
                }
                
                .user-handle {
                    margin: 0 0 0.5rem 0;
                    font-size: 0.85rem;
                    color: #94a3b8;
                }
                
                .user-bio {
                    margin: 0 0 0.5rem 0;
                    font-size: 0.9rem;
                    color: #cbd5e1;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .user-stats {
                    display: flex;
                    gap: 1rem;
                    font-size: 0.8rem;
                    color: #64748b;
                }
                
                .btn-follow {
                    padding: 0.5rem 1.2rem;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: none;
                    background: linear-gradient(135deg, #2c5f4e, #3d7a64);
                    color: white;
                    margin-left: 1rem;
                    flex-shrink: 0;
                }
                
                .btn-follow:hover {
                    box-shadow: 0 4px 12px rgba(123, 220, 147, 0.3);
                    transform: translateY(-1px);
                }
                
                .btn-follow.following {
                    background: rgba(44, 95, 78, 0.3);
                    color: #7bdc93;
                    border: 1px solid #2c5f4e;
                }
                
                .btn-follow.following:hover {
                    background: rgba(220, 38, 38, 0.2);
                    color: #f87171;
                    border-color: #ef4444;
                }
                
                /* Responsive */
                @media (max-width: 640px) {
                    .user-item {
                        flex-direction: column;
                        text-align: center;
                        padding: 1rem;
                    }
                    
                    .user-avatar-wrapper {
                        margin-right: 0;
                        margin-bottom: 1rem;
                    }
                    
                    .name-row {
                        justify-content: center;
                    }
                    
                    .user-stats {
                        justify-content: center;
                    }
                    
                    .btn-follow {
                        margin-left: 0;
                        margin-top: 1rem;
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

const getLevelColor = (level) => {
    const colors = {
        1: "#9CA3AF",
        2: "#60A5FA",
        3: "#34D399",
        4: "#FBBF24",
        5: "#F472B6",
        6: "#8B5CF6"
    };
    return colors[level] || colors[1];
};

export default UserList;
