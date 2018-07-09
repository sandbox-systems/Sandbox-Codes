<?php
/**
 * Display contents of desired repository
 *
 * @author Shivashriganesh Mahato
 */

include 'init.php';

$owner = $_GET['owner'];
$repo = $_GET['repo'];
$branch = $_GET['branch'];

// TODO Remove because it's directly from StackOverflow for testing
function printArrayList($array)
{
    echo "<ul>";

    foreach ($array as $k => $v) {
        if (is_array($v)) {
            echo "<li>" . $k . "</li>";
            printArrayList($v);
            continue;
        }

        $name = $v->getName();
        echo "<li><a href='file.php?token=" . $_GET['token'] . "&owner=" . $_GET['owner'] . "&repo=" . $_GET['repo'] . "&file=" . urlencode($name) . "&path=" . urlencode($v->getPath()) . "'>" . $name . "</a></li>";
    }

    echo "</ul>";
}
function isSelected($br, $branch) {
    if ($br->getName() == $branch) {
        return 'selected';
    }
    return '';
}

$files = getFiles($client, $owner, $repo, "", $branch);
$branches = getBranches($client, $owner, $repo);

echo $branch . '<br>';

?>

<script>
    function setBranch(value) {
        location.href = window.location.href.replace(/branch=[a-zA-Z0-9]+/, "branch=" + value);
    }
</script>

<label>
    <select onchange="setBranch(this.value)">
        <?php foreach ($branches as $br): ?>
            <option selected="<?php echo isSelected($br, $branch) ?>"><?php echo $br->getName() ?></option>
        <?php endforeach; ?>
    </select>
</label>

<p>
    <?php printArrayList($files) ?>
</p>