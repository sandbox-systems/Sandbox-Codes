<?php
/**
 * Respond to callback with list of repositories
 *
 * @author Shivashriganesh Mahato
 */

include "init.php";

$repos = $client->repos->listYourRepositories();

?>

 Display repositories in list (currently 100/pg)
<ul>
    <?php foreach ($repos as $repo): ?>
        <li>
            <a href="repo.php?token=<?php echo $_GET['token'] ?>&owner=<?php echo $repo->getOwner()->getLogin() ?>&repo=<?php echo $repo->getName() ?>&branch=master">
                <?php echo $repo->getOwner()->getLogin() . ': ' . $repo->getName() ?>
            </a>
        </li>
    <?php endforeach; ?>
</ul>
