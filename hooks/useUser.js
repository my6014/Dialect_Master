/**
 * useUser Hook - 用户状态管理
 * 管理当前登录用户的信息，包括自动获取和刷新
 */
import { useState, useEffect, useCallback } from 'react';

// API 基础 URL
const API_BASE = 'http://127.0.0.1:8000';

// 等级名称映射
export const LEVEL_NAMES = {
    1: "方言新手",
    2: "方言学徒",
    3: "方言爱好者",
    4: "方言达人",
    5: "方言大师",
    6: "方言宗师"
};

// 等级颜色映射
export const LEVEL_COLORS = {
    1: "#9CA3AF",
    2: "#60A5FA",
    3: "#34D399",
    4: "#FBBF24",
    5: "#F472B6",
    6: "#8B5CF6"
};

/**
 * 用户状态 Hook
 * @returns {Object} 用户状态和操作方法
 */
export function useUser() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // 获取用户信息
    const fetchUser = useCallback(async () => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (!token || !userId) {
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/users/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.status === 401) {
                // Token 过期或无效
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                setUser(null);
                setIsAuthenticated(false);
                setError('登录已过期，请重新登录');
                return;
            }

            if (!res.ok) {
                throw new Error('获取用户信息失败');
            }

            const data = await res.json();
            setUser(data);
            setIsAuthenticated(true);
            setError(null);
        } catch (err) {
            console.error('获取用户信息失败:', err);
            setError(err.message);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }, []);

    // 初始加载
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // 登出
    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setUser(null);
        setIsAuthenticated(false);
        window.location.href = '/login';
    }, []);

    // 刷新用户信息
    const refreshUser = useCallback(() => {
        setLoading(true);
        fetchUser();
    }, [fetchUser]);

    // 获取头像完整 URL
    const getAvatarUrl = useCallback(() => {
        if (user?.avatar_url) {
            return `${API_BASE}${user.avatar_url}`;
        }
        return null;
    }, [user]);

    // 获取显示名称
    const getDisplayName = useCallback(() => {
        if (user?.nickname) {
            return user.nickname;
        }
        if (user?.username) {
            return user.username;
        }
        return '用户';
    }, [user]);

    // 获取用户首字母（用于默认头像）
    const getInitial = useCallback(() => {
        const name = getDisplayName();
        return name[0].toUpperCase();
    }, [getDisplayName]);

    // 获取等级名称
    const getLevelName = useCallback(() => {
        return LEVEL_NAMES[user?.level || 1];
    }, [user]);

    // 获取等级颜色
    const getLevelColor = useCallback(() => {
        return LEVEL_COLORS[user?.level || 1];
    }, [user]);

    return {
        user,
        loading,
        error,
        isAuthenticated,
        logout,
        refreshUser,
        getAvatarUrl,
        getDisplayName,
        getInitial,
        getLevelName,
        getLevelColor,
        API_BASE
    };
}

export default useUser;
