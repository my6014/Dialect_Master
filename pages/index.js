import { useEffect, useState } from 'react';

export default function Home() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8001/hello.php')
      .then(r => r.json())
      .then(setData)
      .catch(setError);
  }, []);

  return (
    <div style={{ fontFamily: 'system-ui', padding: 24 }}>
      <h1>方言宝原型</h1>
      <p>前端: Next.js，后端: PHP</p>
      <div style={{ margin: '12px 0' }}>
        <a href="/register" style={{ marginRight: 12 }}>注册</a>
        <a href="/login">登录</a>
      </div>
      <div>
        <h2>后端响应</h2>
        {error && <div>错误: {String(error)}</div>}
        {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <div>加载中...</div>}
      </div>
    </div>
  );
}
