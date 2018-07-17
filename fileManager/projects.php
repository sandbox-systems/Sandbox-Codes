<?php
include 'global.php';

if ($storageMethod == "GITHUB") {
    include 'github/repos.php';
}