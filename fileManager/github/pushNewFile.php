<?php
/**
 * Create a new file and push changes
 *
 * @author Shivashriganesh Mahato
 */

include 'init.php';

$client->repos->contents->createFile($owner, $repo, $path . ($path == "" ? "" : "/") . $name,
    "Add " . $name, "", $branch);