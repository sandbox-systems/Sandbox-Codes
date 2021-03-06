<?php
/**
 * Fetch all repositories belonging to or shared with the user
 *
 * @author Shivashriganesh Mahato
 */

include 'init.php';

$repos = array();
$data = $client->repos->listYourRepositories();

if (is_array($data)) {
    foreach ($data as &$repo) {
        $repos['i' . count($repos)] = array(
            'name' => $repo->getName(),
            'owner' => $repo->getOwner()->getLogin(),
            'isPrivate' => $repo->getPrivate()
        );
    }
}

header('Content-Type: application/json');
echo json_encode($repos);