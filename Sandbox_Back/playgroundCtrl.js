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
                        html += "<li class='file' onclick='clickFile(\""+value.sha+"\", \""+value.name+"\", \""+key+"\")'><i class='far fa-file'></i> " + key + "</li>";
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
        scan($gscope, $ghttp, $gsce, $gstate);
    });
}

function clickFile(hash, name, key){
    openTab(hash, name, key);
}

/****************************************************
 ****************** REPO MANIPULATION ***************
 ****************************************************/
function readFile(hash){
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
        },
        error: function(data){
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
            console.log(data);
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
    console.log(path+" "+name);
    swal({
        title: "Danger Zone",
        text: "Are you sure you want to delete this file? Well, if you change your mind GitHub is a thing.",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    }).then((willDelete) => {
        console.log(owner+" "+repo+" "+branch+" "+path+" "+name);
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
        updateFile(active_path, active_name, editor.getValue());
    }
    }, 10000);

function updateFile(path, name, content){
    console.log(name);
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
            active_hash = data["newSha"];
            updateHash(active_hash);
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
        angular.element(active_li[0]).text().slice(0, -1);
        updateFile(path, angular.element(active_li[0]).text().slice(0, -1), editor.getValue())
        active_li[0].classList.remove("active");
    }
    var tab = angular.element('#tab'+path.replace(/[.\/]/g, ""));
    tab.addClass("active");
    active_name = tab.text().slice(0, -1);
    active_path = tab[0].attributes["data-path"].value;
    active_path = active_path.substring(0, active_path.lastIndexOf("/"));
    active_hash = hash;
    readFile(hash);
    updateFile(active_path, active_name, editor.getValue());
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
    var active_li = angular.element('#tab-list > .active');
    if(active_li.length>0){
        active_li[0].attributes["data-hash"].value = hash;
    }
}

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
