<?php
/**
 * Fetch all folders and files contained within this path of the repository opened
 *
 * @author Shivashriganesh Mahato
 */

include 'init.php';
include 'fetchTree.php';

$contents = array(
    'dirs' => array(),
    'files' => array()
);
//
//// Fetch repo HEAD if local HEAD is new
//if (!isset($_SESSION['tree']) || $_SESSION['tree'] == "") {
//    $_SESSION['tree'] = $client->git->refs->getReference($owner, $repo, "heads/$branch")->getObject()->getSha();
//}
// Fetch working tree at HEAD
$tree = $client->git->trees->getTreeRecursively($owner, $repo, $_SESSION['tree'])->getTree();

if (is_array($tree)) {
    foreach ($tree as &$content) {
        $cPath = $content->getPath();
        $pattern = "/^" . str_replace('/', '\/', $path) . ($path == '' ? '' : '\/') . "([^\/]+)$/";
        if (preg_match($pattern, $cPath, $groups)) {
            $name = $groups[1];
            $sha = $content->getSha();
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

header('Content-Type: application/json');
echo json_encode($contents);