<?php
/**
 * Fetch contents of the selected file
 *
 * @author Shivashriganesh Mahato
 */

include 'init.php';

$blob = $client->git->blobs->getBlob($owner, $repo, $sha);
$content = base64_decode($blob->getContent());

echo $content;