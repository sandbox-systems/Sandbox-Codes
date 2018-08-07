<?php
/**
 * Create a new file and log changes
 *
 * @author Shivashriganesh Mahato
 */

session_start();

if (!isset($_SESSION['changes']))
    $_SESSION['changes'] = array();

$_SESSION['changes'][] = array(
    'type' => 'ADD',
    'path' => $path,
    'name' => $name,
    'content' => $content,
    'isExecutable' => false
);

include 'logChanges.php';
