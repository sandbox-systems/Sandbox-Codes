<?php
/**
 * Fetch contents of the selected file
 *
 * @author Shivashriganesh Mahato
 */

include 'init.php';

$blob = $client->git->blobs->getBlob($owner, $repo, $sha);
$content = $blob->getContent();

echo $content;
