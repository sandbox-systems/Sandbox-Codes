<?php
/**
 * Direct user to authenticate
 *
 * @author Shivashriganesh Mahato
 */

include 'params.php';

if (isset($_GET['unsuccessful']))
    echo "Login was unsuccessful";

?>

<!-- Send user to Github authentication page -->
<!-- TODO change scope appropriately -->
<a href="https://github.com/login/oauth/authorize?scope=repo&client_id=<?php echo $client_id ?>">LOGIN</a>
