<?php
/**
 * Fetch tree sha from Github, Sandbox DB, or session as appropriate
 * Assumes dbInit.php has already been loaded and $owner and $repo are initialized
 *
 * @author Shivashriganesh Mahato
 */

$eRepo = base64_encode($repo);
$eOwner = base64_encode($owner);
$eBranch = base64_encode($branch);

// Ensure that owner, repo, or branch have not changed
// Fetch tree sha if it's not already set in session
if (!isset($_SESSION['tree']) || !isset($_SESSION['repoName']) || !isset($_SESSION['repoOwner']) ||
    !isset($_SESSION['repoBranch']) || $_SESSION['repoName'] != $eRepo || $_SESSION['repoOwner'] != $eOwner ||
    $_SESSION['repoBranch'] != $eBranch) {
    // Fetch all documents that match this repo (should only match 0-1 documents)
    $docs = getDocuments($man, "repos", ['owner' => $eOwner, 'name' => $eRepo], []);

    // Fetch from DB if entry exists for current branch (i.e. changes had been saved)
    // If entry does not exist, there are no local changes and the tree must be fetched from Github HEAD
    if (sizeof($docs) == 1 && property_exists($docs[0], $eBranch)) {
        $_SESSION['tree'] = $docs[0]->{$eBranch};
    } else {
        $_SESSION['tree'] = $client->git->refs->getReference($owner, $repo, "heads/$branch")->getObject()->getSha();
    }
    // Update currently viewed repo details
    $_SESSION['repoName'] = $eRepo;
    $_SESSION['repoOwner'] = $eOwner;
    $_SESSION['repoBranch'] = $eBranch;
}
