import { useState, useRef } from 'react';
import Link from 'next/link';

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

            // 初始化 AudioContext
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
                    // 创建 blob
                    const audioBlob = new Blob(audioChunks.current, { type: mediaRecorder.current.mimeType });

                    // 转换为 ArrayBuffer
                    const arrayBuffer = await audioBlob.arrayBuffer();

                    // 解码音频数据
                    const audioBuffer = await audioContext.current.decodeAudioData(arrayBuffer);

                    // 转换为 WAV
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
        <div className="center" style={{ flexDirection: 'column', minHeight: '100vh', padding: '40px 20px' }}>
            <div className="card fade-in" style={{ maxWidth: 800, width: '100%', padding: '40px' }}>
                <div style={{ marginBottom: 24 }}>
                    <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                        ← 返回首页
                    </Link>
                </div>

                <h1 style={{ fontSize: '2rem', marginBottom: 24, textAlign: 'center' }}>SenseVoice ASR 测试</h1>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* 录音与上传控制区 */}
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                        {!recording ? (
                            <button onClick={startRecording} className="btn btn-primary" style={{ backgroundColor: '#ef4444' }}>
                                🎤 开始录音
                            </button>
                        ) : (
                            <button onClick={stopRecording} className="btn btn-primary" style={{ animation: 'pulse 1.5s infinite' }}>
                                🛑 停止录音
                            </button>
                        )}

                        <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => setFile(e.target.files[0])}
                            style={{ display: 'none' }}
                            id="audio-input"
                        />
                        <label htmlFor="audio-input" className="btn btn-outline" style={{ cursor: 'pointer' }}>
                            📁 选择文件
                        </label>

                        <button
                            onClick={handleUpload}
                            className="btn btn-primary"
                            disabled={!file || loading}
                            style={{ opacity: !file || loading ? 0.6 : 1 }}
                        >
                            {loading ? '🚀 正在识别...' : '📤 开始识别'}
                        </button>
                    </div>

                    {/* 当前选择状态 */}
                    {file && (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            已选择: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
                        </div>
                    )}

                    {/* 错误提示 */}
                    {error && (
                        <div style={{ padding: 16, borderRadius: 12, background: '#fee2e2', color: '#b91c1c', fontSize: '0.9rem' }}>
                            ❌ 错误: {error}
                        </div>
                    )}

                    {/* 结果显示区 */}
                    {result && (
                        <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 24 }}>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: 16 }}>识别结果:</h2>
                            {result.result?.map((item, index) => (
                                <div key={index} style={{ background: 'var(--bg-card)', padding: 20, borderRadius: 12, border: '1px solid var(--border)', marginBottom: 16 }}>
                                    <div style={{ fontSize: '1.2rem', marginBottom: 12, lineHeight: 1.6 }}>{item.text}</div>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {item.emotions?.map(e => (
                                            <span key={e} style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: 20, background: '#e0e7ff', color: '#4338ca' }}>
                                                😊 {e}
                                            </span>
                                        ))}
                                        {item.events?.map(ev => (
                                            <span key={ev} style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: 20, background: '#fef3c7', color: '#92400e' }}>
                                                🔔 {ev}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
        </div>
    );
}
