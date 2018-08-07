<?php
/**
 * Create a new repository
 *
 * @author Shivashriganesh Mahato
 */

include 'init.php';

header('Content-Type: application/json');
$client->repos->create(null, $name, $isPrivate);
