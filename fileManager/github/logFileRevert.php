<?php
/**
 * Revert changes made to a file
 *
 * @author Shivashriganesh Mahato
 */

include "init.php";
session_start();

if (!isset($_SESSION['changes']))
    $_SESSION['changes'] = array();

$content = $client->repos->contents->getContents($owner, $repo, $path . ($path == "" ? "" : "/") . $name, $branch);

$_SESSION['changes'][$owner . $repo . $branch . $path . $name] = array(
    'type' => 'UPDATE',
    'path' => $path,
    'name' => $name,
    'content' => $content
);

include 'logChanges.php';
