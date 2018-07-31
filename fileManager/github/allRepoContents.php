<?php
/**
 * Recursively fetch all folders and files contained within the repository opened
 *
 * @author Shivashriganesh Mahato
 */

include 'init.php';
include 'fetchTree.php';

// Stores contents to be sent back
$contents = array();

// Fetch working tree at HEAD
$tree = $client->git->trees->getTreeRecursively($owner, $repo, $_SESSION['tree'])->getTree();

// Collect all contents
if (is_array($tree)) {
    foreach ($tree as &$content) {
        $sha = $content->getSha();
        $name = $content->getPath();

        $contents[] = array(
            'name' => $name,
            'sha' => $sha,
            'type' => $content->getType()
        );
    }
}

// Respond with encoded contents
header('Content-Type: application/json');
echo json_encode($contents);
