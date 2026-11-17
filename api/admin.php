<?php
require __DIR__ . '/db.php';
start_admin_session();
try {
    $action=(string)($_GET['action']??'');
    if ($action==='login' && $_SERVER['REQUEST_METHOD']==='POST') {
        $d=request_json();
        if (!hash_equals((string)$config['admin_email'],trim((string)($d['email']??''))) || !password_verify((string)($d['password']??''),(string)$config['admin_password_hash'])) json_out(['ok'=>false,'message'=>'Incorrect email or password.'],401);
        session_regenerate_id(true); $_SESSION['cw_admin']=true;
        json_out(['ok'=>true]);
    }
    if ($action==='logout' && $_SERVER['REQUEST_METHOD']==='POST') { $_SESSION=[]; session_destroy(); json_out(['ok'=>true]); }
    require_admin();
    if ($action==='list') {
        $reviews=db()->query('SELECT id,name,rating,review_text AS text,status,reply,created_at AS createdAt FROM reviews ORDER BY created_at DESC')->fetchAll();
        foreach ($reviews as &$r) { $r['id']=(int)$r['id']; $r['rating']=(int)$r['rating']; $r['createdAt']=(int)$r['createdAt']; }
        $enquiries=db()->query('SELECT id,name,phone,topic,message,created_at AS createdAt FROM enquiries ORDER BY created_at DESC LIMIT 200')->fetchAll();
        foreach ($enquiries as &$e) { $e['id']=(int)$e['id']; $e['createdAt']=(int)$e['createdAt']; }
        json_out(['ok'=>true,'reviews'=>$reviews,'enquiries'=>$enquiries]);
    }
    if ($action==='review' && $_SERVER['REQUEST_METHOD']==='POST') {
        $d=request_json(); $id=filter_var($d['id']??null,FILTER_VALIDATE_INT); $op=(string)($d['operation']??'');
        if (!$id) json_out(['ok'=>false,'message'=>'Invalid review.'],422);
        if ($op==='status' && in_array($d['status']??'', ['pending','approved','hidden'],true)) {
            $s=db()->prepare('UPDATE reviews SET status=? WHERE id=?'); $s->execute([$d['status'],$id]);
        } elseif ($op==='reply') {
            $reply=trim((string)($d['reply']??'')); if (mb_strlen($reply)>600) json_out(['ok'=>false,'message'=>'Reply is too long.'],422);
            $s=db()->prepare('UPDATE reviews SET reply=? WHERE id=?'); $s->execute([$reply,$id]);
        } elseif ($op==='delete') { $s=db()->prepare('DELETE FROM reviews WHERE id=?'); $s->execute([$id]); }
        else json_out(['ok'=>false,'message'=>'Invalid action.'],422);
        json_out(['ok'=>true]);
    }
    if ($action==='enquiry-delete' && $_SERVER['REQUEST_METHOD']==='POST') {
        $d=request_json(); $id=filter_var($d['id']??null,FILTER_VALIDATE_INT);
        if (!$id) json_out(['ok'=>false,'message'=>'Invalid enquiry.'],422);
        $s=db()->prepare('DELETE FROM enquiries WHERE id=?'); $s->execute([$id]); json_out(['ok'=>true]);
    }
    json_out(['ok'=>false,'message'=>'Unknown action.'],404);
} catch (Throwable $e) {
    error_log('CashWorld admin: '.$e->getMessage());
    json_out(['ok'=>false,'message'=>'The request could not be completed.'],500);
}
