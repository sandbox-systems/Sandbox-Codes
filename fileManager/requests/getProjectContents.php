<?php
/**
 * Fetch and respond with a list of the contents of a project at a specific path (files and directories)
 *
 * @author Shivashriganesh Mahato
 */

include "global.php";

$owner = $_GET['owner'];
$repo = $_GET['repo'];
$branch = $_GET['branch'];
$path = $_GET['path'];

if ($storageMethod == "GITHUB") {
    include '../github/repoContents.php';
}
