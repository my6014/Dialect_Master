import { useState } from 'react';
import {
    LayoutDashboard,
    BarChart3,
    Settings,
    FileText,
    User,
    Zap,
    X,
    Mic
} from 'lucide-react';

export function Sidebar({ currentPage = 'dashboard', onPageChange }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleNavigationClick = (pageId) => {
        if (!isExpanded) {
            setIsExpanded(true);
            setTimeout(() => onPageChange && onPageChange(pageId), 150);
        } else {
            onPageChange && onPageChange(pageId);
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
            id: 'analytics',
            name: '学习分析',
            icon: BarChart3,
            description: '深度学习分析'
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
            id: 'reports',
            name: '学习报告',
            icon: FileText,
            description: '生成学习报告'
        },
        {
            id: 'settings',
            name: '个人设置',
            icon: User,
            description: '用户偏好设置'
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
                                            <div style={{ marginLeft: '0.75rem', overflow: 'hidden' }}>
                                                <div style={{
                                                    fontWeight: 500,
                                                    fontSize: '0.875rem',
                                                    whiteSpace: 'nowrap',
                                                    color: isActive ? 'var(--sidebar-primary-foreground)' : 'var(--sidebar-accent-foreground)'
                                                }}>
                                                    {item.name}
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
                <div style={{ padding: '1rem', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ position: 'relative' }} className="nav-item-group">
                        <div
                            style={{
                                width: '3rem',
                                height: '3rem',
                                background: 'linear-gradient(135deg, var(--sidebar-primary) 0%, rgba(123, 220, 147, 0.8) 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                            onClick={() => window.location.href = '/login'}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <span style={{
                                color: 'var(--sidebar-primary-foreground)',
                                fontWeight: 600,
                                fontSize: '1.125rem'
                            }}>方</span>
                        </div>

                        {/* Profile tooltip for collapsed state */}
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
                                <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>方言学习者</div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.75, marginTop: '0.25rem' }}>高级用户</div>
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

                        {/* Profile info for expanded state */}
                        {isExpanded && (
                            <div style={{
                                position: 'absolute',
                                bottom: '100%',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                marginBottom: '0.5rem',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    color: 'var(--sidebar-foreground)',
                                    fontWeight: 500,
                                    fontSize: '0.875rem',
                                    whiteSpace: 'nowrap'
                                }}>
                                    方言学习者
                                </div>
                                <div style={{
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    fontSize: '0.75rem',
                                    whiteSpace: 'nowrap'
                                }}>
                                    高级用户
                                </div>
                            </div>
                        )}
                    </div>
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
