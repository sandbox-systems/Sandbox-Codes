<?php
/**
 * Sent invitation to a user to collaborate to this repo
 *
 * @author Shivashriganesh Mahato
 */

include 'init.php';
include_once '../initDB.php';

foreach ($usernames as $username) {
    try {
        $ghUname = getDocuments($man, "users", ['username' => $username], [])[0]->GHUsername;
        $client->repos->collaborators->put($owner, $repo, $ghUname);
    } catch (GitHubClientException $e) {
    }
}
