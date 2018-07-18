<?php
/**
 * Delete a file and remove from appropriate storage API
 *
 * @author Shivashriganesh Mahato
 */

include "global.php";

$owner = $_GET['owner'];
$repo = $_GET['repo'];
$branch = $_GET['branch'];
$path = $_GET['path'];
$name = $_GET['name'];
$sha = $_GET['sha'];

if ($storageMethod == "GITHUB") {
    include '../github/pushFileDeletion.php';
}