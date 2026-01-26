/**
 * 发布帖子页面
 * 支持文字内容和方言录音上传
 */
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Sidebar from '../../components/Sidebar';
import { useUser } from '../../hooks/useUser';

const API_BASE = 'http://127.0.0.1:8000';

// 方言标签列表
const DIALECT_TAGS = [
    '粤语', '四川话', '东北话', '上海话', '闽南语',
    '客家话', '湖南话', '河南话', '山东话', '陕西话',
    '温州话', '武汉话', '南京话', '苏州话', '杭州话',
    '天津话', '山西话', '江西话', '福州话', '潮汕话',
    '其他'
];

export default function CreatePost() {
    const router = useRouter();
    const { user, isAuthenticated, loading } = useUser();
    const [content, setContent] = useState('');
    const [dialectTag, setDialectTag] = useState('');
    const [audioFile, setAudioFile] = useState(null);
    const [audioUrl, setAudioUrl] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const audioInputRef = useRef(null);

    // 用户未登录重定向
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

    // 开始录音
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const file = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
                setAudioFile(file);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            setError('无法访问麦克风，请检查权限设置');
        }
    };

    // 停止录音
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
        }
    };

    // 选择音频文件
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                setError('文件大小不能超过 10MB');
                return;
            }
            setAudioFile(file);
        }
    };

    // 清除音频
    const clearAudio = () => {
        setAudioFile(null);
        setAudioUrl('');
        if (audioInputRef.current) {
            audioInputRef.current.value = '';
        }
    };

    // 上传音频
    const uploadAudio = async () => {
        if (!audioFile) return null;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', audioFile);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/posts/upload-audio`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || '上传失败');
            }

            const data = await res.json();
            setAudioUrl(data.audio_url);
            return data.audio_url;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    // 提交帖子
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!content.trim()) {
            setError('请输入帖子内容');
            return;
        }

        if (content.length > 2000) {
            setError('帖子内容不能超过 2000 字');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            // 如果有音频文件，先上传
            let finalAudioUrl = audioUrl;
            if (audioFile && !audioUrl) {
                finalAudioUrl = await uploadAudio();
            }

            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: content.trim(),
                    dialect_tag: dialectTag || null,
                    audio_url: finalAudioUrl || null
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || '发布失败');
            }

            // 发布成功，跳转到社区页面
            router.push('/community');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 格式化时间
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>发布动态 - 方言宝</title>
                <meta name="description" content="分享你的方言故事和录音" />
            </Head>

            <div className="create-container">
                <Sidebar currentPage="community" onPageChange={(id) => {
                    if (id === 'dashboard') router.push('/dashboard');
                    else if (id === 'asr') router.push('/asr_test');
                    else if (id === 'community') router.push('/community');
                    else if (id === 'settings') router.push('/settings/profile');
                }} />

                <div className="create-content">
                    <div className="page-header">
                        <button className="back-btn" onClick={() => router.back()}>
                            ← 返回
                        </button>
                        <h1>📝 发布动态</h1>
                    </div>

                    <form className="create-form" onSubmit={handleSubmit}>
                        {error && (
                            <div className="error-message">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* 内容输入 */}
                        <div className="form-group">
                            <label>内容</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="分享你的方言故事、心得体会..."
                                maxLength={2000}
                                rows={6}
                            />
                            <div className="char-count">
                                <span className={content.length > 1800 ? 'warning' : ''}>
                                    {content.length}
                                </span> / 2000
                            </div>
                        </div>

                        {/* 方言标签选择 */}
                        <div className="form-group">
                            <label>方言标签 <span className="optional">(可选)</span></label>
                            <div className="dialect-tags">
                                {DIALECT_TAGS.map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        className={`tag-btn ${dialectTag === tag ? 'selected' : ''}`}
                                        onClick={() => setDialectTag(dialectTag === tag ? '' : tag)}
                                    >
                                        #{tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 音频上传/录制 */}
                        <div className="form-group">
                            <label>方言录音 <span className="optional">(可选)</span></label>

                            {!audioFile ? (
                                <div className="audio-options">
                                    {/* 录音按钮 */}
                                    <button
                                        type="button"
                                        className={`record-btn ${isRecording ? 'recording' : ''}`}
                                        onClick={isRecording ? stopRecording : startRecording}
                                    >
                                        {isRecording ? (
                                            <>
                                                <span className="record-indicator"></span>
                                                停止录音 ({formatTime(recordingTime)})
                                            </>
                                        ) : (
                                            <>
                                                🎤 开始录音
                                            </>
                                        )}
                                    </button>

                                    <span className="or-divider">或</span>

                                    {/* 文件上传 */}
                                    <label className="upload-btn">
                                        📁 上传音频文件
                                        <input
                                            ref={audioInputRef}
                                            type="file"
                                            accept=".mp3,.wav,.webm,.m4a,.ogg"
                                            onChange={handleFileSelect}
                                            hidden
                                        />
                                    </label>
                                </div>
                            ) : (
                                <div className="audio-preview">
                                    <div className="audio-info">
                                        <span className="audio-icon">🎵</span>
                                        <span className="audio-name">{audioFile.name}</span>
                                        <span className="audio-size">
                                            ({(audioFile.size / 1024).toFixed(1)} KB)
                                        </span>
                                    </div>
                                    <button type="button" className="remove-audio" onClick={clearAudio}>
                                        ✕ 移除
                                    </button>
                                </div>
                            )}

                            <p className="audio-hint">
                                支持格式：MP3, WAV, WebM, M4A, OGG（最大 10MB）
                            </p>
                        </div>

                        {/* 提交按钮 */}
                        <div className="form-actions">
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => router.back()}
                            >
                                取消
                            </button>
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={isSubmitting || isUploading || !content.trim()}
                            >
                                {isUploading ? '上传中...' : isSubmitting ? '发布中...' : '发布动态'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style jsx>{`
                .loading-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                }

                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(123, 220, 147, 0.2);
                    border-top-color: #7bdc93;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .create-container {
                    display: flex;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                }

                .create-content {
                    flex: 1;
                    margin-left: 100px;
                    padding: 2rem;
                    max-width: 800px;
                }

                .page-header {
                    margin-bottom: 2rem;
                }

                .back-btn {
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    font-size: 0.9rem;
                    cursor: pointer;
                    padding: 0.5rem 0;
                    margin-bottom: 0.5rem;
                    transition: color 0.2s;
                }

                .back-btn:hover {
                    color: #7bdc93;
                }

                .page-header h1 {
                    font-size: 1.75rem;
                    color: #e2e8f0;
                    margin: 0;
                }

                .create-form {
                    background: rgba(44, 95, 78, 0.15);
                    border-radius: 20px;
                    border: 1px solid rgba(123, 220, 147, 0.15);
                    padding: 2rem;
                }

                .error-message {
                    background: rgba(239, 68, 68, 0.15);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    color: #ef4444;
                    padding: 0.875rem 1rem;
                    border-radius: 10px;
                    margin-bottom: 1.5rem;
                    font-size: 0.9rem;
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                .form-group label {
                    display: block;
                    color: #e2e8f0;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    font-size: 0.95rem;
                }

                .optional {
                    color: #64748b;
                    font-weight: 400;
                    font-size: 0.85rem;
                }

                textarea {
                    width: 100%;
                    padding: 1rem;
                    background: rgba(26, 26, 46, 0.5);
                    border: 1px solid rgba(123, 220, 147, 0.2);
                    border-radius: 12px;
                    color: #e2e8f0;
                    font-size: 1rem;
                    line-height: 1.6;
                    resize: vertical;
                    transition: border-color 0.2s;
                }

                textarea:focus {
                    outline: none;
                    border-color: #7bdc93;
                }

                textarea::placeholder {
                    color: #64748b;
                }

                .char-count {
                    text-align: right;
                    color: #64748b;
                    font-size: 0.8rem;
                    margin-top: 0.5rem;
                }

                .char-count .warning {
                    color: #f59e0b;
                }

                .dialect-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .tag-btn {
                    padding: 0.5rem 1rem;
                    background: rgba(26, 26, 46, 0.5);
                    border: 1px solid rgba(123, 220, 147, 0.2);
                    border-radius: 20px;
                    color: #94a3b8;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .tag-btn:hover {
                    border-color: rgba(123, 220, 147, 0.4);
                    color: #e2e8f0;
                }

                .tag-btn.selected {
                    background: rgba(123, 220, 147, 0.2);
                    border-color: #7bdc93;
                    color: #7bdc93;
                }

                .audio-options {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .record-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.875rem 1.5rem;
                    background: linear-gradient(135deg, #2c5f4e, #3d7a64);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .record-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(123, 220, 147, 0.3);
                }

                .record-btn.recording {
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                }

                .record-indicator {
                    width: 10px;
                    height: 10px;
                    background: white;
                    border-radius: 50%;
                    animation: pulse 1s infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                .or-divider {
                    color: #64748b;
                    font-size: 0.9rem;
                }

                .upload-btn {
                    display: inline-block;
                    padding: 0.875rem 1.5rem;
                    background: rgba(26, 26, 46, 0.5);
                    border: 1px dashed rgba(123, 220, 147, 0.3);
                    border-radius: 12px;
                    color: #94a3b8;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .upload-btn:hover {
                    border-color: #7bdc93;
                    color: #e2e8f0;
                }

                .audio-preview {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem;
                    background: rgba(26, 26, 46, 0.5);
                    border: 1px solid rgba(123, 220, 147, 0.2);
                    border-radius: 12px;
                }

                .audio-info {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .audio-icon {
                    font-size: 1.5rem;
                }

                .audio-name {
                    color: #e2e8f0;
                    font-weight: 500;
                }

                .audio-size {
                    color: #64748b;
                    font-size: 0.85rem;
                }

                .remove-audio {
                    background: rgba(239, 68, 68, 0.15);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    color: #ef4444;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.85rem;
                    transition: all 0.2s;
                }

                .remove-audio:hover {
                    background: rgba(239, 68, 68, 0.25);
                }

                .audio-hint {
                    color: #64748b;
                    font-size: 0.8rem;
                    margin-top: 0.75rem;
                    margin-bottom: 0;
                }

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    margin-top: 2rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid rgba(123, 220, 147, 0.1);
                }

                .cancel-btn {
                    padding: 0.875rem 1.5rem;
                    background: transparent;
                    border: 1px solid rgba(123, 220, 147, 0.3);
                    border-radius: 10px;
                    color: #94a3b8;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .cancel-btn:hover {
                    border-color: #7bdc93;
                    color: #e2e8f0;
                }

                .submit-btn {
                    padding: 0.875rem 2rem;
                    background: linear-gradient(135deg, #2c5f4e, #3d7a64);
                    border: none;
                    border-radius: 10px;
                    color: white;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(123, 220, 147, 0.3);
                }

                .submit-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .create-content {
                        margin-left: 0;
                        padding: 1rem;
                    }

                    .create-form {
                        padding: 1.5rem;
                    }

                    .audio-options {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .or-divider {
                        text-align: center;
                    }

                    .form-actions {
                        flex-direction: column-reverse;
                    }

                    .cancel-btn,
                    .submit-btn {
                        width: 100%;
                    }
                }
            `}</style>
        </>
    );
}
