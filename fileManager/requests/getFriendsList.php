<?php
/**
 * @author Shivashriganesh Mahato
 */

include_once '../initDB.php';
use \MongoDB\BSON\ObjectId;

session_start();

$username = "jdoe1";
//$username = $_SESSION['username'];

$user = getDocuments($man, "users", ['username' => $username], [])[0];
$friendIDS = $user->friends;
$friends = [];

foreach ($friendIDS as $friendID) {
    $friend = getDocuments($man, "users", ['_id' => new ObjectId($friendID)], [])[0];
    $friends[] = $friend->username;
}

header('Content-Type: application/json');
echo json_encode($friends);