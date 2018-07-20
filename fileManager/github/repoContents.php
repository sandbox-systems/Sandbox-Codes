<?php
/**
 * Fetch all folders and files contained within this path of the repository opened
 *
 * @author Shivashriganesh Mahato
 */

include 'init.php';

$contents = array(
    'dirs' => array(),
    'files' => array()
);
$data = $client->repos->contents->getContents($owner, $repo, $path, $ref = $branch);

if (is_array($data)) {
    foreach ($data as &$content) {
        $name = $content->getName();
        $sha = $content->getSha();
        if ($content->getType() == "file") {
            $contents['files']['i' . count($contents['files'])] = array(
                'name' => $name,
                'sha' => $sha
            );
        } else {
            $contents['dirs']['i' . count($contents['dirs'])] = $name;
        }
    }
}

header('Content-Type: application/json');
echo json_encode($contents);