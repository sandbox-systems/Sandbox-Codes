<?php
/**
 * Fetch contents of the selected file
 *
 * @author Shivashriganesh Mahato
 */

include 'init.php';

$blob = "";
try {
    $blob = $client->git->blobs->getBlob($owner, $repo, $sha);
} catch (GitHubClientException $e) {
}
$commits = $client->repos->commits->listCommitsOnRepository($owner, $repo, null, $path);
$created = count($commits) > 0 ? $commits[count($commits) - 1]->getCommit()->getAuthor()->getDate() : "N/A";
$edited = count($commits) > 0 ? $commits[0]->getCommit()->getAuthor()->getDate() : "N/A";

$content = $blob == "" ? "" : $blob->getContent();
$size = number_format((float) ($blob == "" ? 0 : $blob->getSize()) / 1024, 1, '.', '');
$fCreated = explode("T", $created, 2)[0];
$fEdited = explode("T", $edited, 2)[0];

header('Content-type: application/json');
echo json_encode(array('content' => $content, 'size' => $size, 'created' => $fCreated, 'edited' => $fEdited));
