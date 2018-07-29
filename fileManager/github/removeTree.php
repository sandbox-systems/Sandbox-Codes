<?php
/**
 * Delete tree sha entry in Sandbox DB bound to current owner, repo, and branch
 * Assumes dbInit.php has already been loaded and $owner, $repo, and $branch are initialized
 *
 * @author Shivashriganesh Mahato
 */

unset($_SESSION['tree']);
// Remove the field within the appropriate repos document that matches the appropriate branch
updateDocument($man, "repos", ['owner' => base64_encode($owner), 'name' => base64_encode($repo)],
    Operators::_Unset, [base64_encode($branch) => ""]);