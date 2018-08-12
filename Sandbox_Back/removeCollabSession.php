<?php

include '../fileManager/initDB.php';

$session = $_POST['session'];

deleteDocument($man, "fileSessions", ['id' => $session]);

