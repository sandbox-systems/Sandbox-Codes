<?php

include 'fileManager/github/sync.php';
include_once 'fileManager/initDB.php';

require "checklogin.php";

session_start();

$user = getDocuments($man, "users", ['username' => $_SESSION['username']], [])[0];

?>

<!DOCTYPE html>
<html ng-app="castle">
<head>
    <link rel="icon" href="images/purplelogo.png">
    <link rel="stylesheet" href="css/animate.css">
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.13/css/all.css"
          integrity="sha384-DNOHZ68U8hZfKXOrtjWvjxusGo9WQnrNx2sqG0tfsghAvtVlRW3tvkXWZh58N9jp" crossorigin="anonymous">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular-sanitize.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/angular-ui-router/1.0.19/angular-ui-router.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@7.25.6/dist/sweetalert2.all.min.js"></script>
    <script src="https://www.gstatic.com/firebasejs/5.3.1/firebase.js"></script>
    <script src="Sandbox_Back/ace_editor/src-noconflict/ace.js" type="text/javascript" charset="utf-8"></script>
    <!--TODO Is this needed?-->
    <link rel="stylesheet" href="https://cdn.firebase.com/libs/firepad/1.4.0/firepad.css" />
    <script src="https://cdn.firebase.com/libs/firepad/1.4.0/firepad.min.js"></script>
    <script src="Sandbox_Back/playgroundCtrl.js"></script>
    <script src="fmRouter.js"></script>
    <script src="router.js"></script>
    <link rel="stylesheet" href="css/CastleStyle.css">
    <title>Sandbox</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1,height=device-height"/>
    <base href="/Castle.php">
</head>
<style>
    html {
        background-image: url("images/blur.jpg");
        background-position: center;
        background-size: cover;
        background-repeat: no-repeat;
    }

    body {
        height: 100%;
        font-family: "Lato";
        overflow: hidden;
        transition: background-color .5s;
        margin: 0 !important;
    }

    .searchoptions {
        position: relative;
        width: 90%;
        left: 5%;
        margin-top: 1%;
        height: 90%;
        background-color: rgba(256, 256, 256, 0.5);
        vertical-align: middle;
        font-size: 20px;
        border-radius: 50px;
        color: black;
        padding: 10px;
        transition: box-shadow .4s ease;
    }

    .searchoptions:hover {
        box-shadow: 0px 5px 8px 0px rgba(256, 256, 256, 0.4);
    }
</style>
<body>
<div id="mySidenav" style="    background-color: #8B4D93;" class="sidenav">
    <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
    <a>
        <div class="container" style="padding-left: 0px;">
            <img src="<?php echo $user->profilepic ?>" alt="PIC" class="image">
        </div>
    </a>
    <a href="https://sandboxcodes.com/index.html">Main Site</a>
    <a ui-sref="settings">Settings</a>
    <!--<a href="Pricing.html">Upgrade/Pricing</a>-->
    <a href="http://sandboxcodes.com/Login.html">Logout</a>
    <img src="images/white-logo.png" class="milk">
</div>
<div class="wrapper">
    <div id="routedTemplate" ui-view></div>
</div>
<div class="icon-bar" id="taskbar">
    <table style="height: 100%;">
        <tr>
            <td><a ui-sref="home"><img src="images/white-logo.png" class=otherpic></a></td>
        </tr>
        <tr>
            <td><a onClick="openSearch()" style="cursor: pointer"><i class="fas fa-search fa-2x"></i></a></td>
        </tr>
        <tr>
            <td><a ui-sref="playground"><i class="fas fa-terminal fa-2x"></i></a></td>
        </tr>
        <tr>
            <td><a ui-sref="treasury.projects"><i class="fas fa-archive fa-2x"></i></a></td>
        </tr>
        <tr>
            <td><a ui-sref="chat"><i class="fas fa-comments fa-2x"></i></a></td>
        </tr>
        <tr>
            <td><a ui-sref="notifications"><i class="fas fa-bell fa-2x"></i></a></td>
        </tr>
        <tr>
            <td><a onClick="openNav()" style="cursor: pointer"><img src="<?php echo $user->profilepic ?>" alt="Avatar"
                                                                    class="userpic"></a>
            </td>
        </tr>
    </table>
</div>
<div id="myOverlay" class="overlay animated fadeIn">
    <span class="closebtn" onclick="closeSearch()" title="Close Overlay">×</span>
    <div class="overlay-content" id="oc">
        <svg xmlns="http://www.w3.org/2000/svg" style="display:none">
            <symbol xmlns="http://www.w3.org/2000/svg" id="sbx-icon-search-22" viewBox="0 0 40 40">
                <path d="M24.382 25.485c-1.704 1.413-3.898 2.263-6.292 2.263-5.42 0-9.814-4.36-9.814-9.736 0-5.377 4.394-9.736 9.814-9.736s9.815 4.36 9.815 9.736c0 2.126-.687 4.093-1.853 5.694l5.672 5.627-1.73 1.718-5.612-5.565zM20 40c11.046 0 20-8.954 20-20S31.046 0 20 0 0 8.954 0 20s8.954 20 20 20zm-1.91-14.686c4.065 0 7.36-3.27 7.36-7.302 0-4.033-3.295-7.302-7.36-7.302s-7.36 3.27-7.36 7.302c0 4.033 3.295 7.302 7.36 7.302z"
                      fill-rule="evenodd"/>
            </symbol>
            <symbol xmlns="http://www.w3.org/2000/svg" id="sbx-icon-clear-5" viewBox="0 0 20 20">
                <path d="M10 20c5.523 0 10-4.477 10-10S15.523 0 10 0 0 4.477 0 10s4.477 10 10 10zm1.35-10.123l3.567 3.568-1.225 1.226-3.57-3.568-3.567 3.57-1.226-1.227 3.568-3.568-3.57-3.57 1.227-1.224 3.568 3.568 3.57-3.567 1.224 1.225-3.568 3.57zM10 18.272c4.568 0 8.272-3.704 8.272-8.272S14.568 1.728 10 1.728 1.728 5.432 1.728 10 5.432 18.272 10 18.272z"
                      fill-rule="evenodd"/>
            </symbol>
        </svg>
        <div class="animated bounceInRight">
            <form novalidate="novalidate" id="covers" onsubmit="return false;" class="searchbox sbx-custom">
                <div id="outputs" role="search" class="sbx-custom__wrapper">
                    <input type="search" name="search" placeholder="Search Sandbox" id="sbxx" autocomplete="off"
                           required="required" class="sbx-custom__input">
                    <button type="submit" title="Submit your search query." class="sbx-custom__submit">
                        <svg role="img" aria-label="Search">
                            <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#sbx-icon-search-22"></use>
                        </svg>
                    </button>
                    <button type="reset" title="Clear the search query." class="sbx-custom__reset"
                            style="display: none;">
                        <svg role="img" aria-label="Reset">
                            <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#sbx-icon-clear-5"></use>
                        </svg>
                    </button>
                    <div class="searchoptions animated bounceIn" onclick="searchSO()" id="so" style="cursor: pointer;display: none">
                        <i class="fab fa-stack-overflow" style="margin-right: 3%;"></i> Search on Stack Overflow...
                    </div>
                    <div onclick="searchGoogle()" class="searchoptions animated bounceIn" id="go"
                         style="cursor: pointer;display: none;"><i class="fab fa-google" style="margin-right: 3%;"></i> Search on
                        Google...
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
</body>
<script>
    function openNav() {
        document.getElementById("mySidenav").style.width = "250px";
        //document.getElementById("main").style.marginLeft = "250px";
        document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
    }

    function closeNav() {
        document.getElementById("mySidenav").style.width = "0";
        //document.getElementById("main").style.marginLeft = "0";
        document.body.style.backgroundColor = "rgba(0,0,0,0)";
    }

    // function openNav1() {
    //     document.getElementById("mySidenav1").style.width = "250px";
    //    // document.getElementById("main").style.marginLeft = "250px";
    //     document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
    // }
    //
    // function closeNav1() {
    //     document.getElementById("mySidenav1").style.width = "0";
    //     //document.getElementById("main").style.marginLeft = "0";
    //     document.body.style.backgroundColor = "white";
    // }

    function openSearch() {
        document.getElementById("routedTemplate").style.filter = "blur(13px)";
        document.getElementById("taskbar").style.filter = "blur(13px)";
        document.getElementById("myOverlay").className = "overlay animated fadeIn";
        document.getElementById("myOverlay").style.display = "block";
    }

    function closeSearch() {
        document.getElementById("myOverlay").className = "overlay animated fadeOut";
        document.getElementById("myOverlay").style.display = "none";
        document.getElementById("routedTemplate").style.filter = "blur(0px)";
        document.getElementById("taskbar").style.filter = "blur(0px)";
        document.getElementById("so").style.display = "none";
        document.getElementById("go").style.display = "none";
        $('#sbxx').val("");
        $('#outputs').find('*').not('input').not('button').not('i').not('#so').not('#go').remove();
    }

    document.querySelector('.searchbox [type="reset"]').addEventListener('click', function () {
        this.parentNode.querySelector('input').focus();
    });

    function searchGoogle() {
        var x = document.getElementById("sbxx").value;
        window.location.replace("https://www.google.com/search?q=" + x);
    }

    function searchSO() {
        var x = document.getElementById("sbxx").value;
        window.location.replace("https://www.stackoverflow.com/search?q=" + x);
    }

    document.getElementById("sbxx").oninput = function () {
        document.getElementById("so").className = "searchoptions animated bounceIn";
        document.getElementById("go").className = "searchoptions animated bounceIn";
        document.getElementById("so").style.display = "block";
        document.getElementById("go").style.display = "block";
        if (document.getElementById("sbxx").value == "") {
            document.getElementById("so").className = "searchoptions animated bounceOut";
            document.getElementById("go").className = "searchoptions animated bounceOut";
        }
        document.getElementById("oc").style.top = "20%";
    };

    /*document.getElementById("sbxx").onblur = function(){
        document.getElementById("so").className = "searchoptions animated bounceOut";
        document.getElementById("go").className = "searchoptions animated bounceOut";
        document.getElementById("oc").style.top = "46%";}*/

    function addOutput(output, type) {
        var div = document.createElement('DIV');
        div.className = "searchoptions animated bounceIn";
        var icon = document.createElement('I');
        icon.style.marginRight = "3%";
        if (type === 'user') {
            icon.className = 'fas fa-user-circle';
        } else if (type === 'chatroom') {
            icon.className = 'fas fa-comments';
            div.onclick = function () {
                location.href = "luau?group=" + output.name;
                closeSearch();
            };
        } else if (type === 'repo') {
            icon.className = 'fas fa-book';
        } else if (type === 'folder') {
            icon.className = "fas fa-folder-open";
        } else if (type === 'file') {
            icon.className = "fas fa-file";
        } else if (type === 'error') {
            icon.className = "fas fa-exclamation-triangle";
            if (output === "Sync Github Account") {
                div.onclick = function() {
                    location.href = "settings";
                    closeSearch();
                }
            }
        }
        div.appendChild(icon);
        let span = document.createElement("SPAN");
        span.innerHTML = (output['name'] || output) + '&nbsp;&nbsp;&nbsp;&nbsp;';
        div.appendChild(span);
        if (type === 'user') {
            let addOrRemoveFriendBtn = document.createElement("I");
            addOrRemoveFriendBtn.className = 'fas ' + (!(output.isFriend || output.isRequested) ? 'fa-user-plus' : '');
            addOrRemoveFriendBtn.style.cursor = "pointer";
            addOrRemoveFriendBtn.onclick = function() {
                if (!output.isFriend) {
                    $.ajax({
                        type: "POST",
                        url: "addFriend.php",
                        data: {
                            user: output.username
                        },
                        success: function (res, status, jqXHR) {
                            Object.keys(res).forEach(key => {
                                if (!isNaN(key)) {
                                    addOutput(res[key], res['type']);
                                }
                            });
                        },
                        dataType: 'json'
                    });
                    this.remove();
                }
            };
            div.appendChild(addOrRemoveFriendBtn);
        } else {
            if (type !== 'error' || output === "Sync Github Account")
                div.style.cursor = "pointer";
        }
        document.getElementById('outputs').insertBefore(div, document.getElementById('so'));
    }

    $('#sbxx').on('input', function () {
        let val = $('#sbxx').val();
        $('#outputs').find('*').not('input').not('button').not('i').not('#so').not('#go').remove();
        if (val !== "") {
            $.ajax({
                type: "POST",
                url: "searchQueries.php",
                data: {
                    input: val
                },
                success: function (res, status, jqXHR) {
                    if (res.hasOwnProperty('notsynced')) {
                        res.notsynced.forEach(result => {
                            addOutput(result === "" ? "Sync Github Account" : result + " hasn't synced his/her Github account yet", "error");
                        });
                        return;
                    }
                    Object.keys(res).forEach(key => {
                        if (!isNaN(key)) {
                            addOutput(res[key], res['type']);
                        }
                    });
                },
                error: function (res, status, xhttp) {
                    if (res.responseText === "UNSYNCED") {
                        closeSearch();
                        location.href = "settings";
                    }
                },
                dataType: 'json'
            });
        }
    });
</script>
</html>
