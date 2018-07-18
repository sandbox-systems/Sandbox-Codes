<?php
/**
 * Fetch and respond with the contents of a file
 *
 * @author Shivashriganesh Mahato
 */

include "global.php";

$owner = $_GET['owner'];
$repo = $_GET['repo'];
$branch = $_GET['branch'];
$path = $_GET['path'];
$file = $_GET['file'];

if ($storageMethod == "GITHUB") {
    include '../github/repoFileContents.php';
}
