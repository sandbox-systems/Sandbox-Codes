<?php
/**
 * Remove a file and log changes
 *
 * @author Shivashriganesh Mahato
 */

session_start();

if (!isset($_SESSION['changes']))
    $_SESSION['changes'] = array();
$_SESSION['changes'][] = array(
    'type' => 'DELETE',
    'path' => $path,
    'name' => $name
);

include 'logChanges.php';