<?php
require __DIR__ . '/db.php';
try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['ok'=>false,'message'=>'Method not allowed.'],405);
    $d=request_json();
    if (!empty($d['website'])) json_out(['ok'=>true,'message'=>'Thank you. Your message has been received.']);
    $name=trim(preg_replace('/\s+/', ' ', (string)($d['name']??'')));
    $phone=trim((string)($d['phone']??''));
    $topic=trim((string)($d['topic']??''));
    $message=trim((string)($d['message']??''));
    if ($name==='' || mb_strlen($name)>100 || $phone==='' || mb_strlen($phone)>40 || mb_strlen($topic)>100 || mb_strlen($message)>3000) json_out(['ok'=>false,'message'=>'Please check your name, phone number and message.'],422);
    $stmt=db()->prepare('INSERT INTO enquiries (name,phone,topic,message,created_at) VALUES (?,?,?,?,?)');
    $stmt->execute([$name,$phone,$topic,$message,(int)(microtime(true)*1000)]);
    json_out(['ok'=>true,'message'=>'Thank you. Your enquiry has been received.']);
} catch (Throwable $e) {
    error_log('CashWorld contact: '.$e->getMessage());
    json_out(['ok'=>false,'message'=>'We could not send your enquiry. Please try again later.'],500);
}
