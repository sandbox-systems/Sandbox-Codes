<?php
/**
 * Update a file from appropriate storage API
 *
 * @author Shivashriganesh Mahato
 */

include "global.php";

$owner = $_GET['owner'];
$repo = $_GET['repo'];
$branch = $_GET['branch'];
$path = $_GET['path'];
$name = $_GET['name'];
$content = $_GET['content'];
$sha = $_GET['sha'];

if ($storageMethod == "GITHUB") {
    include '../github/pushFileUpdate.php';
}