<?php
/**
 * Recursively fetch all folders and files contained within the repository opened
 *
 * @author Shivashriganesh Mahato
 */

include 'init.php';
include 'fetchTree.php';

// Stores contents to be sent back
$contents = array(
    'dirs' => array(),
    'files' => array()
);
// Fetch working tree at HEAD
$tree = $client->git->trees->getTreeRecursively($owner, $repo, $_SESSION['tree'])->getTree();

// Collect all contents
if (is_array($tree)) {
    foreach ($tree as &$content) {
        $sha = $content->getSha();
        // Add content to array as blob or dir as appropriate
        if ($content->getType() == "blob") {
            $contents['files']['i' . count($contents['files'])] = array(
                'name' => $name,
                'sha' => $sha
            );
        } else {
            $contents['dirs']['i' . count($contents['dirs'])] = $name;
        }
    }
}

// Respond with encoded contents
header('Content-Type: application/json');
echo json_encode($contents);