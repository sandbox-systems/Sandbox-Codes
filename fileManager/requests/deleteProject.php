<?php
/**
 * Create new project to current user's account (on appropriate storage service)
 *
 * @author Shivashriganesh Mahato
 */

include "global.php";

$owner = $_POST['owner'];
$repo = $_POST['repo'];

if ($storageMethod == "GITHUB") {
    include '../github/deleteRepo.php';
}
