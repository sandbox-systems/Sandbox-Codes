var $gscope;
var $ghttp;
var $gsce;
var $gstate;

let playgroundCtrl = function ($scope, $http, $sce, $state) {
    $gscope = $scope;
    $ghttp = $http;
    $gsce = $sce;
    $gstate = $state;
    $scope.scan = "";
    scan($scope, $http, $sce, $state);
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

//Scan current repo
function scan($scope, $http, $sce, $state){
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

        function traverse(jsonObj) {
            if (typeof jsonObj == "object") {
                Object.entries(jsonObj).forEach(([key, value]) => {
                    if (value.type == "blob") {
                        hashes[value.name] = value.sha;
                        html += "<li class='file' onclick='clickFile(\""+value.name+"\", \""+key+"\")'><i class='far fa-file'></i> " + key + "</li>";
                    } else if (value.type == "tree") {
                        html += "<li class='dropdownli folder' data-name='" + value.name + "' data-sha='" + value.sha + "'><i class='fas fa-folder'></i> " + key + "<ul>";
                        traverse(value);
                        html += "</ul></li>";
                    }
                });
            }
        }

        traverse(dir);
        $scope.scan = $sce.trustAsHtml(html);
    }, function errorCallback(response) {
        if(repo===""){
            chooseRepo();
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
                resolve(y)
            },
            error: function(data){
                if(notify)
                    swal({icon:"error", buttons:false, timer:1000, className:"swal-icon-notification"});
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
        results = result.value.toString().split("לא");
        repo = results[0];
        owner = results[1];
        hashes = {};
        scan($gscope, $ghttp, $gsce, $gstate);
    });
}

function clickFile(name, key){
    openTab(hashes[name], name, key);
}

/****************************************************
 ****************** REPO MANIPULATION ***************
 ****************************************************/
function readFile(hash, onRead){
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
            editor.setValue(data, -1);
            onRead(data);
        },
        error: function(data){
console.log("FILE");
            if(notify)
                swal({icon:"error", buttons:false, timer:1000, className:"swal-icon-notification"});
            return null;
        }
    });
}

function createFile(path, name){
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
            name: name
        },
        dataType: "text",
        success: function(data){
console.log("CREATE");
            if(notify)
                swal({icon:"success", buttons:false, timer:1000, className:"swal-icon-notification"});
            angular.element("#entryModal")[0].style.display = "none";
            angular.element("#filename").val("");
            scan($gscope, $ghttp, $gsce, $gstate);
        },
        error: function(data){
            if(notify)
                swal({icon:"error", buttons:false, timer:1000, className:"swal-icon-notification"});
            return null;
        }
    });
}

function deleteFile(path, name){
    swal({
        title: "Danger Zone",
        text: "Are you sure you want to delete this file? Well, if you change your mind GitHub is a thing.",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    }).then((willDelete) => {
        if (willDelete) {
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
                    swal({
                        icon: "success",
                        buttons: false,
                        timer: 1000,
                        className: "swal-icon-notification"
                    });
                    scan($gscope, $ghttp, $gsce, $gstate);
                },
                error: function (data) {
                    console.log(JSON.stringify(data));
                    swal("Could not delete file.", {
                        icon: "error",
                    });
                }
            });
        }
    });
}

setInterval(function(){
    if(active_path!=null && active_name!=null){
        updateFile(active_path, active_name, editor.getValue(), false);
    }
    }, 10000);

function updateFile(path, name, content, altCallback){
console.log("PATH: " + path);
console.log("NAME: " + name);
console.log("CONTENT: " + content);
    let fullPath = path + (path === "" ? "" : "/") + name;
    tempContents[fullPath] = content;
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
console.log(data["newSha"]);
            if (!altCallback) {
                active_hash = data["newSha"];
                updateHash(active_hash);
            } else {
                altCallback(data["newSha"]);
            }
        },
        error: function(data){
            console.log(JSON.stringify(data));
            if(notify)
                swal({icon:"error", buttons:false, timer:1000, className:"swal-icon-notification"});
        }
    });
}

/****************************************************
 ****************** TAB BINDINGS ********************
 ****************************************************/

function openTab(hash, name, key){
    numTabs++;
    if(angular.element('#tab'+name.replace(/[.\/]/g, ""))[0]==null){
        $('#tab-list').append($('<li onclick="tabClick(this)" id="tab'+name.replace(/[.\/]/g, "")+'" data-path="'+name+'" data-hash="'+hash+'"><a role="tab" data-toggle="tab">' + key + '<button class="close" type="button" onclick="event.stopPropagation(); closeTab(this);" title="Remove this page">×</button></a></li>'));
    }
    activateTab(hash, name);
}

//Close tab
function closeTab(element){
    numTabs--;
    let oldTab = angular.element(element).parent().parent()[0];
    let oldTabFullPath = oldTab.attributes["data-path"].value;
    let oldContents = editor.getValue();
    let isOldTabPathDeep = oldTabFullPath.indexOf('/') !== -1;
    let oldTabPath = !isOldTabPathDeep ? "" : oldTabFullPath.substring(0, oldTabFullPath.lastIndexOf('/'));
    let oldTabName = !isOldTabPathDeep ? oldTabFullPath : oldTabFullPath.substring(oldTabFullPath.lastIndexOf('/') + 1, oldTabFullPath.length);
    updateFile(oldTabPath, oldTabName, oldContents, function (newSha) {
        hashes[oldTabFullPath] = newSha;
    });
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
    var active_li = angular.element('#tab-list > .active');
    if(active_li.length>0){
        updateFile("", angular.element(active_li[0]).text().slice(0, -1), editor.getValue(), false);
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
    setLanguage(name);
}

function tabClick(tab){
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
                swal({icon:"error", buttons:false, timer:1000, className:"swal-icon-notification"});
        }
    });*/
}
