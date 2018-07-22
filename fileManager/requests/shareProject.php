<?php
/**
 * Share access to this project with another user
 *
 * @author Shivashriganesh Mahato
 */

include "global.php";

$owner = $_POST['owner'];
$repo = $_POST['repo'];
$username = $_POST['username'];

if ($storageMethod == "GITHUB") {
    include '../github/addCollaborator.php';
}