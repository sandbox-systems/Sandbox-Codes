<?php

include_once 'fileManager/initDB.php';

session_start();

$target_dir = "usercontent/";
$imageFileType = strtolower(pathinfo($_FILES["profile_photo"]["name"],PATHINFO_EXTENSION));
$target_file = $target_dir . uniqid() . '.' . $imageFileType;
$uploadOk = 1;
// Check if image file is a actual image or fake image
if(isset($_POST["submit"])) {
    $check = getimagesize($_FILES["profile_photo"]["tmp_name"]);
    if($check !== false) {
        $uploadOk = 1;
    } else {
        echo "File is not an image.";
        die();
        $uploadOk = 0;
    }
}
// Check if file already exists
if (file_exists($target_file)) {
    echo "Sorry, file already exists.";
    die();
    $uploadOk = 0;
}
// Check file size
if ($_FILES["profile_photo"]["size"] > 500000) {
    echo "Sorry, your file is too large.";
    die();
    $uploadOk = 0;
}
// Allow certain file formats
if($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg"
&& $imageFileType != "gif" ) {
    echo "Sorry, only JPG, JPEG, PNG & GIF files are allowed.";
    die();
    $uploadOk = 0;
}
// Check if $uploadOk is set to 0 by an error
if ($uploadOk == 0) {
    die();
// if everything is ok, try to upload file
} else {
    if (move_uploaded_file($_FILES["profile_photo"]["tmp_name"], $target_file)) {
        echo "https://sandboxcodes.com/$target_file";
    } else {
        echo "Sorry, there was an error uploading your file.";
    }
}
