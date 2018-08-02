<?php

include 'fileManager/initDB.php';
use \MongoDB\BSON\ObjectId;

$id = $_POST['id'];
deleteDocument($man, "notifications", ['_id' => new ObjectId($id)]);
