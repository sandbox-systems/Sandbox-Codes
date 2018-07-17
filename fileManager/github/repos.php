<?php

include 'init.php';
?>

<script>
    <?php foreach ($client->repos->listYourRepositories() as &$repo) { ?>
        <?php $name = $repo->getName(); ?>
        <?php $owner = $repo->getOwner()->getLogin(); ?>
        addFolder("<?php echo $name ?>", function () {
            alert("<?php echo $owner ?>");
        });
    <?php } ?>
</script>