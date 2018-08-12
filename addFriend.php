<?php

include 'fileManager/initDB.php';

session_start();

$fromID = $_SESSION['object_id'];
$fromUsername = $_SESSION['username'];
$fromName = $_SESSION['name'];

$toUname = $_POST['user'];
$to = getDocuments($man, "users", ['username' => $toUname], [])[0];

$request = array(
    "type" => "friend",
	"from" => array(
		"id" => $fromID,
		"uname" => $fromUsername,
		"name" => $fromName
    ),
    "fromID" => $fromID,
    "to" => (string) $to->_id,
    "accepted" => null,
    "unread" => True
);

insertDocument($man, "requests", $request);
