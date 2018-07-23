<?php
/**
 * Delete a file and remove from appropriate storage API
 *
 * @author Shivashriganesh Mahato
 */

include "global.php";

$owner = $_POST['owner'];
$repo = $_POST['repo'];
$branch = $_POST['branch'];
$path = $_POST['path'];
$name = $_POST['name'];
$sha = $_POST['sha'];

if ($storageMethod == "GITHUB") {
    include '../github/pushFileDeletion.php';
}