<?php

include '../fileManager/initDB.php';

$session = $_POST['session'];
$newOwner = $_POST['newOwner'];

updateDocument($man, "fileSessions", ['id' => $session], DBUpdateOperators::Set,
    ['creator' => $newOwner]);

