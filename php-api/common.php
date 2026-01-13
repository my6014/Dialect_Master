<?php
function cors() {
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Methods: POST, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type, Accept');
  if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
  }
}
function json_out($data, $status = 200) {
  header('Content-Type: application/json; charset=utf-8');
  http_response_code($status);
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
  exit;
}
function load_env_local($file = null) {
  $path = $file ?: __DIR__ . '/.env.local';
  if (!file_exists($path)) return;
  $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
  foreach ($lines as $line) {
    if (strpos(trim($line), '#') === 0) continue;
    $eq = strpos($line, '=');
    if ($eq === false) continue;
    $key = trim(substr($line, 0, $eq));
    $val = trim(substr($line, $eq + 1));
    if ((strlen($val) >= 2) && (($val[0] === '"' && substr($val, -1) === '"') || ($val[0] === "'" && substr($val, -1) === "'"))) {
      $val = substr($val, 1, -1);
    }
    putenv("$key=$val");
    $_ENV[$key] = $val;
    $_SERVER[$key] = $val;
  }
}
function get_pdo() {
  load_env_local();
  $host = getenv('DB_HOST') ?: 'localhost';
  $port = getenv('DB_PORT') ?: '5432';
  $dbname = getenv('DB_NAME');
  $user = getenv('DB_USER');
  $pass = getenv('DB_PASSWORD') ?: '';
  if (!$dbname || !$user) {
    json_out(['error' => '数据库配置缺失'], 500);
  }
  $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
  try {
    $pdo = new PDO($dsn, $user, $pass, [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    return $pdo;
  } catch (Exception $e) {
    json_out(['error' => '数据库连接失败'], 500);
  }
}
function ensure_users_table(PDO $pdo) {
  $pdo->exec(
    "CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )"
  );
}
