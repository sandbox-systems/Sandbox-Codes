<?php

include "global.php";

$owner = $_GET['owner'];
$repo = $_GET['repo'];
$path = $_GET['path'];

if ($storageMethod == "GITHUB") {
    include 'github/repoContents.php';
}
