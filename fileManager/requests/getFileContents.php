<?php
/**
 * Fetch and respond with the contents of a file
 *
 * @author Shivashriganesh Mahato
 */

include "global.php";

$owner = $_POST['owner'];
$repo = $_POST['repo'];
$branch = $_POST['branch'];
$path = $_POST['path'];
$file = $_POST['file'];

if ($storageMethod == "GITHUB") {
    include '../github/fileContents.php';
}
