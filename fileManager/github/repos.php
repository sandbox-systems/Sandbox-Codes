<?php
/**
 * Fetch all repositories belonging to or shared with the user
 *
 * @author Shivashriganesh Mahato
 */

include 'init.php';

$repos = array();
$data = $client->repos->listYourRepositories();

foreach ($data as &$repo) {
    $repos['i' . count($repos)] = array(
        'name' => $repo->getName(),
        'owner' => $repo->getOwner()->getLogin()
    );
}

header('Content-Type: application/json');
echo json_encode($repos);