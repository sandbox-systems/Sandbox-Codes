<?php
/**
 * Create new project to current user's account (on appropriate storage service)
 *
 * @author Shivashriganesh Mahato
 */

include "global.php";

$name = $_POST['name'];
$isPrivate = $_POST['isPrivate'];

if ($storageMethod == "GITHUB") {
    include '../github/createRepo.php';
}