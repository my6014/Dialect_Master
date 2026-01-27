import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
    LayoutDashboard,
    BarChart3,
    Settings,
    FileText,
    User,
    Zap,
    X,
    Mic,
    Users,
    LogOut,
    ChevronRight,
    Bell
} from 'lucide-react';
import { useUser, LEVEL_COLORS } from '../hooks/useUser';

export function Sidebar({ currentPage = 'dashboard', onPageChange }) {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // 使用用户 Hook
    const {
        user,
        loading: userLoading,
        isAuthenticated,
        logout,
        getAvatarUrl,
        getDisplayName,
        getInitial,
        getLevelName,
        getLevelColor,
        unreadCount,
        API_BASE
    } = useUser();

    const handleNavigationClick = (pageId) => {
        if (!isExpanded) {
            setIsExpanded(true);
            setTimeout(() => onPageChange && onPageChange(pageId), 150);
        } else {
            onPageChange && onPageChange(pageId);
        }
    };

    // 导航到个人主页
    const handleProfileClick = () => {
        if (isAuthenticated && user) {
            router.push(`/user/${user.id}`);
        } else {
            router.push('/login');
        }
    };

    // 导航到设置页面
    const handleSettingsClick = () => {
        if (isAuthenticated) {
            router.push('/settings/profile');
        } else {
            router.push('/login');
        }
    };

    const navigationItems = [
        {
            id: 'dashboard',
            name: '数据面板',
            icon: LayoutDashboard,
            description: '学习概览与监控'
        },
        {
            id: 'community',
            name: '社区',
            icon: Users,
            description: '方言爱好者社区',
            badge: '新'
        },
        {
            id: 'analytics',
            name: '学习分析',
            icon: BarChart3,
            description: '深度学习分析'
        },
        {
            id: 'notifications',
            name: '消息中心',
            icon: Bell,
            description: '查看您的通知',
            badge: unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount.toString()) : null,
            badgeColor: '#ef4444'
        },
        {
            id: 'asr',
            name: '语音识别',
            icon: Mic,
            description: '方言语音识别测试'
        },
        {
            id: 'configuration',
            name: '方言配置',
            icon: Settings,
            description: '系统设置'
        },
        {
            id: 'leaderboard',
            name: '排行榜',
            icon: BarChart3,
            description: '积分排行与签到',
            badge: 'New',
            badgeColor: '#F59E0B'
        },
        {
            id: 'reports',
            name: '学习报告',
            icon: FileText,
            description: '生成学习报告'
        }
    ];

    return (
        <div style={{ margin: '1.5rem' }}>
            <div
                className={`sidebar ${isExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: 'calc(100vh - 3rem)',
                    position: 'relative'
                }}
            >
                {/* Header with Logo */}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                    {/* Close button when expanded */}
                    {isExpanded && (
                        <button
                            onClick={() => setIsExpanded(false)}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                width: '2rem',
                                height: '2rem',
                                background: 'var(--sidebar-accent)',
                                border: 'none',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                opacity: 0.8
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = '1';
                                e.currentTarget.style.transform = 'scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '0.8';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            <X size={16} color="var(--sidebar-foreground)" />
                        </button>
                    )}

                    <div style={{
                        width: '3rem',
                        height: '3rem',
                        background: 'linear-gradient(135deg, var(--sidebar-primary) 0%, rgba(123, 220, 147, 0.8) 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                    }}>
                        <Zap size={24} color="var(--sidebar-primary-foreground)" />
                    </div>
                    {isExpanded && (
                        <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                            <h2 style={{
                                color: 'var(--sidebar-foreground)',
                                fontWeight: 600,
                                fontSize: '1rem',
                                whiteSpace: 'nowrap',
                                margin: 0
                            }}>
                                方言宝
                            </h2>
                            <p style={{
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontSize: '0.75rem',
                                whiteSpace: 'nowrap',
                                marginTop: '0.25rem'
                            }}>
                                方言学习平台
                            </p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '0 1rem 1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {navigationItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = currentPage === item.id;

                            return (
                                <div key={item.id} style={{ position: 'relative' }} className="nav-item-group">
                                    <button
                                        onClick={() => handleNavigationClick(item.id)}
                                        style={{
                                            transition: 'all 0.3s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            border: 'none',
                                            cursor: 'pointer',
                                            ...(isExpanded
                                                ? { width: '100%', padding: '0.75rem 1rem', justifyContent: 'flex-start', borderRadius: '0.75rem' }
                                                : { width: '3rem', height: '3rem', justifyContent: 'center', margin: '0 auto', borderRadius: '50%' }
                                            ),
                                            ...(isActive
                                                ? {
                                                    background: 'linear-gradient(135deg, var(--sidebar-primary) 0%, rgba(123, 220, 147, 0.8) 100%)',
                                                    boxShadow: '0 4px 12px rgba(123, 220, 147, 0.3)',
                                                    transform: 'scale(1.05)'
                                                }
                                                : {
                                                    background: 'linear-gradient(135deg, var(--sidebar-accent) 0%, rgba(58, 107, 90, 0.8) 100%)'
                                                }
                                            )
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(123, 220, 147, 0.8) 0%, rgba(123, 220, 147, 0.6) 100%)';
                                            }
                                            e.currentTarget.style.transform = 'scale(1.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.background = 'linear-gradient(135deg, var(--sidebar-accent) 0%, rgba(58, 107, 90, 0.8) 100%)';
                                            }
                                            e.currentTarget.style.transform = isActive ? 'scale(1.05)' : 'scale(1)';
                                        }}
                                    >
                                        <Icon
                                            size={20}
                                            color={isActive ? 'var(--sidebar-primary-foreground)' : 'var(--sidebar-accent-foreground)'}
                                            style={{ flexShrink: 0 }}
                                        />

                                        {isExpanded && (
                                            <div style={{ marginLeft: '0.75rem', overflow: 'hidden', flex: 1 }}>
                                                <div style={{
                                                    fontWeight: 500,
                                                    fontSize: '0.875rem',
                                                    whiteSpace: 'nowrap',
                                                    color: isActive ? 'var(--sidebar-primary-foreground)' : 'var(--sidebar-accent-foreground)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}>
                                                    {item.name}
                                                    {item.badge && (
                                                        <span style={{
                                                            background: item.badgeColor || 'linear-gradient(135deg, #f97316, #ea580c)',
                                                            color: 'white',
                                                            fontSize: '0.6rem',
                                                            fontWeight: 'bold',
                                                            padding: '2px 6px',
                                                            borderRadius: item.badgeColor ? '999px' : '4px',
                                                            animation: item.badgeColor ? 'none' : 'pulse 2s infinite'
                                                        }}>
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </div>
                                                {isActive && (
                                                    <div style={{
                                                        fontSize: '0.75rem',
                                                        color: 'rgba(44, 95, 78, 0.7)',
                                                        marginTop: '0.125rem',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {item.description}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Active indicator */}
                                        {isActive && !isExpanded && (
                                            <>
                                                <div style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    borderRadius: '50%',
                                                    background: 'var(--sidebar-primary)',
                                                    opacity: 0.2
                                                }} className="animate-pulse" />
                                                <div style={{
                                                    position: 'absolute',
                                                    right: '-0.5rem',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    width: '0.25rem',
                                                    height: '1.5rem',
                                                    background: 'var(--sidebar-primary)',
                                                    borderRadius: '0.25rem 0 0 0.25rem'
                                                }} />
                                            </>
                                        )}

                                        {/* Active indicator for expanded state */}
                                        {isActive && isExpanded && (
                                            <div style={{
                                                position: 'absolute',
                                                right: '0.5rem',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                width: '0.5rem',
                                                height: '0.5rem',
                                                background: 'var(--sidebar-primary-foreground)',
                                                borderRadius: '50%'
                                            }} className="animate-pulse" />
                                        )}
                                    </button>

                                    {/* Tooltip for collapsed state */}
                                    {!isExpanded && (
                                        <div
                                            className="nav-tooltip"
                                            style={{
                                                position: 'absolute',
                                                left: 'calc(100% + 1rem)',
                                                top: '50%',
                                                transform: 'translateY(-50%) translateX(0.5rem)',
                                                padding: '0.75rem',
                                                background: 'linear-gradient(135deg, var(--sidebar-primary) 0%, rgba(123, 220, 147, 0.9) 100%)',
                                                color: 'var(--sidebar-primary-foreground)',
                                                borderRadius: '0.75rem',
                                                opacity: 0,
                                                pointerEvents: 'none',
                                                whiteSpace: 'nowrap',
                                                zIndex: 50,
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{item.name}</div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.75, marginTop: '0.25rem' }}>{item.description}</div>
                                            {/* Tooltip arrow */}
                                            <div style={{
                                                position: 'absolute',
                                                left: 0,
                                                top: '50%',
                                                transform: 'translateY(-50%) translateX(-0.25rem) rotate(45deg)',
                                                width: '0.5rem',
                                                height: '0.5rem',
                                                background: 'var(--sidebar-primary)'
                                            }} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </nav>

                {/* User Profile Section */}
                <div style={{ padding: '1rem', borderTop: '1px solid rgba(123, 220, 147, 0.1)' }}>
                    {userLoading ? (
                        // 加载状态
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <div style={{
                                width: '3rem',
                                height: '3rem',
                                background: 'linear-gradient(135deg, var(--sidebar-accent) 0%, rgba(58, 107, 90, 0.8) 100%)',
                                borderRadius: '50%',
                                animation: 'pulse 2s infinite'
                            }} />
                        </div>
                    ) : isAuthenticated && user ? (
                        // 已登录用户
                        <div style={{ position: 'relative' }} className="nav-item-group">
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: isExpanded ? '0.75rem' : '0',
                                    justifyContent: isExpanded ? 'flex-start' : 'center',
                                    cursor: 'pointer',
                                    padding: isExpanded ? '0.5rem' : '0',
                                    borderRadius: '0.75rem',
                                    transition: 'all 0.3s'
                                }}
                                onClick={handleProfileClick}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(123, 220, 147, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                {/* 头像 */}
                                <div style={{ position: 'relative', flexShrink: 0 }}>
                                    {getAvatarUrl() ? (
                                        <img
                                            src={getAvatarUrl()}
                                            alt={getDisplayName()}
                                            style={{
                                                width: '3rem',
                                                height: '3rem',
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: '2px solid var(--sidebar-primary)',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '3rem',
                                            height: '3rem',
                                            background: 'linear-gradient(135deg, var(--sidebar-primary) 0%, rgba(123, 220, 147, 0.8) 100%)',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                            border: '2px solid var(--sidebar-primary)'
                                        }}>
                                            <span style={{
                                                color: 'var(--sidebar-primary-foreground)',
                                                fontWeight: 600,
                                                fontSize: '1.125rem'
                                            }}>{getInitial()}</span>
                                        </div>
                                    )}
                                    {/* 等级徽章 */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '-2px',
                                        right: '-2px',
                                        background: getLevelColor(),
                                        color: 'white',
                                        fontSize: '0.6rem',
                                        fontWeight: 'bold',
                                        padding: '2px 4px',
                                        borderRadius: '4px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                    }}>
                                        Lv{user.level || 1}
                                    </div>
                                </div>

                                {/* 用户信息（展开时显示） */}
                                {isExpanded && (
                                    <div style={{ overflow: 'hidden', flex: 1 }}>
                                        <div style={{
                                            color: 'var(--sidebar-foreground)',
                                            fontWeight: 600,
                                            fontSize: '0.875rem',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {getDisplayName()}
                                        </div>
                                        <div style={{
                                            color: 'rgba(255, 255, 255, 0.6)',
                                            fontSize: '0.7rem',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {getLevelName()} · {user.points || 0}积分
                                        </div>
                                    </div>
                                )}

                                {/* 展开时的箭头 */}
                                {isExpanded && (
                                    <ChevronRight size={16} color="rgba(255,255,255,0.5)" />
                                )}
                            </div>

                            {/* 展开时显示操作按钮 */}
                            {isExpanded && (
                                <div style={{
                                    display: 'flex',
                                    gap: '0.5rem',
                                    marginTop: '0.75rem'
                                }}>
                                    <button
                                        onClick={handleSettingsClick}
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem',
                                            background: 'rgba(123, 220, 147, 0.1)',
                                            border: '1px solid rgba(123, 220, 147, 0.2)',
                                            borderRadius: '0.5rem',
                                            color: 'var(--sidebar-foreground)',
                                            fontSize: '0.75rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.25rem',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(123, 220, 147, 0.2)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(123, 220, 147, 0.1)';
                                        }}
                                    >
                                        <Settings size={12} />
                                        设置
                                    </button>
                                    <button
                                        onClick={logout}
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem',
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            border: '1px solid rgba(239, 68, 68, 0.2)',
                                            borderRadius: '0.5rem',
                                            color: '#fca5a5',
                                            fontSize: '0.75rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.25rem',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                        }}
                                    >
                                        <LogOut size={12} />
                                        登出
                                    </button>
                                </div>
                            )}

                            {/* 折叠时的 Tooltip */}
                            {!isExpanded && (
                                <div
                                    className="nav-tooltip"
                                    style={{
                                        position: 'absolute',
                                        left: 'calc(100% + 1rem)',
                                        top: '50%',
                                        transform: 'translateY(-50%) translateX(0.5rem)',
                                        padding: '0.75rem',
                                        background: 'linear-gradient(135deg, var(--sidebar-primary) 0%, rgba(123, 220, 147, 0.9) 100%)',
                                        color: 'var(--sidebar-primary-foreground)',
                                        borderRadius: '0.75rem',
                                        opacity: 0,
                                        pointerEvents: 'none',
                                        whiteSpace: 'nowrap',
                                        zIndex: 50,
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{getDisplayName()}</div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.75, marginTop: '0.25rem' }}>
                                        {getLevelName()} · 点击查看主页
                                    </div>
                                    <div style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: '50%',
                                        transform: 'translateY(-50%) translateX(-0.25rem) rotate(45deg)',
                                        width: '0.5rem',
                                        height: '0.5rem',
                                        background: 'var(--sidebar-primary)'
                                    }} />
                                </div>
                            )}
                        </div>
                    ) : (
                        // 未登录用户
                        <div style={{ position: 'relative' }} className="nav-item-group">
                            <button
                                onClick={() => router.push('/login')}
                                style={{
                                    width: isExpanded ? '100%' : '3rem',
                                    height: '3rem',
                                    background: 'linear-gradient(135deg, var(--sidebar-primary) 0%, rgba(123, 220, 147, 0.8) 100%)',
                                    borderRadius: isExpanded ? '0.75rem' : '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: isExpanded ? '0.5rem' : '0',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                    cursor: 'pointer',
                                    border: 'none',
                                    transition: 'all 0.3s',
                                    margin: isExpanded ? '0' : '0 auto'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <User size={isExpanded ? 16 : 20} color="var(--sidebar-primary-foreground)" />
                                {isExpanded && (
                                    <span style={{
                                        color: 'var(--sidebar-primary-foreground)',
                                        fontWeight: 600,
                                        fontSize: '0.875rem'
                                    }}>登录 / 注册</span>
                                )}
                            </button>

                            {/* 未登录 Tooltip */}
                            {!isExpanded && (
                                <div
                                    className="nav-tooltip"
                                    style={{
                                        position: 'absolute',
                                        left: 'calc(100% + 1rem)',
                                        top: '50%',
                                        transform: 'translateY(-50%) translateX(0.5rem)',
                                        padding: '0.75rem',
                                        background: 'linear-gradient(135deg, var(--sidebar-primary) 0%, rgba(123, 220, 147, 0.9) 100%)',
                                        color: 'var(--sidebar-primary-foreground)',
                                        borderRadius: '0.75rem',
                                        opacity: 0,
                                        pointerEvents: 'none',
                                        whiteSpace: 'nowrap',
                                        zIndex: 50,
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>登录 / 注册</div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.75, marginTop: '0.25rem' }}>点击登录账号</div>
                                    <div style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: '50%',
                                        transform: 'translateY(-50%) translateX(-0.25rem) rotate(45deg)',
                                        width: '0.5rem',
                                        height: '0.5rem',
                                        background: 'var(--sidebar-primary)'
                                    }} />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <style jsx>{`
          .nav-item-group:hover .nav-tooltip {
            opacity: 1 !important;
            transform: translateY(-50%) translateX(0) !important;
          }
        `}</style>
            </div>
        </div>
    );
}

// 默认导出
export default Sidebar;

