<?php
/**
 * Update a file and log changes
 *
 * @author Shivashriganesh Mahato
 */

session_start();

if (!isset($_SESSION['changes']))
    $_SESSION['changes'] = array();
$_SESSION['changes'][$owner . $repo . $branch . $path . $name] = array(
    'type' => 'UPDATE',
    'path' => $path,
    'name' => $name,
    'content' => $content
);

include 'logChanges.php';
