<?php
/*
    @author Aadhithya Kannan
    @date   20 November 2017
    COPYRIGHT SANDBOX SYSTEMS LLC
*/
require "../fileManager/initDB.php";
require "../checklogin.php";
$text = json_decode(file_get_contents("languages/en-US.json"), true);

$notes = getDocuments($man, "users", ["username" => $_SESSION['username']], [])[0]->notes;
?>

<!DOCTYPE HTML>
<html lang="en">
<head>
    <title><?php echo $text["title"]; ?></title>
    <link rel="stylesheet" type="text/css" href="Sandbox_Back/css/playground.css"/>
    <link href="Sandbox_Back/node_modules/fine-uploader/all.fine-uploader/fine-uploader-new.css" rel="stylesheet">
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.1.1/css/all.css"
          integrity="sha384-O8whS3fhG2OnA5Kas0Y9l3cfpmYjapjI0E4theH4iuMD+pLhbf6JI0jIMfYcK3yZ" crossorigin="anonymous">
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular-sanitize.js"></script>
    <script src="Sandbox_Back/ace_editor/src-noconflict/ext-language_tools.js"></script>
</head>
<style>
    .notenav {
        height: 100%;
        width: 0;
        position: fixed;
        z-index: 10;
        top: 0;
        right: 0;
        background-color: rebeccapurple;
        overflow-x: hidden;
        transition: 0.5s;
        padding-top: 60px;
        border-left: solid 5px mediumpurple;
    }

    .notenav a {
        padding: 8px 8px 8px 32px;
        text-decoration: none;
        font-size: 25px;
        color: #818181;
        display: inline-block;
        transition: 0.3s;
    }

    .notenav a:hover {
        color: #f1f1f1;
    }

    .sidenav .notenav {
        position: absolute;
        top: 0;
        right: 25px;
        font-size: 36px;
        margin-left: 50px;
    }


    @media screen and (max-height: 450px) {
        .notenav {padding-top: 15px;}
        .notenav a {font-size: 18px;}
    }
    textarea{
        width:100%;
        height:83%;
        resize: none;
    }

</style>
<body style="background-color:rgba(255,255,255,0.2);">
<div id="notenavv" class="notenav">
    <a href="javascript:void(0)" onclick="saveNotes()"><i class="fas fa-save"></i></a>
    <a href="javascript:void(0)" style="float:right;" class="closebtn" onclick="closeNoteNav()">&times;</a>
    <textarea id="notesContent"><?php echo $notes ?></textarea>
</div>

<div id="commitModal" class="modal">
    <div class="modal-content">
        <div class="modal-body">
            <form class="animated fadeIn">
                <fieldset>
                    <label>Files Changed</label>
                    <ul id="changesList" style="overflow: scroll;max-height: 100px;">
                    </ul>
                </fieldset>
                <input type="text" id="commitMessageInput" class="inputname" placeholder="Commit Message"
                       title="Commit Message" style="margin-top: 2%">
                <div style="background-color:red; margin-top:7%;margin-right: 20%;margin-left: 9%;" class="goBtn"
                     onclick="document.getElementById('commitModal').style.display='none'">
                    Cancel
                </div>
                <div style="background-color:green; margin-top:7%" onclick="commitChanges()" class="goBtn" id="commitBtn">
                    Go Ahead!
                </div>
            </form>
        </div>
    </div>
</div>
<div id="entryModal" class="modal">

    <!-- Modal content -->
    <div class="modal-content" style="border-radius: 15px">
        <div class="modal-header" id="fileheader">Create New File!</div>
        <div class="modal-header" id="folderheader" style="display: none;">Create New Folder!</div>
        <div class="modal-body">
            <!--<fieldset style="    margin-top: 1%;">
                <label class="switch">
                    <input value="None" type="checkbox" id="letscheck" onchange="switcher()">
                    <span class="slider"></span>
                </label>
            </fieldset>-->
            <form id="fileform" class="animated fadeIn">
                <fieldset style="    margin-top: 2%;">
                    Filename:<br>
                    <input id="filename" class="inputname" type="text" oninput="typeUpdater()" autocomplete="off"
                           required>
                </fieldset>
<!--                <fieldset style="    margin-top: 2%;">-->
<!--                    File type:-->
<!--                    <select id="filechoose">-->
<!--                        <option value="java">Java</option>-->
<!--                        <option value="python">Python</option>-->
<!--                        <option value="javascript">JavaScript</option>-->
<!--                        <option value="html">HTML</option>-->
<!--                        <option value="css">CSS</option>-->
<!--                        <option value="cplusplus">C++</option>-->
<!--                        <option value="objc">Objective-C</option>-->
<!--                        <option value="csharp">C#</option>-->
<!--                        <option value="ruby">Ruby</option>-->
<!--                    </select>-->
<!--                </fieldset>-->
                <fieldset style="    margin-top: 2%;">
                    <div style="float:right; background-color:green; margin-right: 5%" class="goBtn" onclick="createFile(null, null)">Create</div>
                    <div style="float:left; background-color:#FF3366; margin-left: 5%;" class="goBtn" onclick="document.getElementById('entryModal').style.display='none'">Cancel</div>
                </fieldset>
            </form>
            <form id="folderform" style="display: none;" class="animated fadeIn">
                <fieldset style="    margin-top: 2%;">
                    Foldername:<br>
                    <input id="foldername" class="inputname" type="text" autocomplete="off">
                </fieldset>
                <fieldset style="    margin-top: 2%;">
                    <div style="float:right; background-color:green;margin-right: 5% " class="goBtn" ng-click="">Create</div>
                    <div style="float:left; background-color:#FF3366; margin-left:5%" class="goBtn" onclick="document.getElementById('entryModal').style.display='none'">Cancel</div>
                </fieldset>
            </form>
        </div>
    </div>
</div>

<!-- *************************************************** -->
<!-- ********************* DOWNLOAD ******************** -->
<!-- *************************************************** -->
<iframe id="download"></iframe>

<!-- *************************************************** -->
<!-- ********************* TOOLBAR ********************* -->
<!-- *************************************************** -->
<nav class="navbar-default" style="background:url('../images/blur.jpg');background-size: cover">
    <div class="container-fluid">
        <div class="navbar-header" style="width: 20%">
            <button class="dropdown btn navbar-btn toolbarButton">
                <a class="dropdown-toggle" data-toggle="dropdown"><span style="color:white"
                                                                                 class="fas fa-ellipsis-h fa-2x"></span></a>
                <ul class="dropdown-menu">
                    <li><a href="javascript:temper('chrome')">chrome</a></li>
                    <li><a href="javascript:temper('clouds')">clouds</a></li>
                    <li><a href="javascript:temper('clouds_midnight')">clouds_midnight</a></li>
                    <li><a href="javascript:temper('cobalt')">cobalt</a></li>
                    <li><a href="javascript:temper('crimson_editor')">crimson_editor</a></li>
                    <li><a href="javascript:temper('dawn')">dawn</a></li>
                    <li><a href="javascript:temper('eclipse')">eclipse</a></li>
                    <li><a href="javascript:temper('idle_fingers')">idle_fingers</a></li>
                    <li><a href="javascript:temper('kr_theme')">kr_theme</a></li>
                    <li><a href="javascript:temper('merbivore')">merbivore</a></li>
                    <li><a href="javascript:temper('merbivore_soft')">merbivore_soft</a></li>
                    <li><a href="javascript:temper('mono_industrial')">mono_industrial</a></li>
                    <li><a href="javascript:temper('monokai')">monokai</a></li>
                    <li><a href="javascript:temper('pastel_on_dark')">pastel_on_dark</a></li>
                    <li><a href="javascript:temper('solarized_dark')">solarized_dark</a></li>
                    <li><a href="javascript:temper('solarized_light')">solarized_light</a></li>
                    <li><a href="javascript:temper('text_mate')">text_mate</a></li>
                    <li><a href="javascript:temper('tomorrow')">tomorrow</a></li>
                    <li><a href="javascript:temper('tomorrow_night')">tomorrow_night</a></li>
                    <li><a href="javascript:temper('tomorrow_night_blue')">tomorrow_night_blue</a></li>
                    <li><a href="javascript:temper('tomorrow_night_bright')">tomorrow_night_bright</a></li>
                    <li><a href="javascript:temper('tomorrow_night_eighties')">tomorrow_night_eighties</a></li>
                    <li><a href="javascript:temper('twilight')">twilight</a></li>
                    <li><a href="javascript:temper('vibrant_ink')">vibrant_ink</a></li>
                </ul>
            </button>
            <button type="button" id="btn-add-tab" onclick="javascript:showCommitModal()"
                    class="btn navbar-btn toolbarButton"><i class="fas fa-save fa-2x"></i></button>
            <button onclick="chooseRepo()" class="btn navbar-btn toolbarButton"><i class="fas fa-book fa-2x"></i>
            </button>
            <button value="" onclick="document.getElementById('entryModal').style.display='block'"
                    class="btn navbar-btn toolbarButton"><i class="fas fa-plus fa-2x"></i></button>
            <button value="" id="runButton" class="btn navbar-btn toolbarButton" onclick="compile()"><i class="fas fa-play fa-2x"></i>
            </button>
            <!--                        <!--<button type="button" id="btn-add-tab" class="btn btn-primary pull-right">Add Tab</button>-->
        </div>
        <div class="nav navbar-nav navbar-right" style="	margin-top:0.5%;
	margin-right: 3%;">
<!--            <img class="bordered-circle-green" src="https://ui-avatars.com/api/?size=40&background=a0a0a0&rounded=true">-->
<!--            <img src="https://ui-avatars.com/api/?size=40&background=a0a0a0&rounded=true">-->
<!--            <img src="https://ui-avatars.com/api/?size=40&background=a0a0a0&rounded=true">-->
            <button onclick="openNoteNav()" id="addpeople"><span class="fas fa-sticky-note"></span></button>
        </div>
    </div>
</nav>
<div id="leftcol">
    <!-- *************************************************** -->
    <!-- ******************* FILE MANAGER ****************** -->
    <!-- *************************************************** -->
    <div id="filemanager">
        <ul style="color: white;white-space: nowrap;padding-left: 0px;height: 100vh" ng-bind-html="scan"></ul>
    </div>

    <!-- *************************************************** -->
    <!-- ******************* CURSOR MENUS ****************** -->
    <!-- *************************************************** -->
<!--    <div id="foldermenu">-->
<!--        <li id="folderNewFile" class="contextMenuItem"><span class="fas fa-file"></span> --><?php //echo $text["newFile"]; ?>
<!--        </li>-->
<!--        <li id="folderNewFolder" class="contextMenuItem"><span-->
<!--                    class="fas fa-folder"></span> --><?php //echo $text["newFolder"]; ?><!--</li>-->
<!--        <li id="folderRenameFolder" class="contextMenuItem"><span-->
<!--                    class="fas fa-pencil-alt"></span> --><?php //echo $text["renameFolder"]; ?><!--</li>-->
<!--        <li id="folderDuplicateFolder" class="contextMenuItem"><span-->
<!--                    class="fas fa-copy"></span> --><?php //echo $text["duplicateFolder"]; ?><!--</li>-->
<!--        <div class="lineBreak"></div>-->
<!--        <li id="folderDownloadFolder" class="contextMenuItem"><span-->
<!--                    class="fas fa-cloud-download-alt"></span> --><?php //echo $text["downloadFolder"]; ?><!--</li>-->
<!--        <li id="folderUpload" class="contextMenuItem"><span-->
<!--                    class="fas fa-cloud-upload-alt"></span> --><?php //echo $text["upload"]; ?><!--</li>-->
<!--        <div class="lineBreak"></div>-->
<!--        <li id="folderEmpty" class="contextMenuItem"><span-->
<!--                    class="fas fa-folder-open"></span> --><?php //echo $text["emptyFolder"]; ?><!--</li>-->
<!--        <li id="folderDelete" class="contextMenuItem"><span-->
<!--                    class="fas fa-trash"></span> --><?php //echo $text["deleteFolder"]; ?><!--</li>-->
<!--        <div class="lineBreak"></div>-->
<!--        <li id="folderRefresh" class="contextMenuItem"><span-->
<!--                    class="fas fa-sync-alt"></span> --><?php //echo $text["refreshFiles"]; ?><!--</li>-->
<!--    </div>-->
<!---->
    <div id="filemenu">
<!--        <li id="folderNewFile" class="contextMenuItem"><span class="fas fa-file"></span> --><?php //echo $text["newFile"]; ?>
<!--        </li>-->
<!--        <li id="folderNewFolder" class="contextMenuItem"><span-->
<!--                    class="fas fa-folder"></span> --><?php //echo $text["newFolder"]; ?><!--</li>-->
<!--        <li id="folderRenameFolder" class="contextMenuItem"><span-->
<!--                    class="fas fa-pencil-alt"></span> --><?php //echo $text["renameFile"]; ?><!--</li>-->
<!--        <li id="folderDuplicateFolder" class="contextMenuItem"><span-->
<!--                    class="fas fa-copy"></span> --><?php //echo $text["duplicateFile"]; ?><!--</li>-->
<!--        <div class="lineBreak"></div>-->
<!--        <li id="folderDownloadFolder" class="contextMenuItem"><span-->
<!--                    class="fas fa-cloud-download-alt"></span> --><?php //echo $text["downloadFolder"]; ?><!--</li>-->
<!--        <li id="folderUpload" class="contextMenuItem"><span-->
<!--                    class="fas fa-cloud-upload-alt"></span> --><?php //echo $text["upload"]; ?><!--</li>-->
<!--        <div class="lineBreak"></div>-->
        <li id="fileDelete" class="contextMenuItem"><span
                   class="fas fa-trash"></span><?php echo $text["deleteFile"]; ?></li>
        <li id="fileRename" class="contextMenuItem"><span
                   class="fas fa-edit"></span><?php echo $text["renameFile"]; ?></li>
        <li id="fileDuplicate" class="contextMenuItem"><span
                   class="fas fa-copy"></span><?php echo $text["duplicateFile"]; ?></li>
        <li id="fileDownload" class="contextMenuItem"><span
                   class="fas fa-download"></span><?php echo $text["downloadFile"]; ?></li>
<!--        <div class="lineBreak"></div> -->
<!--        <li id="folderRefresh" class="contextMenuItem"><span-->
<!--                    class="fas fa-sync-alt"></span> --><?php //echo $text["refreshFiles"]; ?><!--</li>-->
    </div>
</div>
<!-- *************************************************** -->
<!-- ***************** ACE CODE EDITOR ***************** -->
<!-- *************************************************** -->
<div class="rightcol">
    <ul id="tab-list" class="nav navbar-nav nav-tabs">
    </ul>
    <div id="editorContainer"></div>

    <!-- *************************************************** -->
    <!-- ******************** TERMINAL ********************* -->
    <!-- *************************************************** -->
    <div id="terminal">
        <iframe id="consoleFrame" src="https://sandboxcodes.com:7681/" width=100% height=100%></iframe>
    </div>

    <script>
        chooseRepo();
        function openNoteNav() {
            document.getElementById("notenavv").style.width = "250px";
            //document.getElementById("main").style.marginLeft = "250px";
            //document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
        }

        function closeNoteNav() {
            document.getElementById("notenavv").style.width = "0";
            //document.getElementById("main").style.marginLeft= "0";
            //document.body.style.backgroundColor = "white";
        }
        function showCommitModal() {
            document.getElementById('commitModal').style.display = 'block';
            $('#onFileReadOverlay').fadeIn();
            $.ajax({
                type: "POST",
                url: 'fileManager/requests/getLocalChanges.php',
                data: {
                    owner: owner,
                    repo: repo,
                    branch: branch
                },
                success: function (data, status, xhttp) {
                    $('#onFileReadOverlay').fadeOut();
                    $('#changesList').empty();
                    let changesList = document.getElementById('changesList');
                    data.forEach(datum => {
                        let li = document.createElement('LI');
                        let additions = document.createElement('SPAN');
                        additions.innerText = '+' + datum.additions + ' ';
                        additions.style.color = "#28a745";
                        let deletions = document.createElement('SPAN');
                        deletions.innerText = '-' + datum.deletions + '  ';
                        deletions.style.color = "#dc3545";
                        let name = document.createElement('SPAN');
                        name.innerText = datum.name;
                        li.appendChild(additions);
                        li.appendChild(deletions);
                        li.appendChild(name);
                        changesList.appendChild(li);
                    });
                },
                error: function (data, status, xhttp) {
                    $('#onFileReadOverlay').fadeOut();
                },
                dataType: 'json'
            });
        }

        function switcher() {
            if (document.getElementById("letscheck").checked === true) {
                document.getElementById("fileform").style.display = "none";
                document.getElementById("folderform").style.display = "block";
                document.getElementById("fileheader").style.display = "none";
                document.getElementById("folderheader").style.display = "block";
            } else {
                document.getElementById("fileform").style.display = "block";
                document.getElementById("folderform").style.display = "none";
                document.getElementById("fileheader").style.display = "block";
                document.getElementById("folderheader").style.display = "none";
            }
        }

        // function typeUpdater() {
        //     var name = document.getElementById("filename").value;
        //     var array = [".java", ".py", ".js", ".html", ".css", ".cpp", ".cs", ".m", ".rb"];
        //     var actual = ["java", "python", "javascript", "html", "css", "cplusplus", "csharp", "objc", "ruby"];
        //     var temp = "";
        //     for (i = 0; i < array.length; i++) {
        //         if (name.substring(name.indexOf(".")) === array[i]) {
        //             temp = actual[i];
        //             document.getElementById("filechoose").value = actual[i];
        //         }
        //     }
        // }

        function temper(theme) {
            // var editor = ace.edit('editor');
            editor.setTheme("ace/theme/" + theme);
        }

        $(document).ready(function () {
            /****************************************************
             *********** ACTIVE DIRECTORY VARIABLES *************
             ****************************************************/
                //active directory files
            var active_dir = "/Applications/MAMP/htdocs/Sandbox 2.0/Users/aadhi0319";
            var objhash = "";
            var active_file = "";
            var activeRight = "";
            var activeRightElem = null;
            var ext = "";
            var name = "";
            var numTabs = 0;
            //debug variables
            var debug = true;
            var breakpointAnchors = [];

            /****************************************************
             **************** ACE CODE EDITOR  *******************
             ****************************************************/
            /*ace.require("ace/ext/language_tools");
            // editor = ace.edit("editor");
            editor.setOptions({
                enableBasicAutocompletion: true,
                enableSnippets: true,
                enableLiveAutocompletion: false
            });
            editor.setTheme("ace/theme/chrome");
            editor.getSession().setMode("ace/mode/java");
            editor.getSession().on('change', function() {
                //save(editor, false);
            });

            /****************************************************
             *************** ACE CODE DEBUGGER  *****************
             ****************************************************
            editor.on("guttermousedown", function (e) {
                if (debug) {
                    var target = e.domEvent.target;
                    if (target.className.indexOf("ace_gutter-cell") == -1) //make sure that user clicked on a gutter cell
                        return;
                    var breakpoints = e.editor.session.getBreakpoints(row, 0);
                    var row = e.getDocumentPosition().row;
                    if (typeof breakpoints[row] === typeof undefined) { //add breakpoint
                        e.editor.session.setBreakpoint(row);
                        breakpointAnchors.push(editor.getSession().getDocument().createAnchor(row, 0));
                        breakpointAnchors[breakpointAnchors.length - 1].on("change", function (element) {
                            e.editor.session.clearBreakpoint(element.old.row); //moves breakpoint in sync with line of code
                            e.editor.session.setBreakpoint(element.value.row);
                        });
                    } else { //delete breakpoint
                        e.editor.session.clearBreakpoint(row);
                        breakpointAnchors.forEach(function (element, index) {
                            if (row == element.row) {
                                element.detach();
                                breakpointAnchors.splice(index, 1);
                            }
                        });
                    }
                    e.stop();
                }
            });*/

            /****************************************************
             **************** HELPER FUNCTIONS ******************
             ****************************************************/
            /*function compile(in_editor) {
                $.ajax({
                    type: "POST",
                    url: "compile2.php",
                    data: {
                        code: in_editor.getValue(),
                        filepath: active_file
                    },
                    dataType: "text",
                    success: function (data) {
                        if (data) {
                            var htmldiv = document.createElement("div");
                            htmldiv.innerHTML = data;
                            swal({
                                content: htmldiv,
                                className: "swal-compiled",

                            });
                        } else {
                            $("#consoleFrame").attr("src", "http://localhost:7680/");
                            const socket = new WebSocket('ws://localhost:7680');
                            socket.addEventListener('close', function (event) {
                                $("#consoleFrame").attr("src", "http://localhost:7681/");
                            });
                        }
                    }
                });
            }*/

            function save(in_editor, notify) {
                $.ajax({
                    type: "POST",
                    url: "saveFile.php",
                    data: {
                        code: in_editor.getValue(),
                        path: active_file
                    },
                    dataType: "text",
                    success: function (data) {
                        if (notify)
                            swal({type: "success", timer: 1000});
                    },
                    error: function (data) {
                        if (notify)
                            swal({type: "error", timer: 1000});
                    }
                });
            }

            //not yet tested
            /*function readFile(filepath) {
                $.ajax({
                    type: "POST",
                    url: "readFile.php",
                    data: {
                        path: filepath
                    },
                    dataType: "text",
                    success: function (data) {
                        editor.setValue(data, -1);
                        editor.getSession().setMode("ace/mode/" + ext);
                    }
                });
            }*/

            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            /****************************************************
             ************* HELPER FUNCTIONS (FILES) *************
             ****************************************************/
            function createFile(in_editor) {
                swal({
                    content: {
                        element: "input",
                        attributes: {
                            placeholder: "sandbox.txt",
                            type: "text",
                        },
                    },
                    text: "<?php echo $text["createFilePrompt"]; ?>"
                }).then((value) => {
                    ext = value.split(".")[1];
                    active_file = active_dir + "<?php echo DIRECTORY_SEPARATOR; ?>" + value;
                    $.ajax({
                        type: "POST",
                        url: "newFile.php",
                        data: {
                            path: active_file
                        },
                        dataType: "text",
                        success: function (data) {
                            swal({type: "success", timer: 1000});
                            //replace with readfile later
                            $.ajax({
                                type: "POST",
                                url: "readFile.php",
                                data: {
                                    path: active_file
                                },
                                dataType: "text",
                                success: function (data) {
                                    editor.setValue(data, -1);
                                    editor.getSession().setMode("ace/mode/" + ext);
                                }
                            });
                            scan();
                        },
                        error: function (data) {
                            swal({type: "error", timer: 1000});
                        }
                    });
                });
            }

            /*function renameFile(filepath) {
                swal({
                    content: {
                        element: "input",
                        attributes: {
                            placeholder: "sandbox",
                            type: "text",
                        },
                    },
                    text: "<?php echo $text["renameFilePrompt"]; ?>"
                }).then((value) => {
                    var newdir = filepath.substring(0, filepath.lastIndexOf("/") + 1) + value;
                    $.ajax({
                        type: "POST",
                        url: "rename.php",
                        data: {
                            oldpath: filepath,
                            newpath: newdir
                        },
                        dataType: "text",
                        success: function (data) {
                            swal({type: "success", timer: 1000});
                            scan();
                        },
                        error: function (data) {
                            swal({type: "error", timer: 1000,});
                        }
                    });
                });
            }*/

            /*function duplicateFile(filepath) {
                $.ajax({
                    type: "POST",
                    url: "duplicateFile.php",
                    data: {
                        filepath: filepath
                    },
                    dataType: "text",
                    success: function (data) {
                        swal({type: "success", timer: 1000});
                        scan();
                    },
                    error: function (data) {
                        swal({type: "error", timer: 1000});
                    }
                });
            }*/

            //download.js v3.0, by dandavis; 2008-2014. [CCBY2] see http://danml.com/download.html for tests/usage
            // v1 landed a FF+Chrome compat way of downloading strings to local un-named files, upgraded to use a hidden frame and optional mime
            // v2 added named files via a[download], msSaveBlob, IE (10+) support, and window.URL support for larger+faster saves than dataURLs
            // v3 added dataURL and Blob Input, bind-toggle arity, and legacy dataURL fallback was improved with force-download mime and base64 support

            // data can be a string, Blob, File, or dataURL

            function download(data, strFileName, strMimeType) {
                var self = window, // this script is only for browsers anyway...
		u = "application/octet-stream", // this default mime also triggers iframe downloads
		m = strMimeType || u, 
		x = data,
		D = document,
		a = D.createElement("a"),
		z = function(a){return String(a);},

		B = self.Blob || self.MozBlob || self.WebKitBlob || z,
		BB = self.MSBlobBuilder || self.WebKitBlobBuilder || self.BlobBuilder,
		fn = strFileName || "download",
		blob, 
		b,
		ua,
		fr;

                //if(typeof B.bind === 'function' ){ B=B.bind(self); }

                if(String(this)==="true"){ //reverse arguments, allowing download.bind(true, "text/xml", "export.xml") to act as a callback
		    x=[x, m];
                    m=x[0];
                    x=x[1];
                }

                //go ahead and download dataURLs right away
                if(String(x).match(/^data\:[\w+\-]+\/[\w+\-]+[,;]/)){
		    return navigator.msSaveBlob ?  // IE10 can't do a[download], only Blobs:
			navigator.msSaveBlob(d2b(x), fn) : 
			saver(x) ; // everyone else can save dataURLs un-processed
                }//end if dataURL passed?

                try{
                    blob = x instanceof B ? 
		         x : 
                              new B([x], {type: m}) ;
                }catch(y){
		    if(BB){
		        b = new BB();
			b.append([x]);
			blob = b.getBlob(m); // the blob
                    }
                }
	function d2b(u) {
		var p= u.split(/[:;,]/),
		t= p[1],
		dec= p[2] == "base64" ? atob : decodeURIComponent,
		bin= dec(p.pop()),
		mx= bin.length,
		i= 0,
		uia= new Uint8Array(mx);

		for(i;i<mx;++i) uia[i]= bin.charCodeAt(i);

		return new B([uia], {type: t});
	 }
	  
	function saver(url, winMode){
		
		
		if ('download' in a) { //html5 A[download] 			
			a.href = url;
			a.setAttribute("download", fn);
			a.innerHTML = "downloading...";
			D.body.appendChild(a);
			setTimeout(function() {
				a.click();
				D.body.removeChild(a);
				if(winMode===true){setTimeout(function(){ self.URL.revokeObjectURL(a.href);}, 250 );}
			}, 66);
			return true;
		}
		
		//do iframe dataURL download (old ch+FF):
		var f = D.createElement("iframe");
		D.body.appendChild(f);
		if(!winMode){ // force a mime that will download:
			url="data:"+url.replace(/^data:([\w\/\-\+]+)/, u);
		}
		 
	
		f.src = url;
		setTimeout(function(){ D.body.removeChild(f); }, 333);
		
	}//end saver 
		

	if (navigator.msSaveBlob) { // IE10+ : (has Blob, but not a[download] or URL)
		return navigator.msSaveBlob(blob, fn);
	} 	
	
	if(self.URL){ // simple fast and modern way using Blob and URL:
		saver(self.URL.createObjectURL(blob), true);
	}else{
		// handle non-Blob()+non-URL browsers:
		if(typeof blob === "string" || blob.constructor===z ){
			try{
				return saver( "data:" +  m   + ";base64,"  +  self.btoa(blob)  ); 
			}catch(y){
				return saver( "data:" +  m   + "," + encodeURIComponent(blob)  ); 
			}
		}
		
		// Blob but not URL:
		fr=new FileReader();
		fr.onload=function(e){
			saver(this.result); 
		};
		fr.readAsDataURL(blob);
	}	
	return true;
} /* end download() */

            var downloadFile = function (name, fullPath) {
                readFile(hashes[fullPath], null, function (content) {
                    isReading = false;
                    $('#onFileReadOverlay').fadeOut();
                    download(content, name, "");
                });
                // document.getElementById("download").src = "downloadFile.php?filepath=" + encodeURIComponent(filepath);
            };

            /*function deleteFileLocal() {
                var deleteli = document.getElementsByClassName("file")[0]
                var path = deleteli.attributes["onclick"].value.split('", "')[1];
                var name = angular.element(deleteli).text().substring(1);
                deleteFile(path, name);
            }*/

            /****************************************************
             ************ HELPER FUNCTIONS (FOLDERS) *************
             ****************************************************/
            function createFolder() {
                swal({
                    content: {
                        element: "input",
                        attributes: {
                            placeholder: "sandbox",
                            type: "text",
                        },
                    },
                    text: "<?php echo $text["createFilePrompt"]; ?>"
                }).then((value) => {
                    active_dir += "<?php echo DIRECTORY_SEPARATOR; ?>" + value;
                    $.ajax({
                        type: "POST",
                        url: "newFolder.php",
                        data: {
                            folderpath: active_dir
                        },
                        dataType: "text",
                        success: function (data) {
                            swal({type: "success",  timer: 1000});
                            scan();
                        },
                        error: function (data) {
                            swal({type: "error",  timer: 1000});
                        }
                    });
                });
            }

            function renameFolder(filepath) {
                swal({
                    content: {
                        element: "input",
                        attributes: {
                            placeholder: "sandbox",
                            type: "text",
                        },
                    },
                    text: "<?php echo $text["renameFolderPrompt"]; ?>"
                }).then((value) => {
                    var newdir = filepath.substring(0, filepath.lastIndexOf("/") + 1) + value;
                    $.ajax({
                        type: "POST",
                        url: "rename.php",
                        data: {
                            oldpath: filepath,
                            newpath: newdir
                        },
                        dataType: "text",
                        success: function (data) {
                            swal({type: "success",  timer: 1000});
                            scan();
                        },
                        error: function (data) {
                            swal({type: "error",  timer: 1000});
                        }
                    });
                });
            }

            function duplicateFolder(folderpath) {
                $.ajax({
                    type: "POST",
                    url: "duplicateFolder.php",
                    data: {
                        folderpath: folderpath
                    },
                    dataType: "text",
                    success: function (data) {
                        swal({type: "success",  timer: 1000});
                        scan();
                    },
                    error: function (data) {
                        swal({type: "error",  timer: 1000});
                    }
                });
            }

            function downloadFolder(folderpath) {
                document.getElementById("download").src = "downloadFolder.php?folderpath=" + encodeURIComponent(folderpath);
            }

            function emptyFolder(folderpath) {
                swal({
                    title: "<?php echo $text["emptyFolderConfirmTitle"]; ?>",
                    text: "<?php echo $text["emptyFolderConfirmText"]; ?> \"" + folderpath.substring(folderpath.lastIndexOf("/") + 1) + "\".",
                    type: "warning",
                    buttons: true,
                    dangerMode: true,
                }).then((willDelete) => {
                    if (willDelete) {
                        $.ajax({
                            type: "POST",
                            url: "emptyFolder.php",
                            data: {
                                folderpath: folderpath
                            },
                            dataType: "text",
                            success: function (data) {
                                swal({
                                    type: "success",
                                    timer: 1000,
                                });
                                scan();
                            },
                            error: function (data) {
                                swal("<?php echo $text["emptyFolderError"]; ?>", {
                                    type: "error",
                                });
                                scan();
                            }
                        });
                    }
                });
            }

            function deleteFolder(folderpath) {
                swal({
                    title: "<?php echo $text["deleteFolderTitle"]; ?>",
                    text: "<?php echo $text["deleteFolderTextBefore"]; ?> \"" + folderpath.substring(folderpath.lastIndexOf("/") + 1) + "\" <?php echo $text["deleteFolderTextAfter"]; ?>",
                    type: "warning",
                    buttons: true,
                    dangerMode: true,
                }).then((willDelete) => {
                    if (willDelete) {
                        console.log(folderpath);
                        $.ajax({
                            type: "POST",
                            url: "deleteFolder.php",
                            data: {
                                folderpath: folderpath
                            },
                            dataType: "text",
                            success: function (data) {
                                swal({
                                    type: "success",

                                    timer: 1000,
                                });
                                scan();
                            },
                            error: function (data) {
                                swal("<?php echo $text["deleteFolderError"]; ?>", {
                                    type: "error",
                                });
                                scan();
                            }
                        });
                    }
                });
            }

            /****************************************************
             ************ TOOLBAR HELPER FUNCTIONS **************
             ****************************************************/
            $("#newFileButton").on("click", function () {
                createFile(editor);
            });

            $("#newFolderButton").on("click", function () {
                createFolder();
            });

            $("#debugButton").on("click", function () {
                var breakpoints = "";
                breakpointAnchors.forEach(function (element) {
                    breakpoints += (element.row + 1) + ":";
                });
                breakpoints = breakpoints.substring(0, breakpoints.length - 1);
            });

            $("#runButton").on("click", function () {
                compile(editor);
            });

            /****************************************************
             ********** FILE MANAGER HELPER FUNCTIONS ***********
             ****************************************************/
            scan();

            function scan() {
                $.ajax({
                    type: "POST",
                    url: "Sandbox_Back/scan.php",
                    data: {
                        scandir: ""
                    },
                    dataType: "text",
                    success: function (data) {
                        //document.getElementById("filemanager").innerHTML = data;
                        $("#filemanager .file").draggable({
                            revert: "invalid"
                        });
                        $("#filemanager .folder").draggable({
                            revert: "invalid"
                        });
                        $("#filemanager .file").droppable({
                            drop: drop
                        });
                        $("#filemanager .folder").droppable({
                            drop: drop
                        });
                    }
                });
            }

            function drop(event, drop) {
                var fromPath = drop.draggable.attr("data-wd");
                var toPath = $(this).attr("data-wd");
                if ($(this).hasClass("file")) {
                    toPath = toPath.substring(0, toPath.lastIndexOf("<?php echo DIRECTORY_SEPARATOR; ?>"));
                }
                console.log("From: " + fromPath + "\nTo: " + toPath);
                $.ajax({
                    type: "POST",
                    url: "move.php",
                    data: {
                        from: fromPath,
                        to: toPath
                    },
                    dataType: "text",
                    success: function (data) {
                        swal({type: "success",  timer: 1000});
                        scan();
                    }
                });
            }

            /*$("#filemanager").on("click",".file",function(element){
                if($("#filemenu").is(":visible") || $("#foldermenu").is(":visible")){
                    return;
                }
                active_file = $(this).attr("data-sha");
                active_dir =
                ext =
                name =
                $.ajax({
                    type: "POST",
                    url: "readFile.php",
                    data: {
                        path: active_file
                    },
                    dataType: "text",
                    success: function(data){
                        editor.setValue(data, -1);
                        editor.getSession().setMode("ace/mode/"+ext);
                    }
                });
                return false;
            });*/
            $("#filemanager").on("click", ".folder", function (element) {
                if ($("#filemenu").is(":visible") || $("#foldermenu").is(":visible")) {
                    return;
                }
                if ($(this).hasClass("expand")) {
                    $(this).removeClass("expand");
                } else {
                    $(this).addClass("expand");
                }
                active_dir = $(this).attr("data-wd");
                return false;
            });

            /****************************************************
             ********************* UPLOAD ***********************
             ****************************************************/
            $("#folderUpload, #fileUpload").on("click", function () {
                upload(activeRight);
            });

            function upload(path) {
                $.ajax({
                    type: "POST",
                    url: "upload.html",
                    dataType: "text",
                    success: function (data) {
                        var uploadBox = document.createElement("iframe");
                        uploadBox.id = "uploadBox";
                        uploadBox.src = "upload.html";
                        uploadBox.width = "100%";
                        uploadBox.height = "100%";
                        uploadBox.scrolling = "no";
                        console.log(uploadBox);
                        swal({
                            content: uploadBox,

                            className: "swal-uploadBox"
                        });
                    }
                });
            }

            /****************************************************
             ********************* COLLAB ***********************
             ****************************************************/
            function collab() {
                var TogetherJSConfig_dontShowClicks = true;
                var TogetherJSConfig_cloneClicks = true;
                TogetherJS(this);
            }

            /****************************************************
             ****************** CURSOR MENUS ********************
             ****************************************************/
            //Context Menu Helpers for FOLDERS
            $("#filemanager").on("mousedown", ".folder", function (element) {
                $(this).attr("oncontextmenu", "return false;");
                if (element.button == 2) {
                    console.log(activeRightElem);
                    activeRight = $(this).attr("data-wd");
                    activeRightElem = this;
                    $("#foldermenu").css("left", element.pageX + 1);
                    $("#foldermenu").css("top", element.pageY + 1);
                    $("#foldermenu").fadeIn(100);
                    $("#filemenu").fadeOut(80);
                }
                return false;
            });

            $("#folderDelete").on("click", function () {
                deleteFolder(activeRight);
            });

            $("#folderNewFile").on("click", function () {
                active_dir = activeRight;
                createFile(editor);
            });

            $("#folderNewFolder").on("click", function () {
                active_dir = activeRight;
                createFolder();
            });

            $("#folderRenameFolder").on("click", function () {
                renameFolder(activeRight);
            });

            $("#folderDuplicateFolder").on("click", function () {
                duplicateFolder(activeRight);
            });

            $("#folderDownloadFolder").on("click", function () {
                downloadFolder(activeRight);
            });

            $("#folderEmpty").on("click", function () {
                emptyFolder(activeRight);
            });

            $("#folderRefresh").on("click", function () {
                scan();
            });

            //Makes the context menu disappear on a left click in the body
            $("body").on("click", function (element) {
                $(this).attr("oncontextmenu", "return false;");
                if (element.button == 0) {
                    activeRight = "";
                    $("#foldermenu").fadeOut(80);
                    $("#filemenu").fadeOut(80);
                }
            });

            //Context Menu Helpers for FILES
            $("#filemanager").on("mousedown", ".file", function (element) {
                $(this).attr("oncontextmenu", "return false;");
                if (element.button == 2) {
                    activeRight = $(this).attr("data-wd");
                    activeRightElem = this;
                    $("#filemenu").css("left", element.pageX + 1);
                    $("#filemenu").css("top", element.pageY + 1);
                    $("#filemenu").fadeIn(100);
                    $("#foldermenu").fadeOut(80);
                }
                return false;
            });

            $("#fileNewFile").on("click", function () {
                active_dir = activeRight.substring(0, activeRight.lastIndexOf("/"));
                createFile(editor);
            });

            $("#fileNewFolder").on("click", function () {
                active_dir = activeRight.substring(0, activeRight.lastIndexOf("/"));
                createFolder();
            });

            $("#fileRenameFile").on("click", function () {
                renameFile(activeRight);
            });

            $("#fileDuplicateFile").on("click", function () {
                duplicateFile(activeRight);
            });

            $("#fileDownloadFile").on("click", function () {
                downloadFile(activeRight);
            });

            $("#fileDelete").on("click", function () {
                var path = activeRightElem.attributes['onclick'].value.split('\", \"')[1];
                path = path.substring(0, path.lastIndexOf("/"));
                var name = angular.element(activeRightElem).text().substring(1);
                deleteFile(path, name);
            });

            $("#fileRename").on("click", function () {
                var orig = activeRightElem.attributes['onclick'].value;
                orig = orig.replace('clickFile\("', '');
                orig = orig.replace('"\)', '');
                var path = orig.split('", "')[0];
                renameFile(path);
/*                var path = activeRightElem.attributes['onclick'].value.split('\", \"')[1];
                path = path.substring(0, path.lastIndexOf("/"));
                var name = angular.element(activeRightElem).text().substring(1);
                deleteFile(path, name);*/
            });

            $('#fileDuplicate').on("click", function () {
                var orig = activeRightElem.attributes['onclick'].value;
                orig = orig.replace('clickFile\("', '');
                orig = orig.replace('"\)', '');
                var path = orig.split('", "')[0];
                duplicateFile(path);
            });

            $('#fileDownload').on("click", function() {
                var orig = activeRightElem.attributes['onclick'].value;
                orig = orig.replace('clickFile\("', '');
                orig = orig.replace('"\)', '');
                var fullPath = orig.split('", "')[0];
                var name = orig.split('", "')[1];
                downloadFile(fullPath, name);
            });

            $("#fileRefresh").on("click", function () {
                scan();
            });
            /****************************************************
             ****************** TAB BINDINGS ********************
             ****************************************************/
            /*var numTabs = 0;
            function newTab(hash, in_editor, name, data){
                numTabs++;
                $('#tab-list').append($('<li class="tab" data-hash="'+hash+'" data-name="'+name+'"><a href="">'+name+'<button class="close" type="button" title="Remove this page">×</button></a></li>'));
                in_editor.setValue(data, -1);
                in_editor.getSession().setMode("ace/mode/"+ext);
            }
            $('#tab-list').on('click','.close',function(){
                numTabs--;
                $(this).parents('li').remove();
            });*/
            /****************************************************
             ****************** KEY BINDINGS ********************
             ****************************************************/
            /*editor.commands.addCommand({
                name: "compile",
                bindKey: {win: "Ctrl-e", mac: "Command-e"},
                exec: function () {
                    compile(editor);
                }
            });

            editor.commands.addCommand({
                name: "saveFile",
                bindKey: {win: "Ctrl-s", mac: "Command-s"},
                exec: function () {
                    save(editor, true);
                }
            });

            editor.commands.addCommand({
                name: "newFile",
                bindKey: {win: "Ctrl-n", mac: "Command-right"},
                exec: function () {
                    createFile(editor);
                }
            });

            editor.commands.addCommand({
                name: "collab",
                bindKey: {win: "Ctrl-k", mac: "Command-k"},
                exec: function () {
                    collab();
                }
            });*/
        });

        function shareFile() {
            swal({
                title: 'Share With',
                input:'text',
                showCancelButton:true
            });
        }

        function saveNotes() {
            $.ajax({
                type: "POST",
                url: "Sandbox_Back/saveNotes.php",
                data: {
                    content: $('#notesContent').val()
                },
                success: function (data, status, xhttp) {
                },
                dataType: "json"
            });
        }
    </script>
</div>
<div id="onFileReadOverlay">
    <div id="playgroundOverlay"></div>
    <div class="loader"></div>
</div>
</body>
</html>
