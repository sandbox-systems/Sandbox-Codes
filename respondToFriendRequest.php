<?php

include 'fileManager/initDB.php';
use \MongoDB\BSON\ObjectID;
session_start();

$from = $_POST['from'];
$fromID = $_POST['fromID'];
$toID = $_SESSION['object_id'];
$toName = $_SESSION['name'];
$accepted = $_POST['accepted'];

if ($accepted == 'true') {
    updateDocument($man, "users", ['_id' => new ObjectID($fromID)],
        DBUpdateOperators::Push, ['friends' => $toID]);
    updateDocument($man, "users", ['_id' => new ObjectID($toID)],
        DBUpdateOperators::Push, ['friends' => $fromID]);
    insertDocument($man, "notifications", array(
        "recipientID" => $fromID,
        "type" => "friendRequestResponse",
        "content" => $toName . " accepted your friend request!"
    ));
} else {
    insertDocument($man, "notifications", array(
        "recipientID" => $fromID,
        "type" => "friendRequestResponse",
        "content" => $toName . " rejected your friend request"
    ));
}
deleteDocument($man, "requests", ["fromID" => $fromID, "to" => $toID]);
