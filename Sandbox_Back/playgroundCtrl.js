var username;
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
    $.ajax({
        type: "POST",
        url: "Sandbox_Back/getUsername.php",
        data: {},
        success: function (data, status, xhttp) {
            username = data.username;
            toggleCollab();
        }, error: function (data) {console.log(data);},
        dataType: "json"
    });

    $scope.$on('$destroy', function() {
        if (active_name !== null) {
            leaveCurrentCollabSession();
        }
    });
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
var collab = {
    config: {
        apiKey: "AIzaSyBQgPQC1Zzky-8zJbFAO_8bkA29Ycq_kG4",
        authDomain: "sandbox-9291d.firebaseapp.com",
        databaseURL: "https://sandbox-9291d.firebaseio.com",
        projectId: "sandbox-9291d",
        storageBucket: "sandbox-9291d.appspot.com",
        messagingSenderId: "177612955416"
    }
};

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
            collab.online = [];
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
//        updateFile(active_path, active_name, editor.getValue(), false);
    }
    }, 10000);

function updateFile(path, name, content, altCallback, shouldResetCanSave){
    let fullPath = path + (path === "" ? "" : "/") + name;
    if (isReading || (fileFlags[fullPath] && !fileFlags[fullPath].canSave))
        return;
    tempContents[fullPath] = content;
    if (!fileFlags[fullPath].hasUpdated)
        fileFlags[fullPath].hasUpdated = [];
    fileFlags[fullPath].hasUpdated.push(0);
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
            fileFlags[fullPath].canSave = false;
            fileFlags[fullPath].hasUpdated.pop();
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
    $('#onFileReadOverlay').fadeIn();
    $.ajax({
        type: "POST",
        url: "Sandbox_Back/fetchFileSession.php",
        data: {
            repo: repo,
            owner: owner,
            path: name
        },
        success: function (data, status, xhttp) {
            if (!fileFlags[name]) {
                fileFlags[name] = {};
            } else {
                if (fileFlags[name].hasUpdated.length !== 0) {
                    swal({icon:"error",  timer:2000, title: "Not yet!", text: "This file is still being saved"});
                    $('#onFileReadOverlay').fadeOut();
                    return;
                }
            }
            fileFlags[name].sessionID = data.session;
            if (data.isNew) {
                fileFlags[name].canSave = true;
            }
            numTabs++;
            if(angular.element('#tab'+name.replace(/[.\/]/g, ""))[0]==null){
                 $('#tab-list').append($('<li onclick="tabClick(this)" id="tab'+name.replace(/[.\/]/g, "")+'" data-path="'+name+'" data-hash="'+hash+'"><a role="tab" data-toggle="tab">' + key + '<button class="close" type="button" onclick="event.stopPropagation(); closeTab(this);" title="Remove this page">×</button></a></li>'));
            }
            activateTab(hash, name);
        },
        dataType: "json"
    });
}

//Close tab
function closeTab(element){
    if (isReading)
        return;
    leaveCurrentCollabSession();
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
        }, true);
    }
    delete tempContents[oldTabFullPath];
    angular.element(element).parent().parent().remove();
    var openTabs = angular.element("#tab-list > li");
    if(openTabs.length<1){
        active_path = null;
        active_name = null;
        active_hash = null;
        return;
    }
    activateTab(openTabs[0].attributes["data-hash"].value, openTabs[0].attributes["data-path"].value, true);
}

function activateTab(hash, path, hasAlreadyLeftCollabSession){
    if (isReading)
        return;
    let oldContent = "";
    if (editor)
        oldContent = editor.getValue();
    if (!hasAlreadyLeftCollabSession && active_path !== null) {
        leaveCurrentCollabSession();
    }
    joinCollabSession(fileFlags[path].sessionID, path);
    var active_li = angular.element('#tab-list > .active');
    if(active_li.length>0){
        updateFile(active_path, active_name, oldContent, false);
        active_li[0].classList.remove("active");
    }
    var tab = angular.element('#tab'+path.replace(/[.\/]/g, ""));
    tab.addClass("active");
    active_name = tab.text().slice(0, -1);
    active_path = tab[0].attributes["data-path"].value;
    active_path = active_path.substring(0, active_path.lastIndexOf("/"));
    active_hash = hash;
    if (fileFlags[path].canSave) {
        if (tempContents.hasOwnProperty(path)) {
            editor.setValue(tempContents[path], -1);
        } else {
            readFile(hash, function (contents) {
                tempContents[path] = contents;
            });
        }
    }
    setLanguage(active_name);
}

function tabClick(tab){
    if (isReading)
        return;
    $('#onFileReadOverlay').fadeIn();
    let hash = tab.attributes["data-hash"].value;
    let name = tab.attributes["data-path"].value;
    $.ajax({
        type: "POST",
        url: "Sandbox_Back/fetchFileSession.php",
        data: {
            repo: repo,
            owner: owner,
            path: name
        },
        success: function (data, status, xhttp) {
            if (!fileFlags[name]) {
                fileFlags[name] = {};
            } else {
                if (fileFlags[name].hasUpdated && fileFlags[name].hasUpdated.length !== 0) {
                    swal({icon:"error",  timer:2000, title: "Not yet!", text: "This file is still being saved"});
                    $('#onFileReadOverlay').fadeOut();
                    return;
                }
            }
            fileFlags[name].sessionID = data.session;
            if (data.isNew) {
                fileFlags[name].canSave = true;
            }
            activateTab(hash, name);
        },
        dataType: "json"
    });
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
    // Connect to firebase DB
    firebase.initializeApp(collab.config);
}

function addCollabOnline(childSnapshot, previousKey) {
    // Push added child to online list as appropriate
    let childUsername = childSnapshot.node_.children_.root_.value.value_;
    if (childUsername !== username && collab.online.indexOf(childUsername) === -1) {
        collab.online.push(childUsername);
    }
}

function removeCollabOnline(oldChildSnapshot) {
    // Pop removed child from online list as appropriate
    let childUsername = oldChildSnapshot.node_.children_.root_.value.value_;
    let ind = collab.online.indexOf(childUsername);
    if (childUsername !== username && ind !== -1) {
        collab.online.splice(ind, 1);
        let fullPath = active_path + (active_path === "" ? "" : "/") + active_name;
        if (!fileFlags[fullPath].canSave) {
            // Allow this user to save if he/she is the new owner
            fetchCreatorUsername(collab.id, function (creator) {
                fileFlags[fullPath].canSave = username === creator;
            });
        }
    }
}

function changeCollabSessionOwner (newOwner) {
    collab.firepadRef.child("users").child("?creator").set({
        username: newOwner
    });
}

function removeCollabSession (sessionID) {
    $.ajax({
        type: "POST",
        url: "Sandbox_Back/removeCollabSession.php",
        data: {
            session: sessionID
        },
        success: function (data, status, xhttp) {
        },
        dataType: "text"
    });
}

function fetchCreatorUsername (sessionID, callback) {
    collab.firepadRef.child("users").child("?creator").on("value", function (snapshot) {
        callback(snapshot.val().username);
    });
}

function joinCollabSession (id, filename) {
    collab.id = id;
    // Generate div to hold ace editor
    var $div = $('<div />').appendTo($('#editorContainer'));
    $div.attr('id', 'editor');
    // Initialize editor
    setupAce();
    // Get or upsert reference to location in db where data with id is stored
    collab.firepadRef = firebase.database().ref(id);
    // Add current username to users list
    collab.firepadRef.child("users").child(username).set({
        username: username
    });
    // Bind editor to firepad
    collab.firepad = Firepad.fromACE(collab.firepadRef, editor, {userId: username});
    // Define the creator in firebase DB as needed
    if (fileFlags[filename].canSave) {
        collab.firepadRef.child("users").child("?creator").set({
            username: username
        });
    }
    $('#onFileReadOverlay').fadeOut();
    // Update online list with added or removed children, respectively
    collab.firepadRef.child("users").on("child_added", addCollabOnline);
    collab.firepadRef.child("users").on("child_removed", removeCollabOnline);
}

function leaveCurrentCollabSession () {
    // Remove this user from firebase DB
    collab.firepadRef.child("users").child(username).remove();
    // Clear editor from its container
    $('#editorContainer').empty();
    let fullPath = active_path + (active_path === "" ? "" : "/") + active_name;
    if (collab.online.length > 0) {
        if (fileFlags[fullPath].canSave) {
            // Transfer ownership
            changeCollabSessionOwner(collab.online[0]);
        }
    } else {
        // Remove entire session entry from firebase DB and MDB
        collab.firepadRef.remove();
        removeCollabSession(collab.id);
    }
    // Reset collab data
    collab.online = [];
}

function setupAce() {
    ace.require("ace/ext/language_tools");
    editor = ace.edit("editor");
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
    });

    editor.commands.addCommand({
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
    });
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

$(window).on("unload", function() {
    if (active_name !== null) {
        leaveCurrentCollabSession();
    }
});
