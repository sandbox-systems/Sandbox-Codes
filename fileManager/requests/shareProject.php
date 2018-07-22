<?php
/**
 * Share access to this project with another user
 *
 * @author Shivashriganesh Mahato
 */

include "global.php";

$owner = $_GET['owner'];
$repo = $_GET['repo'];
$username = $_GET['username'];

if ($storageMethod == "GITHUB") {
    include '../github/addCollaborator.php';
}