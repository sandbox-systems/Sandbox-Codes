<?php
/**
 * Sent invitation to a user to collaborate to this repo
 *
 * @author Shivashriganesh Mahato
 */

include 'init.php';

$client->repos->collaborators->put($owner, $repo, $username);