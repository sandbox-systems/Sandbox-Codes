<?php
/**
 * Display file contents.
 *
 * @author Shivashriganesh Mahato
 */

include "init.php";

$file = urldecode($_GET['file']);

$token = $_GET['token'];
$owner = $_GET['owner'];
$repo = $_GET['repo'];
$file = $_GET['file'];

$the_file = getFile($client, $owner, $repo, $file);

$content = base64_decode($the_file->getContent()) . " else 3.0";

$branch = "master";

$real_file = getFile($client, $owner, $repo, "newFILE.txt", $branch);
var_dump($real_file);