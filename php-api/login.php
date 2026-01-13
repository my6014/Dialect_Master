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
$stmt = $pdo->prepare('SELECT id, password_hash FROM users WHERE username = :u');
$stmt->execute([':u' => $username]);
$row = $stmt->fetch();
if (!$row) {
  json_out(['error' => '用户不存在'], 404);
}
if (!password_verify($password, $row['password_hash'])) {
  json_out(['error' => '密码错误'], 401);
}
json_out(['ok' => true, 'message' => '登录成功', 'userId' => $row['id']]);
