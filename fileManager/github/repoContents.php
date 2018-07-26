<?php
/**
 * Fetch all folders and files contained within this path of the repository opened
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

// Collect all contents that match the given path
if (is_array($tree)) {
    foreach ($tree as &$content) {
        $cPath = $content->getPath();
        // Matches any content with a path of the form $path/:name
        // Unmatched if :name contains a / (indicating a deeper pa
        $pattern = "/^" . str_replace('/', '\/', $path) . ($path == '' ? '' : '\/') . "([^\/]+)$/";
        if (preg_match($pattern, $cPath, $groups)) {
            // The first group contains the name of the folder/file
            $name = $groups[1];
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
}

// Respond with encoded contents
header('Content-Type: application/json');
echo json_encode($contents);