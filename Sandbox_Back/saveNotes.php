<?php

/**
 * @author Shivashriganesh Mahato
 */

include '../fileManager/initDB.php';
session_start();

$notesContent = $_POST['content'];
updateDocument($man, "users", ["username" => $_SESSION['username']], DBUpdateOperators::Set, ["notes" => $notesContent]);
