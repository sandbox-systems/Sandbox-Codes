<?php
/**
 * Save new tree sha to Sandbox DB by either updating existent member or upserting new one
 * Assumes dbInit.php has already been loaded and $owner, $repo, $branch, and $_SESSION['tree'] are initialized
 *
 * @author Shivashriganesh Mahato
 */

// Update or create appropriate field in appropriate repos document with given branch name
updateDocument($man, "repos", ['owner' => base64_encode($owner), 'name' => base64_encode($repo)],
    DBUpdateOperators::Set, [base64_encode($branch) => $_SESSION['tree']]);