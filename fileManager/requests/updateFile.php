<?php
/**
 * Update a file from appropriate storage API
 *
 * @author Shivashriganesh Mahato
 */

include "global.php";

$owner = $_POST['owner'];
$repo = $_POST['repo'];
$branch = $_POST['branch'];
$path = $_POST['path'];
$name = $_POST['name'];
$content = $_POST['content'];

if ($storageMethod == "GITHUB") {
    include '../github/logFileUpdate.php';
}
