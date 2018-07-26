<?php
/**
 * Initialize any page that accesses resources from Github resource server
 *
 * @author Shivashriganesh Mahato
 */
include 'util.php';

// Get access token from callback code and setup client with it
if (!setupToken($client)) {
    echo "UNSYNCED";
    die();
}

$token = $_SESSION['token'];
