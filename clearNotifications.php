<?php

include 'fileManager/initDB.php';
session_start();

$userID = $_SESSION['object_id'];
deleteDocument($man, "notifications", ['recipientID' => $userID]);
deleteDocument($man, "requests", ['to' => $userID]);
