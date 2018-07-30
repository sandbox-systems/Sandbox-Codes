<?php
/**
 * Get changes in local version compared to remote
 *
 * @author Shivashriganesh Mahato
 */

include "global.php";

$owner = $_POST['owner'];
$repo = $_POST['repo'];
$branch = $_POST['branch'];

if ($storageMethod == "GITHUB") {
    include '../github/getDiff.php';
}
