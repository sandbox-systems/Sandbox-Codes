<?php
/**
 * Fetch and respond with a list of all the contents of a project (recursively)
 *
 * @author Shivashriganesh Mahato
 */

include "global.php";

$owner = $_POST['owner'];
$repo = $_POST['repo'];
$branch = $_POST['branch'];

if ($storageMethod == "GITHUB") {
    include '../github/allRepoContents.php';
}
