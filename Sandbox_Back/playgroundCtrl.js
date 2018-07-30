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
            swal("GitHub session expired. Please login again to continue.");
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

function clickFile(hash, name, key){
    openTab(hash, editor, key, "hello", "java");
}

function openTab(hash, in_editor, key, data, language){
    if(angular.element('#tab'+hash)[0]==null){
        $('#tab-list').append($('<li id="tab'+hash+'"><a role="tab" data-toggle="tab">' + key + '<button class="close" type="button" onclick="closeTab(this)" title="Remove this page">×</button></a></li>'));
    }
    activateTab(hash);
    in_editor.setValue(data, -1);
    in_editor.getSession().setMode("ace/mode/"+language);
}

//Close tab
function closeTab(element){
    angular.element(element).parent().parent().remove();
}

function activateTab(hash){
    var active_li = angular.element('#tab-list > .active');
    if(active_li.length>0){
        active_li[0].classList.remove("active");
    }
    angular.element('#tab'+hash).addClass("active");
}

function setLanguage(){

}