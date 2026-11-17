<?php
require __DIR__ . '/db.php';
try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = db()->query("SELECT id, name, rating, review_text AS text, reply, created_at AS createdAt FROM reviews WHERE status='approved' ORDER BY created_at DESC LIMIT 100");
        $rows = $stmt->fetchAll();
        foreach ($rows as &$row) { $row['id']=(int)$row['id']; $row['rating']=(int)$row['rating']; $row['createdAt']=(int)$row['createdAt']; }
        json_out(['ok'=>true,'reviews'=>$rows]);
    }
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['ok'=>false,'message'=>'Method not allowed.'],405);
    $d=request_json();
    if (!empty($d['website'])) json_out(['ok'=>true,'message'=>'Thank you. Your review has been received.']);
    $name=trim(preg_replace('/\s+/', ' ', (string)($d['name']??'')));
    $rating=filter_var($d['rating']??null,FILTER_VALIDATE_INT);
    $body=trim((string)($d['text']??''));
    if ($name==='' || mb_strlen($name)>60 || !$rating || $rating<1 || $rating>5 || mb_strlen($body)<5 || mb_strlen($body)>800) json_out(['ok'=>false,'message'=>'Please enter your name, choose a rating and write a review of 5–800 characters.'],422);
    $stmt=db()->prepare("INSERT INTO reviews (name,rating,review_text,status,created_at) VALUES (?,?,?,'pending',?)");
    $stmt->execute([$name,$rating,$body,(int)(microtime(true)*1000)]);
    json_out(['ok'=>true,'message'=>'Thank you. Your review has been sent for approval.']);
} catch (Throwable $e) {
    error_log('CashWorld reviews: '.$e->getMessage());
    json_out(['ok'=>false,'message'=>'We could not process that request. Please try again later.'],500);
}
