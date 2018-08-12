<?php

include "../fileManager/initDB.php";
session_start();
header("Content-type: application/json");

$repo = $_POST['repo'];
$owner = $_POST['owner'];
$path = $_POST['path'];

function generateRandomString($length = 10) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
}

$sessions = getDocuments($man, "fileSessions", [
    'repo' => $owner . '/' . $repo,
    'path' => $path
], []);

if (count($sessions) == 1) {
    echo json_encode(['session' => $sessions[0]->id]);
} else {
    $mRepo = md5($repo);
    $mOwner = md5($owner);
    $mPath = md5($path);
    $mUuid = md5(generateRandomString(28));
    $id = $mRepo . $mOwner . $mPath . $mUuid;
    $obj = array(
        'repo' => $owner . '/' . $repo,
        'path' => $path,
        'id' => $id
    );
    insertDocument($man, "fileSessions", $obj);
    echo json_encode(['isNew' => true, 'session' => $id]);
}
