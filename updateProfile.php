<?php

include_once 'fileManager/initDB.php';

session_start();
//$user = getDocuments($man, "users", ['username' => 'jdoe1'], [])[0];
$user = getDocuments($man, "users", ['username' => $_SESSION['username']], [])[0];

$name = $_POST['name'];
$username = $_POST['username'];
$email = $_POST['email'];
$profilepic = $_POST['profilepic'];
$newData = [];

if ($name != $user->name) {
    $newData['name'] = $name;
}
if ($username != $user->username) {
    $newData['username'] = $username;
}
if ($email != $user->email) {
    $newData['email'] = $email;
}
if ($profilepic != '0') {
    $newData['profilepic'] = $profilepic;
}

if (!empty($newData)) {
//    updateDocument($man, "users", ['username' => 'jdoe1'], DBUpdateOperators::Set, $newData);
    updateDocument($man, "users", ['username' => $_SESSION['username']], DBUpdateOperators::Set, $newData);
}

header('Content-Type: application/json');
echo json_encode("SUCCESS");
