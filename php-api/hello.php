<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
echo json_encode([
  'message' => '你好，方言宝！',
  'timestamp' => time()
], JSON_UNESCAPED_UNICODE);
