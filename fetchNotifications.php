<?php

include 'fileManager/initDB.php';
header('Content-type: application/json');
session_start();

$notifResults = getDocuments($man, "notifications", ['recipientID' => $_SESSION['object_id']], []);
$requestResults = getDocuments($man, "requests", ['to' => $_SESSION['object_id']], []);
updateDocument($man, "notifications", ['unread' => True], DBUpdateOperators::Set, ['unread' => False]);
updateDocument($man, "requests", ['unread' => True], DBUpdateOperators::Set, ['unread' => False]);
$results = array_merge($notifResults, $requestResults);

$notifs = [];

foreach ($results as $result) {
    $notif = array();
    if ($result->type == "friend") {
        $notif['type'] = "friend";
        $notif['content'] = "Would you like to accept " . $result->from->name . "'s friend request?";
        $notif['from'] = $result->from->uname;
        $notif['fromID'] = $result->fromID;
    } else if ($result->type == "friendRequestResponse") {
        $notif['type'] = "friendResponse";
        $notif['content'] = $result->content;
        $notif['notifID'] = (string) $result->_id;
    }
    $notifs[] = $notif;
}

echo json_encode(array("notifications" => $notifs));
