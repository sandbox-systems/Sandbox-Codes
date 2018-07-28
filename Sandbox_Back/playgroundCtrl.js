let playgroundCtrl = function ($scope, $http) {
    $scope.scan = "";
    $http({
        method: 'POST',
        url: 'fileManager/requests/getAllProjectContents.php',
        headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'},
        data: $.param({
            owner: "aadhi0319",
            repo: "Sandbox",
            branch: "master",
            path: ""
        })
    }).then(function successCallback(response) {
        console.log(response.data);
        var resp = response.data;
        if (resp === "UNSYNCED") {
            // swal("GitHub session expired. Please login again to continue.");
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
                        html += "<li class='file' data-name='" + value.name + "' data-sha='" + value.sha + "'>" + key + "</li>";
                    } else if (value.type == "tree") {
                        html += "<li class='dropdownli folder' data-name='" + value.name + "' data-sha='" + value.sha + "'>" + key + "<ul>";
                        traverse(value);
                        html += "</ul></li>";
                    }
                });
            }
        }

        traverse(dir);
        $scope.scan = html;
    }, function errorCallback(response) {
        $scope.scan = "Error fetching data: " + JSON.stringify(response);
    });
};