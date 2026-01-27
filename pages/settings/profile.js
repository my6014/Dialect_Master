import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Sidebar from '../../components/Sidebar';

// API 基础 URL
const API_BASE = 'http://127.0.0.1:8000';

// 方言选项
const DIALECT_OPTIONS = [
  '粤语', '四川话', '东北话', '上海话', '闽南语',
  '客家话', '湖南话', '河南话', '山东话', '陕西话',
  '温州话', '吴语', '赣语', '其他'
];

export default function EditProfile() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [formData, setFormData] = useState({
    nickname: '',
    bio: '',
    hometown: '',
    dialect: '',
    avatar_url: ''
  });

  // 验证登录状态
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchProfile(token);
  }, []);

  // 获取当前用户资料
  const fetchProfile = async (token) => {
    try {
      const res = await fetch(`${API_BASE}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        router.push('/login');
        return;
      }

      if (!res.ok) {
        setError('获取资料失败');
        return;
      }

      const data = await res.json();
      setFormData({
        nickname: data.nickname || '',
        bio: data.bio || '',
        hometown: data.hometown || '',
        dialect: data.dialect || '',
        avatar_url: data.avatar_url || ''
      });
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理表单变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  // 处理头像上传
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('请选择 JPG、PNG、WebP 或 GIF 格式的图片');
      return;
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过 5MB');
      return;
    }

    setAvatarUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const res = await fetch(`${API_BASE}/api/users/me/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataUpload
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || '上传失败');
      }

      const data = await res.json();
      setFormData(prev => ({
        ...prev,
        avatar_url: data.avatar_url
      }));
      setSuccess('头像上传成功！');
    } catch (err) {
      setError(err.message || '上传头像失败');
    } finally {
      setAvatarUploading(false);
    }
  };

  // 保存资料
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nickname: formData.nickname || null,
          bio: formData.bio || null,
          hometown: formData.hometown || null,
          dialect: formData.dialect || null
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || '保存失败');
      }

      setSuccess('资料保存成功！');

      // 2秒后跳转到个人主页
      setTimeout(() => {
        const userId = localStorage.getItem('userId');
        router.push(`/user/${userId}`);
      }, 1500);
    } catch (err) {
      setError(err.message || '保存资料失败');
    } finally {
      setSaving(false);
    }
  };

  const handlePageChange = (pageId) => {
    if (pageId === 'dashboard') {
      router.push('/dashboard');
    } else if (pageId === 'asr') {
      router.push('/asr_test');
    } else if (pageId === 'community') {
      router.push('/community');
    } else if (pageId === 'settings') {
      // Already on settings
    } else if (pageId === 'notifications') {
      router.push('/notifications');
    } else if (pageId === 'leaderboard') {
      router.push('/leaderboard');
    }
  };

  if (loading) {
    return (
      <div className="settings-container">
        <Sidebar currentPage="configuration" onPageChange={handlePageChange} />
        <div className="settings-content">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>加载中...</p>
          </div>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>编辑资料 - 方言宝</title>
        <meta name="description" content="编辑您的个人资料 - 方言宝社区" />
      </Head>

      <div className="settings-container">
        <Sidebar currentPage="configuration" onPageChange={handlePageChange} />

        <div className="settings-content">
          <div className="settings-header">
            <h1>编辑资料</h1>
            <p>完善您的个人信息，让更多人认识你</p>
          </div>

          <form onSubmit={handleSubmit} className="settings-form">
            {/* 头像 */}
            <div className="form-section">
              <label className="section-label">头像</label>
              <div className="avatar-upload" onClick={handleAvatarClick}>
                {formData.avatar_url ? (
                  <img
                    src={`${API_BASE}${formData.avatar_url}`}
                    alt="头像"
                    className="avatar-preview"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    <span>📷</span>
                    <p>点击上传</p>
                  </div>
                )}
                {avatarUploading && (
                  <div className="avatar-loading">
                    <div className="spinner-small"></div>
                  </div>
                )}
                <div className="avatar-overlay">
                  <span>更换头像</span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
              <p className="form-hint">支持 JPG、PNG、WebP、GIF 格式，最大 5MB</p>
            </div>

            {/* 昵称 */}
            <div className="form-group">
              <label htmlFor="nickname">昵称</label>
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                placeholder="给自己起个名字吧"
                maxLength={50}
              />
              <span className="char-count">{formData.nickname.length}/50</span>
            </div>

            {/* 个人简介 */}
            <div className="form-group">
              <label htmlFor="bio">个人简介</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="介绍一下自己..."
                rows={4}
                maxLength={500}
              />
              <span className="char-count">{formData.bio.length}/500</span>
            </div>

            {/* 家乡 */}
            <div className="form-group">
              <label htmlFor="hometown">家乡</label>
              <input
                type="text"
                id="hometown"
                name="hometown"
                value={formData.hometown}
                onChange={handleChange}
                placeholder="你来自哪里？"
                maxLength={100}
              />
            </div>

            {/* 母语方言 */}
            <div className="form-group">
              <label htmlFor="dialect">母语方言</label>
              <select
                id="dialect"
                name="dialect"
                value={formData.dialect}
                onChange={handleChange}
              >
                <option value="">选择你的母语方言</option>
                {DIALECT_OPTIONS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* 错误/成功消息 */}
            {error && <div className="message error">{error}</div>}
            {success && <div className="message success">{success}</div>}

            {/* 按钮 */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => router.back()}
              >
                取消
              </button>
              <button
                type="submit"
                className="btn-save"
                disabled={saving}
              >
                {saving ? '保存中...' : '保存资料'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{styles}</style>
    </>
  );
}

const styles = `
  .settings-container {
    display: flex;
    min-height: 100vh;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  }

  .settings-content {
    flex: 1;
    margin-left: 280px;
    padding: 2rem;
    max-width: 700px;
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

  .spinner-small {
    width: 24px;
    height: 24px;
    border: 2px solid #2c5f4e;
    border-top: 2px solid #7bdc93;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .settings-header {
    margin-bottom: 2rem;
  }

  .settings-header h1 {
    font-size: 2rem;
    color: #e2e8f0;
    margin: 0 0 0.5rem 0;
  }

  .settings-header p {
    color: #94a3b8;
    margin: 0;
  }

  .settings-form {
    background: rgba(44, 95, 78, 0.15);
    border-radius: 20px;
    border: 1px solid rgba(123, 220, 147, 0.2);
    padding: 2rem;
    backdrop-filter: blur(10px);
  }

  .form-section {
    margin-bottom: 2rem;
  }

  .section-label {
    display: block;
    color: #e2e8f0;
    font-weight: 600;
    margin-bottom: 0.75rem;
    font-size: 1rem;
  }

  .avatar-upload {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    background: rgba(44, 95, 78, 0.3);
    border: 3px dashed #2c5f4e;
    transition: all 0.3s ease;
  }

  .avatar-upload:hover {
    border-color: #7bdc93;
  }

  .avatar-upload:hover .avatar-overlay {
    opacity: 1;
  }

  .avatar-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #7bdc93;
  }

  .avatar-placeholder span {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .avatar-placeholder p {
    margin: 0;
    font-size: 0.875rem;
    color: #94a3b8;
  }

  .avatar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    color: white;
    font-size: 0.875rem;
  }

  .avatar-loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .form-hint {
    font-size: 0.75rem;
    color: #94a3b8;
    margin-top: 0.5rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
    position: relative;
  }

  .form-group label {
    display: block;
    color: #e2e8f0;
    font-weight: 500;
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
  }

  .form-group input,
  .form-group textarea,
  .form-group select {
    width: 100%;
    padding: 0.875rem 1rem;
    background: rgba(26, 26, 46, 0.7);
    border: 1px solid rgba(123, 220, 147, 0.2);
    border-radius: 10px;
    color: #e2e8f0;
    font-size: 1rem;
    transition: all 0.3s ease;
    box-sizing: border-box;
  }

  .form-group input:focus,
  .form-group textarea:focus,
  .form-group select:focus {
    outline: none;
    border-color: #7bdc93;
    box-shadow: 0 0 0 3px rgba(123, 220, 147, 0.1);
  }

  .form-group input::placeholder,
  .form-group textarea::placeholder {
    color: #64748b;
  }

  .form-group textarea {
    resize: vertical;
    min-height: 100px;
    font-family: inherit;
  }

  .form-group select {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    padding-right: 2.5rem;
  }

  .form-group select option {
    background: #1a1a2e;
    color: #e2e8f0;
  }

  .char-count {
    position: absolute;
    right: 0;
    top: 0;
    font-size: 0.75rem;
    color: #64748b;
  }

  .message {
    padding: 1rem;
    border-radius: 10px;
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
  }

  .message.error {
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #fca5a5;
  }

  .message.success {
    background: rgba(123, 220, 147, 0.15);
    border: 1px solid rgba(123, 220, 147, 0.3);
    color: #7bdc93;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(123, 220, 147, 0.1);
  }

  .btn-cancel,
  .btn-save {
    padding: 0.875rem 2rem;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
  }

  .btn-cancel {
    background: rgba(100, 116, 139, 0.2);
    color: #94a3b8;
    border: 1px solid rgba(100, 116, 139, 0.3);
  }

  .btn-cancel:hover {
    background: rgba(100, 116, 139, 0.3);
    color: #e2e8f0;
  }

  .btn-save {
    background: linear-gradient(135deg, #2c5f4e, #3d7a64);
    color: white;
  }

  .btn-save:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(123, 220, 147, 0.3);
  }

  .btn-save:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    .settings-content {
      margin-left: 0;
      padding: 1rem;
    }

    .settings-form {
      padding: 1.5rem;
    }

    .form-actions {
      flex-direction: column-reverse;
    }

    .btn-cancel,
    .btn-save {
      width: 100%;
    }
  }
`;
