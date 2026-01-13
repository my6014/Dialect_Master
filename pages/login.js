import { useState } from 'react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    try {
      const res = await fetch('http://localhost:8001/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '请求失败');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(String(err));
    }
  };
  return (
    <div style={{ fontFamily: 'system-ui', padding: 24 }}>
      <h1>登录</h1>
      <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 300 }}>
        <input placeholder="用户名" value={username} onChange={e => setUsername(e.target.value)} />
        <input placeholder="密码" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">提交</button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {result && <pre style={{ marginTop: 8 }}>{JSON.stringify(result, null, 2)}</pre>}
      <div style={{ marginTop: 12 }}>
        <a href="/">返回首页</a>
      </div>
    </div>
  );
}
