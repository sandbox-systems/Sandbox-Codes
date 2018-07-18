<?php
/**
 * Fetch contents of the selected file
 *
 * @author Shivashriganesh Mahato
 */

include 'init.php';

$data = $client->repos->contents->getContents($owner, $repo, $path . '/' . $file, $ref = $branch);
$blob = $data->content;

echo base64_decode($blob);