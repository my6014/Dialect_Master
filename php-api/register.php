<?php
require __DIR__ . '/common.php';
cors();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  json_out(['error' => '仅支持POST'], 405);
}
$raw = file_get_contents('php://input');
$input = json_decode($raw, true);
$username = isset($input['username']) ? trim($input['username']) : '';
$password = isset($input['password']) ? $input['password'] : '';
if ($username === '' || $password === '') {
  json_out(['error' => '用户名或密码为空'], 400);
}
$pdo = get_pdo();
ensure_users_table($pdo);
$hash = password_hash($password, PASSWORD_DEFAULT);
try {
  $stmt = $pdo->prepare('INSERT INTO users (username, password_hash) VALUES (:u, :p)');
  $stmt->execute([':u' => $username, ':p' => $hash]);
  json_out(['ok' => true, 'message' => '注册成功']);
} catch (Exception $e) {
  if (strpos($e->getMessage(), 'unique') !== false) {
    json_out(['error' => '用户名已存在'], 409);
  }
  json_out(['error' => '注册失败'], 500);
}
