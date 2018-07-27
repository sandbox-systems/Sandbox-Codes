<?php
/**
 * Fetch and respond with a list of the contents of a project at a specific path (files and directories)
 *
 * @author Shivashriganesh Mahato
 */

include "global.php";

$owner = $_POST['owner'];
$repo = $_POST['repo'];
$branch = $_POST['branch'];
$path = $_POST['path'];

if ($storageMethod == "GITHUB") {
    include '../github/repoContents.php';
}
