var $gscope;
var $ghttp;
var $gsce;
var $gstate;

let playgroundCtrl = function ($rootScope, $scope, $http, $sce, $state, $stateParams) {
    $gscope = $scope;
    $ghttp = $http;
    $gsce = $sce;
    $gstate = $state;
    $scope.scan = "";
    if ($stateParams.repo !== undefined) {
        owner = $stateParams.repo.split("/")[0];
        repo = $stateParams.repo.split("/")[1];
    }
    //scan($scope, $http, $sce, $state);
    //toggleCollab();
};

//Global Variables
var numTabs = 0;
var editor;
var owner = "";
var repo = "";
var branch = "master";
var notify = true;
var active_name = null;
var active_path = null;
var active_hash = null;
var hashes = {};
var tempContents = {};
var fileFlags = {};
var isReading = false;
var directories = {};

//Scan current repo
function scan($scope, $http, $sce, $state){
    $('#onFileReadOverlay').fadeIn();
    $http({
        method: 'POST',
        url: 'fileManager/requests/getAllProjectContents.php',
        headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'},
        data: $.param({
            owner: owner,
            repo: repo,
            branch: "master",
            path: ""
        })
    }).then(function successCallback(response) {
        var resp = response.data;
        if (resp === "UNSYNCED") {
            $state.go('settings', {unsynced: true});
            return;
        }
        var dir = {};
        var current;
        for (var a in resp) {
            var s = resp[a].name.split('/');
            current = dir;
            for (var i = 0; i < s.length; i++) {
                if (s[i] != '') {
                    if (current[s[i]] == null) current[s[i]] = resp[a];
                    current = current[s[i]];
                }
            }
        }
        var html = "";

        function traverse(jsonObj, dirObject) {
            var dirObj = dirObject || directories;
            if (typeof jsonObj == "object") {
                Object.entries(jsonObj).forEach(([key, value]) => {
                    if (value.type == "blob") {
                        hashes[value.name] = value.sha;
                        html += "<li class='file' onclick='clickFile(\""+value.name+"\", \""+key+"\")'><i class='far fa-file'></i> " + key + "</li>";
                    } else if (value.type == "tree") {
                        let relName = /[^/]*$/.exec(value.name)[0];
                        dirObj[relName] = {};
                        html += "<li class='dropdownli folder' data-name='" + value.name + "' data-sha='" + value.sha + "'><i class='fas fa-folder'></i> " + key + "<ul>";
                        traverse(value, dirObj[relName]);
                        html += "</ul></li>";
                    }
                });
            }
        }

        traverse(dir);
        $scope.scan = $sce.trustAsHtml(html);
        $('#onFileReadOverlay').fadeOut();
    }, function errorCallback(response) {
        if(repo===""){
            chooseRepo();
        } else {
            swal({type: "error", title: "Uh oh!", text: "We couldn't find a repository named " + repo + " under " + owner + "'s account"});
        }
        $scope.scan = "Error fetching data: " + JSON.stringify(response);
    });
}

/****************************************************
 ***************** MANAGER BINDINGS ******************
 ****************************************************/
function chooseRepo(){
    var inputOptionsPromise = new Promise(function (resolve) {
        $.ajax({
            type: "POST",
            url: "fileManager/requests/getProjects.php",
            data: {

            },
            dataType: "json",
            success: function(data){
                var y = {};
                for(var i in data){
                    y[data[i].name+"לא"+data[i].owner] = data[i].name
                }
                resolve(y);
            },
            error: function(data){
                if(notify)
                    swal({icon:"error",  timer:1000, });
                return null;
            }
        });
    });

    swal({
        title: 'Select Repo',
        input: 'select',
        inputOptions: inputOptionsPromise,
        showCancelButton: true
    }).then(function(result){
        if (!result.dismiss) {
            angular.forEach(angular.element("#tab-list .close"), function(value, key){
                closeTab(value);
            });
            results = result.value.toString().split("לא");
            repo = results[0];
            owner = results[1];
            hashes = {};
            fileFlags = {};
            tempContent = {};
            directories = {};
            isReading = false;
            scan($gscope, $ghttp, $gsce, $gstate);
        }
    });
}

function clickFile(name, key){
    if (!isReading)
        openTab(hashes[name], name, key);
}

/****************************************************
 ****************** REPO MANIPULATION ***************
 ****************************************************/
function readFile(hash, onRead, altOnRead) {
    isReading = true;
    $('#onFileReadOverlay').fadeIn();
    $.ajax({
        type: "POST",
        url: "fileManager/requests/getFileContents.php",
        data: {
            owner: owner,
            repo: repo,
            sha: hash
        },
        dataType: "text",
        success: function(data){
            content = atob(data);
            if (altOnRead) {
                altOnRead(content);
                return;
            }
            editor.setValue(content, -1);
            onRead(content);
            isReading = false;
            $('#onFileReadOverlay').fadeOut();
        },
        error: function(data){
console.log("READING FILE FAILURE");
            if(notify)
                swal({type:"error",  timer:1000});
            return null;
        }
    });
}

function createFile(path, name, content, shouldStopLoading){
    if(path==null){
        path = "";
    }
    if(name==null){
        name = angular.element("#filename").val();
    }
    $.ajax({
        type: "POST",
        url: "fileManager/requests/createFile.php",
        data: {
            owner: owner,
            repo: repo,
            branch: branch,
            path: path,
            name: name,
            content: content || ""
        },
        dataType: "text",
        success: function(data){
            if(notify)
                swal({type:"success",  timer:1000, });
            angular.element("#entryModal")[0].style.display = "none";
            angular.element("#filename").val("");
            scan($gscope, $ghttp, $gsce, $gstate);
            if (shouldStopLoading) {
                isReading = false;
                $('#onFileReadOverlay').fadeOut();
            }
        },
        error: function(data){
            if(notify)
                swal({type:"error",  timer:1000, });
            return null;
        }
    });
}

function deleteFile(path, name, shouldBeDirect){
    function makeRequest() {
        $.ajax({
            type: "POST",
            url: "fileManager/requests/deleteFile.php",
            data: {
                owner: owner,
                repo: repo,
                branch: branch,
                path: path,
                name: name
            },
            dataType: "text",
            success: function (data) {
                if (!shouldBeDirect) {
                    swal({
                        type: "success",
                        timer: 1000,
                    });
                    scan($gscope, $ghttp, $gsce, $gstate);
                }
            },
            error: function (data) {
                console.log(JSON.stringify(data));
                swal("Could not delete file.", {
                    type: "error",
                });
            }
        });
    }
    if (shouldBeDirect) {
        makeRequest();
        return;
    }
    swal({
        title: "Danger Zone",
        text: "Are you sure you want to delete this file? Well, if you change your mind GitHub is a thing.",
        type: "warning",
        buttons: true,
        dangerMode: true,
    }).then((willDelete) => {
        if (willDelete) {
            makeRequest();
        }
    });
}

function duplicateFile(fullPath) {
    var path = fullPath.lastIndexOf("/") === -1 ? "" : fullPath.substring(0, fullPath.lastIndexOf("/"));
    var name = fullPath.lastIndexOf("/") === -1 ? fullPath : fullPath.substring(fullPath.lastIndexOf("/") + 1, fullPath.length);

    swal({
        title: 'Duplicating file',
        text: 'What would you like the duplicated file to be called?',
        type: 'question',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Duplicate',
        input: 'text',
        showCancelButton: true
    }).then((result) => {
        function isNameValid(str) {
            if (!str || str.length > 255 || str === name) {
                return false;
            }
            if ((/[<>:"\/\\|?*\x00-\x1F]/g).test(str) || (/^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i).test(str)) {
                return false;
            }
            if (/^\.\.?$/.test(str)) {
                return false;
            }
            return true;
        }
        if (isNameValid(result.value)) {
            readFile(hashes[fullPath], null, function (content) {
                createFile(path, result.value, content, true);
            });
        } else {
            swal({
                title: "Oops..",
                text: "That's not a valid name!",
                type: 'error',
                timer: 1500
            })
        }
    });
}

function renameFile(fullPath) {
    function makeRequest(newName) {
        var path = fullPath.lastIndexOf("/") === -1 ? "" : fullPath.substring(0, fullPath.lastIndexOf("/"));
        var name = fullPath.lastIndexOf("/") === -1 ? fullPath : fullPath.substring(fullPath.lastIndexOf("/") + 1, fullPath.length);
        readFile(hashes[fullPath], null, function (content) {
            deleteFile(path, name, true);
            createFile(path, newName, content, true);
        });
    }
    swal({
        title: 'Renaming file',
        text: "What would you like to rename this file to?",
        type: 'question',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Rename',
        input: "text",
        showCancelButton: true
    }).then((result) => {
        function isNameValid(str) {
            if (!str || str.length > 255) {
	        return false;
            }
            if ((/[<>:"\/\\|?*\x00-\x1F]/g).test(str) || (/^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i).test(str)) {
	        return false;
            }
            if (/^\.\.?$/.test(str)) {
            	return false;
            }
            return true;
        }
        if (isNameValid(result.value)) {
            makeRequest(result.value);
        } else {
            swal({
                title: "Oops..",
                text: "That's not a valid name!",
                type: 'error',
                timer: 2000
            })
        }
        // makeRequest("something.py");
    })
}

setInterval(function(){
    if(active_path!=null && active_name!=null){
        updateFile(active_path, active_name, editor.getValue(), false);
    }
    }, 10000);

function updateFile(path, name, content, altCallback){
    if (isReading)
        return;
    let fullPath = path + (path === "" ? "" : "/") + name;
    tempContents[fullPath] = content;
    fileFlags[fullPath].hasUpdated = false;
    $.ajax({
        type: "POST",
        url: "fileManager/requests/updateFile.php",
        data: {
            owner: owner,
            repo: repo,
            branch: branch,
            path: path,
            name: name,
            content: content
        },
        dataType: "json",
        success: function(data) {
            if (!altCallback) {
                active_hash = data["newSha"];
                updateHash(active_hash);
            } else {
                altCallback(data["newSha"]);
            }
            fileFlags[fullPath].hasUpdated = true;
        },
        error: function(data){
            console.log("UPDATE: " + JSON.stringify(data));
            if(notify)
                swal({type:"error",  timer:1000, });
        }
    });
}

function commitChanges() {
    let msg = document.getElementById('commitMessageInput').value;

    $('#onFileReadOverlay').fadeIn();
    document.getElementById('commitModal').style.display="none";
    document.getElementById('commitMessageInput').value="";

    function onFinish() {
        $('#onFileReadOverlay').fadeOut();
        swal("Success", 'Commited', "success");
    }

    $.ajax({
        type: "POST",
        url: "fileManager/requests/saveChanges.php",
        data: {
            owner: owner,
            repo: repo,
            branch: branch,
            message: msg
        },
        success: onFinish,
        error: onFinish,
        dataType: "text"
    });
}

/****************************************************
 ****************** TAB BINDINGS ********************
 ****************************************************/

function openTab(hash, name, key){
    if (isReading)
        return;
    if (!fileFlags[name]) {
        fileFlags[name] = {};
    } else {
        if (!fileFlags[name].hasUpdated) {
            swal({icon:"error",  timer:2000, title: "Not yet!", text: "This file is still being saved"});
            return;
        }
    }
    numTabs++;
    if(angular.element('#tab'+name.replace(/[.\/]/g, ""))[0]==null){
        $('#tab-list').append($('<li onclick="tabClick(this)" id="tab'+name.replace(/[.\/]/g, "")+'" data-path="'+name+'" data-hash="'+hash+'"><a role="tab" data-toggle="tab">' + key + '<button class="close" type="button" onclick="event.stopPropagation(); closeTab(this);" title="Remove this page">×</button></a></li>'));
    }
    activateTab(hash, name);
}

//Close tab
function closeTab(element){
    if (isReading)
        return;
    numTabs--;
    let oldTab = angular.element(element).parent().parent()[0];
    let oldTabFullPath = oldTab.attributes["data-path"].value;
    let oldContents = editor.getValue();
    let isOldTabPathDeep = oldTabFullPath.indexOf('/') !== -1;
    let oldTabPath = !isOldTabPathDeep ? "" : oldTabFullPath.substring(0, oldTabFullPath.lastIndexOf('/'));
    let oldTabName = !isOldTabPathDeep ? oldTabFullPath : oldTabFullPath.substring(oldTabFullPath.lastIndexOf('/') + 1, oldTabFullPath.length);
    if (oldTabFullPath === active_path + (active_path === "" ? "" : "/") + active_name) {
        updateFile(oldTabPath, oldTabName, oldContents, function (newSha) {
            hashes[oldTabFullPath] = newSha;
        });
    }
    delete tempContents[oldTabFullPath];
    angular.element(element).parent().parent().remove();
    var openTabs = angular.element("#tab-list > li");
    if(openTabs.length<1){
        editor.setValue("", -1);
        active_path = null;
        active_name = null;
        active_hash = null;
        return;
    }
    activateTab(openTabs[0].attributes["data-hash"].value, openTabs[0].attributes["data-path"].value);
}

function activateTab(hash, path){
    if (isReading)
        return;
    var active_li = angular.element('#tab-list > .active');
    if(active_li.length>0){
        updateFile(active_path, angular.element(active_li[0]).text().slice(0, -1), editor.getValue(), false);
        active_li[0].classList.remove("active");
    }
    var tab = angular.element('#tab'+path.replace(/[.\/]/g, ""));
    tab.addClass("active");
    active_name = tab.text().slice(0, -1);
    active_path = tab[0].attributes["data-path"].value;
    active_path = active_path.substring(0, active_path.lastIndexOf("/"));
    active_hash = hash;
    if (tempContents.hasOwnProperty(path)) {
        editor.setValue(tempContents[path], -1);
    } else {
        readFile(hash, function (contents) {
            tempContents[path] = contents;
        });
    }
    setLanguage(active_name);
}

function tabClick(tab){
    if (isReading)
        return;
    activateTab(tab.attributes["data-hash"].value, tab.attributes["data-path"].value);
}

function setLanguage(name){
    if(name.indexOf(".")==-1){
        //swal("Cannot detect file extension to set editor language.");
        editor.getSession().setMode("ace/mode/text");
    }
    var ext = name.split(".")[1];
    var language = "text";
    switch(ext){
        case "java":
            language = "java";
            break;
        case "c":
            language = "c_cpp";
            break;
        case "cpp":
            language = "c_cpp";
            break;
        case "html":
        case "htm":
            language = "html";
            break;
        case "css":
            language = "css";
            break;
        case "js":
            language = "javascript";
            break;
        case "php":
            language = "php";
            break;
        case "swift":
            language = "swift";
            break;
        case "py":
            language = "python";
            break;
        case "rb":
            language = "ruby";
            break;
        case "rs":
            language = "rust";
            break;
        case "scala":
        case "sc":
            language = "scala";
            break;
        case "cs":
            language = "csharp";
            break;
        case "r":
            language = "r";
            break;
        default:
            /*swal({
                text: "Unsupported file extension. Language not set.",
                icon: "error",
                timer: 1000
            });*/
    }
    editor.getSession().setMode("ace/mode/"+language);
}

function updateHash(hash){
    let fullPath = active_path + (active_path === "" ? "" : "/") + active_name;
    hashes[fullPath] = hash;
    var active_li = angular.element('#tab-list > .active');
    if(active_li.length>0){
        active_li[0].attributes["data-hash"].value = hash;
    }
}

/****************************************************
 ********************* COLLABORATION ****************
 ****************************************************/
function toggleCollab(){
    var TogetherJSConfig_siteName = "sandboxcodes";
    var TogetherJSConfig_toolName = "collab";
    var TogetherJSConfig_autoStart = true;
    var TogetherJSConfig_cloneClicks = false;
    var TogetherJSConfig_includeHashInUrl = true;
    var TogetherJSConfig_dontShowClicks = true;
    var TogetherJSConfig_suppressInvite = true;
    var TogetherJSConfig_findRoom = repo+owner+active_path;
    var TogetherJSConfig_getUserName = function () {return owner;};
    var TogetherJSConfig_getUserAvatar = function () {return "";};
    TogetherJS(this);
}

//TogetherJSConfig_siteName
/****************************************************
 ******************** COMPILE ***********************
 ****************************************************/
function compile(){
    /*$.ajax({
        type: "POST",
        url: "Sandbox_Back/compile2.php",
        data: {
            key: active_key,
            code: editor.getValue()
        },
        dataType: "text",
        success: function(data){

        },
        error: function(data){
            if(notify)
                swal({icon:"error",  timer:1000, });
        }
    });*/
}
