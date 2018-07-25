<?php
/**
 * Fetch and respond with the contents of a file
 *
 * @author Shivashriganesh Mahato
 */

include "global.php";

$owner = $_POST['owner'];
$repo = $_POST['repo'];
$sha = $_POST['sha'];

if ($storageMethod == "GITHUB") {
    include '../github/fileContents.php';
}
