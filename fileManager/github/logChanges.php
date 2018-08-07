<?php
/**
 * Create a new tree on top of previously made one (either a save cycle or commit) with repo updates and
 * store sha in session
 *
 * @author Shivashriganesh Mahato
 */

include 'init.php';

$owner = $_POST['owner'];
$repo = $_POST['repo'];
$branch = $_POST['branch'];

include 'fetchTree.php';

// Fetch working tree at HEAD
$baseTree = $client->git->trees->getTreeRecursively($owner, $repo, $_SESSION['tree']);

// Collect only path, mode, type, and sha/contents of blobs/subtrees in working tree
$tree = array();
foreach ($baseTree->getTree() as &$item) {
    if ($item->getType() == "blob") {
        $tree[] = array(
            "path" => $item->getPath(),
            "mode" => $item->getMode(),
            "type" => $item->getType(),
            "sha" => $item->getSha()
        );
    }
}

// Apply changes to model of local tree
if (isset($_SESSION['changes'])) {
    foreach ($_SESSION['changes'] as &$change) {
        $filePath = $change['path'] . ($change['path'] == '' ? '' : '/') . $change['name'];
        switch ($change['type']) {
            case 'ADD':
                $tree[] = array(
                    "path" => $filePath,
                    "mode" => $change['isExecutable'] ? '100755' : '100644',
                    "type" => 'blob',
                    "content" => $change['content']
                );
                break;
            case 'UPDATE':
                foreach ($tree as $ind => &$item) {
                    if ($item["path"] == $filePath) {
                        $item['content'] = $change['content'];
                        if (isset($item['sha']))
                            unset($item['sha']);
                        break;
                    }
                }
                break;
            case 'DELETE':
                foreach ($tree as $ind => $item) {
                    if ($item["path"] == $filePath) {
                        unset($tree[$ind]);
                        break;
                    }
                }
                break;
        }
    }
}

// Reset indices to ensure array is created when encoding to json
$tree = array_values($tree);

// Create new tree object from local version and store sha
$newTreeSha = $client->git->trees->createTree($owner, $repo, $tree)->getSha();
$_SESSION['tree'] = $newTreeSha;
include 'saveTree.php';

$newTree = $client->git->trees->getTreeRecursively($owner, $repo, $newTreeSha);
$change = $_SESSION['changes'][$owner . $repo . $branch . $path . $name];
foreach ($newTree->getTree() as &$item) {
    if ($item->getPath() == $change['path'] . ($change['path'] == '' ? '' : '/') . $change['name']) {
        header('Content-Type: application/json');
        echo json_encode(array(
            'newSha' => $item->getSha()
        ));
    }
}

$_SESSION['changes'] = array();
