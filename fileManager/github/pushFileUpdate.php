<?php
/**
 * Update a file and push changes
 *
 * @author Shivashriganesh Mahato
 */

include 'init.php';

$client->repos->contents->updateFile($owner, $repo, $path . ($path == "" ? "" : "/") . $name,
    "Update " . $name, $content, $sha, $branch);