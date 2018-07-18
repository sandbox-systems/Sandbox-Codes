<?php

include 'init.php';
?>

<script>
    <?php foreach ($client->repos->listYourRepositories() as &$repo) { ?>
        <?php $name = $repo->getName(); ?>
        <?php $owner = $repo->getOwner()->getLogin(); ?>
        addFolder("<?php echo $name ?>", "owners/<?php echo $owner ?>/repos/<?php echo $name ?>", function () {
            window.scrollTo(0, 0);
        });
    <?php } ?>
</script>