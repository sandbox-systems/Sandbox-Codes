<?php

require_once(__DIR__ . '/../GitHubClient.php');
require_once(__DIR__ . '/../GitHubService.php');

	

class GitHubSearch extends GitHubService
{
    function searchCode($owner, $filename) {
        $url = "https://api.github.com/search/code?q=user:$owner+filename:$filename";
        $cInit = curl_init();
        curl_setopt($cInit, CURLOPT_URL, $url);
        curl_setopt($cInit, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($cInit, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);
        curl_setopt($cInit, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
        curl_setopt($cInit, CURLOPT_HTTPHEADER, array(
            'Accept: application/json',
            'Content-Type: application/json',
            'Authorization: token ' . $this->client->getToken()
        ));

        $output = curl_exec($cInit);
        $result = json_decode($output);

        return $result->items;
    }
}

