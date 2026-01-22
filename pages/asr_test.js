import { useState, useRef } from 'react';
import Link from 'next/link';
import { Zap, Mic, Upload, Sparkles, ArrowLeft, Volume2 } from 'lucide-react';

export default function AsrTest() {
    const [file, setFile] = useState(null);
    const [recording, setRecording] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);
    const audioContext = useRef(null);

    // 将音频转换为 WAV 格式
    const audioBufferToWav = (audioBuffer) => {
        const numberOfChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const format = 1; // PCM
        const bitDepth = 16;

        const bytesPerSample = bitDepth / 8;
        const blockAlign = numberOfChannels * bytesPerSample;

        const data = [];
        for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
            data.push(audioBuffer.getChannelData(i));
        }

        const interleaved = new Float32Array(audioBuffer.length * numberOfChannels);
        for (let src = 0; src < audioBuffer.length; src++) {
            for (let channel = 0; channel < numberOfChannels; channel++) {
                interleaved[src * numberOfChannels + channel] = data[channel][src];
            }
        }

        const dataLength = interleaved.length * bytesPerSample;
        const buffer = new ArrayBuffer(44 + dataLength);
        const view = new DataView(buffer);

        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        // WAV 文件头
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + dataLength, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, format, true);
        view.setUint16(22, numberOfChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitDepth, true);
        writeString(36, 'data');
        view.setUint32(40, dataLength, true);

        // 写入 PCM 数据
        const volume = 1;
        let index = 44;
        for (let i = 0; i < interleaved.length; i++) {
            const sample = Math.max(-1, Math.min(1, interleaved[i]));
            view.setInt16(index, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            index += 2;
        }

        return new Blob([buffer], { type: 'audio/wav' });
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            if (!audioContext.current) {
                audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
            }

            mediaRecorder.current = new MediaRecorder(stream);
            audioChunks.current = [];

            mediaRecorder.current.ondataavailable = (event) => {
                audioChunks.current.push(event.data);
            };

            mediaRecorder.current.onstop = async () => {
                try {
                    const audioBlob = new Blob(audioChunks.current, { type: mediaRecorder.current.mimeType });
                    const arrayBuffer = await audioBlob.arrayBuffer();
                    const audioBuffer = await audioContext.current.decodeAudioData(arrayBuffer);
                    const wavBlob = audioBufferToWav(audioBuffer);
                    const audioFile = new File([wavBlob], 'recording.wav', { type: 'audio/wav' });

                    setFile(audioFile);
                    setError(null);
                } catch (err) {
                    setError('音频转换失败: ' + err.message);
                    console.error('Error converting audio:', err);
                }
            };

            mediaRecorder.current.start();
            setRecording(true);
            setError(null);
        } catch (err) {
            setError('无法访问麦克风: ' + err.message);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && recording) {
            mediaRecorder.current.stop();
            setRecording(false);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        if (!(file.type || '').startsWith('audio/')) {
            setError('请上传音频文件');
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            setError('文件过大，最大支持20MB');
            return;
        }
        setLoading(true);
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('lang', 'auto');

        try {
            const response = await fetch('http://localhost:8000/sensevoice', {
                method: 'POST',
                body: formData,
            });

            let data;
            try {
                data = await response.json();
            } catch (e) {
                setError('后端返回的不是有效JSON');
                return;
            }
            if (response.ok) {
                setResult(data);
            } else {
                const msg = data.error || data.message || '上传失败';
                setError(msg);
            }
        } catch (err) {
            setError('网络请求失败: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #2c5f4e 0%, #3a6b5a 100%)',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Decoration */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                right: '-5%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(123, 220, 147, 0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                pointerEvents: 'none'
            }} />

            <div className="fade-in" style={{
                maxWidth: '900px',
                margin: '0 auto',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Header */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '2rem'
                }}>
                    <div style={{
                        width: '4rem',
                        height: '4rem',
                        background: 'linear-gradient(135deg, #7bdc93 0%, rgba(123, 220, 147, 0.8) 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
                    }}>
                        <Volume2 size={32} color="#2c5f4e" />
                    </div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: 700,
                        color: 'white',
                        marginBottom: '0.5rem'
                    }}>
                        方言语音识别
                    </h1>
                    <p style={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '0.95rem'
                    }}>
                        SenseVoice ASR 测试
                    </p>
                </div>

                {/* Main Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '1.5rem',
                    padding: '2rem 2.5rem',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    marginBottom: '2rem'
                }}>
                    {/* Back Link */}
                    <Link href="/" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#2c5f4e',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        marginBottom: '1.5rem',
                        fontWeight: 500
                    }}>
                        <ArrowLeft size={16} />
                        返回首页
                    </Link>

                    {/* Control Buttons */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '1rem',
                        marginBottom: '1.5rem'
                    }}>
                        {/* Record Button */}
                        {!recording ? (
                            <button
                                onClick={startRecording}
                                style={{
                                    padding: '0.875rem',
                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            >
                                <Mic size={18} />
                                开始录音
                            </button>
                        ) : (
                            <button
                                onClick={stopRecording}
                                className="recording-pulse"
                                style={{
                                    padding: '0.875rem',
                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                ⏹️ 停止录音
                            </button>
                        )}

                        {/* Upload Button */}
                        <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => setFile(e.target.files[0])}
                            style={{ display: 'none' }}
                            id="audio-input"
                        />
                        <label
                            htmlFor="audio-input"
                            style={{
                                padding: '0.875rem',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.75rem',
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            <Upload size={18} />
                            选择文件
                        </label>

                        {/* Submit Button */}
                        <button
                            onClick={handleUpload}
                            disabled={!file || loading}
                            style={{
                                padding: '0.875rem',
                                background: !file || loading
                                    ? '#94a3b8'
                                    : 'linear-gradient(135deg, #7bdc93 0%, rgba(123, 220, 147, 0.8) 100%)',
                                color: !file || loading ? '#e2e8f0' : '#2c5f4e',
                                border: 'none',
                                borderRadius: '0.75rem',
                                fontSize: '0.95rem',
                                fontWeight: 700,
                                cursor: !file || loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                            onMouseEnter={(e) => {
                                if (file && !loading) {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 16px rgba(123, 220, 147, 0.4)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            <Sparkles size={18} />
                            {loading ? '识别中...' : '开始识别'}
                        </button>
                    </div>

                    {/* File Info */}
                    {file && (
                        <div style={{
                            textAlign: 'center',
                            padding: '0.75rem',
                            background: '#f1f5f9',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            color: '#64748b',
                            marginBottom: '1.5rem'
                        }}>
                            已选择: <strong style={{ color: '#2c5f4e' }}>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div style={{
                            padding: '0.875rem',
                            background: '#fee2e2',
                            color: '#b91c1c',
                            borderRadius: '0.75rem',
                            fontSize: '0.875rem',
                            border: '1px solid #fecaca',
                            marginBottom: '1.5rem'
                        }}>
                            ❌ {error}
                        </div>
                    )}

                    {/* Results */}
                    {result && (
                        <div style={{
                            marginTop: '1.5rem',
                            paddingTop: '1.5rem',
                            borderTop: '2px solid #e2e8f0'
                        }}>
                            <h2 style={{
                                fontSize: '1.25rem',
                                fontWeight: 600,
                                color: '#2c5f4e',
                                marginBottom: '1rem'
                            }}>
                                识别结果
                            </h2>
                            {result.result?.map((item, index) => (
                                <div key={index} style={{
                                    background: 'linear-gradient(135deg, #f8faf9 0%, #ffffff 100%)',
                                    padding: '1.25rem',
                                    borderRadius: '0.75rem',
                                    border: '2px solid #e2e8f0',
                                    marginBottom: '1rem'
                                }}>
                                    <div style={{
                                        fontSize: '1.1rem',
                                        lineHeight: 1.6,
                                        color: '#1e293b',
                                        marginBottom: '0.75rem'
                                    }}>
                                        {item.text}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {item.emotions?.map(e => (
                                            <span key={e} style={{
                                                fontSize: '0.75rem',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '999px',
                                                background: '#dcfce7',
                                                color: '#15803d',
                                                fontWeight: 500
                                            }}>
                                                😊 {e}
                                            </span>
                                        ))}
                                        {item.events?.map(ev => (
                                            <span key={ev} style={{
                                                fontSize: '0.75rem',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '999px',
                                                background: '#fef3c7',
                                                color: '#92400e',
                                                fontWeight: 500
                                            }}>
                                                🔔 {ev}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    textAlign: 'center',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '0.85rem'
                }}>
                    © 2026 方言宝 · 传承文化，学习方言
                </div>
            </div>

            <style jsx>{`
                @keyframes recording-pulse {
                    0%, 100% {
                        transform: scale(1);
                        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
                    }
                    50% {
                        transform: scale(1.05);
                        box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
                    }
                }
                .recording-pulse {
                    animation: recording-pulse 1.5s infinite;
                }
            `}</style>
        </div>
    );
}
