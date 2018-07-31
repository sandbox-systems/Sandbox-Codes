<?php

include 'fileManager/github/sync.php';
include_once 'fileManager/initDB.php';

session_start();
//$user = getDocuments($man, "users", ['username' => 'jdoe1'], [])[0];
$user = getDocuments($man, "users", ['username' => $_SESSION['username']], [])[0];

?>

<!DOCTYPE html>
<html>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
<!--<link rel="stylesheet" href="css/style.css" type="text/css">-->
<link rel="stylesheet" href="css/animate.css">
<link rel="stylesheet" href="css/SettingsStyle.css">
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@7.25.6/dist/sweetalert2.all.min.js"></script>
<style>
    input {
        outline: none;
        border: none;
    }

    #imageUpload {
        display: none;
    }

    #profileImage {
        cursor: pointer;
    }

    #profile-container {
        margin-top: 10%;
        width: 150px;
        height: 150px;
        overflow: hidden;
        -webkit-border-radius: 50%;
        -moz-border-radius: 50%;
        -ms-border-radius: 50%;
        -o-border-radius: 50%;
        border-radius: 50%;
        border: solid 2px white;
    }

    #profile-container img {
        object-fit: cover;
        width: 150px;
        height: 150px;
        overflow: hidden;
    }

    .tooltip {
        position: relative;
        display: inline-block;
        border-bottom: 1px dotted black;
        font-family: "Lato";
        font-size: 15px;
    }

    .tooltip .tooltiptext {
        visibility: hidden;
        width: 220px;
        background-color: #555;
        color: #fff;
        text-align: center;
        border-radius: 6px;
        padding: 5px 0;
        position: absolute;
        z-index: 1;
        bottom: 125%;
        left: 25%;
        margin-left: -60px;
        opacity: 0;
        transition: opacity 0.3s;
    }

    .tooltip .tooltiptext::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 25%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: #555 transparent transparent transparent;
    }

    .tooltip:hover .tooltiptext {
        visibility: visible;
        opacity: 1;
    }

    .alonebutton {
        margin-left: 70%;
        width: 100%;
        outline: none;
        border: 0;
        color: white;
        font-size: 1em;
        cursor: pointer;
        padding: 13px;
        text-decoration: none;
    }

    .alonebutton:hover {
        background-image: url('images/profileback.jpg');
    }
</style>
<body>
<!--<div id="preloader">
  <div id="loader"></div>
</div>-->
<div class="settingscont">
    <div class="tempcont animated fadeIn">
        <div id="profile-container">
            <image id="profileImage" src="images/profiletemp.png"/>
        </div>
        <input id="imageUpload" type="file"
               name="profile_photo" placeholder="Photo" required="" capture>
    </div>

    <table style="width: 100%">
        <tr class="animated fadeIn">
            <td>
                <a href="<?php echo $url; ?>" id="sync" class="categ_row alonebutton">Sync Github Account</a>
            </td>
        </tr>
        <tr class="animated fadeIn">
            <td>
                <div class="categ_row">
                    <div class="text">Name</div>
                </div>
            </td>
            <td>
                <form class="login__row">
                    <input id="nameInput" class="login__input" type="text" value="<?php echo $user->name ?>">
                </form>
            </td>
        </tr>
        <tr class="animated fadeIn">
            <td>
                <div class="categ_row">
                    <div class="text">User Name</div>
                </div>
            </td>
            <td>
                <form class="login__row">
                    <input id="usernameInput" class="login__input" type="text" value="<?php echo $user->username ?>">
                </form>
            </td>
        </tr>
        <tr class="animated fadeIn">
            <td>
                <div class="categ_row">
                    <div class="text">Password</div>
                </div>
            </td>
            <td>
                <form class="update_row">
                    <input style="margin-left: 2%;" class="theotherone" type="password" id="password" oninput="passwordCheck()">
                    <label class="switch">
                        <input value="None" type="checkbox"
                               onchange="document.getElementById('password').type = this.checked ? 'text' : 'password'">
                        <span class="slider"></span>
                    </label>
                </form>
            </td>
        </tr>
        <tr style="display: none;" class="animated fadeIn" id="rpholder">
            <td>
                <div class ="categ_row"
                    <div class="text">Reinput Password</div>
                </div>
            </td>
            <td>
                <form class="login_row">
                    <input style="margin-left: 2%;"class="login__input" type="password" id="rpassword">
                </form>
            </td>
        </tr>
        <tr class="animated fadeIn">
            <td>
                <div class="categ_row">
                    <div class="text">Contact</div>
                </div>
            </td>
            <td>
                <form class="login__row">
                    <input id="emailInput" class="login__input" type="email" value="<?php echo isset($user->email) ? $user->email : "" ?>">
                </form>
            </td>
        </tr>
        <tr class="animated fadeIn">
            <td>
                <button class="alonebutton" id="updateProfileSubmitBtn">Save Changes</button>
            </td>
        </tr>
        <!--<tr class="animated fadeIn">
        <td>
            <div class=" tooltip categ_row"><span class="tooltiptext">Relax Mode uses the Pomodoro technique to provide you breaks in pre-scheduled time to increase creativity and efficiency</span><div class="text">Relax Mode</div></div>
        </td>
        <td>
            <label class="switch" style="float: left; width: 90%;right:0;">
                <input value="None" type="checkbox">
                <span class="slider"></span>
                </label>
        </td>
        </tr>-->
    </table>
</div>
</body>
<script>
    var passwordB = 'true';
    function passwordCheck(){
        var initial = document.getElementById('password');
        var rp = document.getElementById('rpholder');
        rp.style.display="block";
        if(document.getElementById('rpassword').value === initial){
            passwordB = true;
        }else{
            passwordB = false;
        }
    }
    jQuery(document).ready(function ($) {
        $(window).on("load", function () {

            $("#preloader").fadeOut(500);

        });
    });
    $("#profileImage").click(function (e) {
        $("#imageUpload").click();
    });

    function fasterPreview(uploader) {
        if (uploader.files && uploader.files[0]) {
            $('#profileImage').attr('src',
                window.URL.createObjectURL(uploader.files[0]));
        }
    }

    $("#imageUpload").change(function () {
        fasterPreview(this);
    });

    $('#updateProfileSubmitBtn').click(function () {
        if(passwordB) {
            $.ajax({
                type: "POST",
                url: "updateProfile.php",
                data: {
                    'name': $('#nameInput').val(),
                    'username': $('#usernameInput').val(),
                    'email': $('#emailInput').val()
                },
                success: function (data, status, xhttp) {
                },
                dataType: 'json'
            });
            swal({
                position: 'top-end',
                type: 'success',
                title: 'Your settings have been saved',
                showConfirmButton: false,
                timer: 1500
            });
        }else{
            swal('Whoops!','Check your password','error');
        }
    });
</script>
</html>