<?php
/**
 * Create new file and add to appropriate storage API
 *
 * @author Shivashriganesh Mahato
 */

include "global.php";

$owner = $_GET['owner'];
$repo = $_GET['repo'];
$branch = $_GET['branch'];
$path = $_GET['path'];
$name = $_GET['name'];

if ($storageMethod == "GITHUB") {
    include '../github/pushNewFile.php';
}