<?php

include '../fileManager/initDB.php';
header("Content-type: application/json");

$session = $_POST['session'];

echo json_encode(['creator' => getDocuments($man, "fileSessions", ['id' => $session], [])[0]->creator]);

