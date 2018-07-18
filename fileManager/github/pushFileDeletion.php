<?php
/**
 * Remove a file and push changes
 *
 * @author Shivashriganesh Mahato
 */

include 'init.php';

$client->repos->contents->deleteFile($owner, $repo, $path . ($path == "" ? "" : "/") . $name,
    "Delete " . $name, $sha, $branch);