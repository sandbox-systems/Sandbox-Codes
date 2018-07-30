let playgroundCtrl = function ($scope, $http, $sce) {
    $scope.scan = "";
    scan($scope, $http, $sce);
};

//Global Variables
var numTabs = 0;
var editor;

//Scan current repo
function scan($scope, $http, $sce){
    $http({
        method: 'POST',
        url: 'fileManager/requests/getAllProjectContents.php',
        headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'},
        data: $.param({
            owner: "aadhi0319",
            repo: "Logger",
            branch: "master",
            path: ""
        })
    }).then(function successCallback(response) {
        console.log(response.data);
        var resp = response.data;
        if (resp === "UNSYNCED") {
            alert("GitHub Sync Session Expired.");
            window.location = "https://sandboxcodes.com/Castle.html#!/settings";
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
        $scope.scan = "Error fetching data: " + JSON.stringify(response);
    });
}

/****************************************************
 ***************** MANAGER BINDINGS ******************
 ****************************************************/
function clickFile(hash, name, key){
    openTab(hash, key, "hello");
}

/****************************************************
 ****************** TAB BINDINGS ********************
 ****************************************************/

function openTab(hash, key, data){
    numTabs++;
    if(angular.element('#tab'+hash)[0]==null){
        $('#tab-list').append($('<li onclick="tabClick(this)" id="tab'+hash+'"><a role="tab" data-toggle="tab">' + key + '<button class="close" type="button" onclick="event.stopPropagation(); closeTab(this);" title="Remove this page">×</button></a></li>'));
    }
    activateTab(hash, key);
    editor.setValue(data, -1);
}

//Close tab
function closeTab(element){
    angular.element(element).parent().parent().remove();
    var openTabs = angular.element("#tab-list > li");
    if(openTabs.length<1){
        return;
    }
    activateTab(openTabs[0].id.substring(3), angular.element(openTabs[0]).text().slice(0, -1));
}

function activateTab(hash, key){
    var active_li = angular.element('#tab-list > .active');
    if(active_li.length>0){
        active_li[0].classList.remove("active");
    }
    angular.element('#tab'+hash).addClass("active");
    setLanguage(key);
}

function tabClick(tab){
    activateTab(tab.id.substring(3), angular.element(tab).text().slice(0, -1));
}

function setLanguage(key){
    if(key.indexOf(".")==-1){
        swal("Cannot detect file extension to set editor language.");
        editor.getSession().setMode("ace/mode/text");
    }
    var ext = key.split(".")[1];
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
            swal({
                text: "Unsupported file extension. Language not set.",
                icon: "error",
                timer: 1000
            });
    }
    editor.getSession().setMode("ace/mode/"+language);
}