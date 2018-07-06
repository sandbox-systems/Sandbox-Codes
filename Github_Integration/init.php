<?php
/**
 * Initialize any page that accesses resources from Github resource server
 *
 * @author Shivashriganesh Mahato
 */

include 'util.php';

// Get access token from callback code and setup client with it
setupToken($client, $client_id, $client_secret);