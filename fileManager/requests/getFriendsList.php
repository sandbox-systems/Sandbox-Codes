<?php
/**
 * @author Shivashriganesh Mahato
 */

include_once '../initDB.php';
use \MongoDB\BSON\ObjectId;

session_start();

$username = $_SESSION['username'];

$user = getDocuments($man, "users", ['username' => $username], [])[0];
$friendIDS = $user->friends;
$friends = [];

foreach ($friendIDS as $friendID) {
    $friend = getDocuments($man, "users", ['_id' => new ObjectId($friendID)], [])[0];
    $friends[] = array(
        username => $friend->username,
        name => $friend->name,
        profilepic => $friend->profilepic
    );
}

header('Content-Type: application/json');
echo json_encode($friends);
