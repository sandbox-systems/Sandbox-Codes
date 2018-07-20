<?php
/**
 * Fetch contents of the selected file
 *
 * @author Shivashriganesh Mahato
 */

include 'init.php';

$data = $client->repos->contents->getContents($owner, $repo, $path . '/' . $file, $ref = $branch);
$blob = $data->content;

//$ch = curl_init("https://api.github.com/repos/$owner/$repo/contents/$path/$file?access_token=" . $_SESSION['token']);
//curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
//curl_setopt($ch, CURLOPT_HEADER, 0);
//curl_setopt($ch, CURLOPT_HTTPHEADER, array(
//    'User-Agent: Sandbox',
//));
//$response = curl_exec($ch);
//curl_close($ch);
//
//$json = json_decode($response, true);
//$content = base64_decode($json['content']);
$content = base64_decode($blob);

var_dump($content);