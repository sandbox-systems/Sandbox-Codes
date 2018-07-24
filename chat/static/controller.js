var app = angular.module('chat', []);

angular.module("chat").directive("selectNgFiles", function () {
    return {
        require: "ngModel",
        link: function postLink(scope, elem, attrs, ngModel) {
            elem.on("change", function (e) {
                var files = elem[0].files;
                ngModel.$setViewValue(files);
            })
        }
    }
});

app.controller('chatCtrl', function ($scope) {
    $scope.selected = 1;
    $scope.self = "Mosh May";
    $scope.chats = [
        "JJ john: Sed ut perspiciatis, unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa, quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt, explicabo. Nemo enim ipsam voluptatem, quia voluptas sit, aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos,",
        "DD doe: Hello! I have somethingggggggggggggggggg oiaoispasidoisjif jesifieosj fioifuu sid",
        "JJ john: Hello!",
        "DD doe: Hello!",
        "JJ john: Hello!",
        "DD doe: Hello!",
        "DD doe: Hello!",
        "JJ john: Hello!",
        "JJ john: Hello!"
    ];
    $scope.members = [
        "John Doe",
        "Jane Smith",
        "Shah Khan",
        "Shah Khan",
        "Linus Torvalds"
    ];
    $scope.friends = [
        "Wayne Randolph",
        "Darwin Valentine",
        "Maude Shepard"
    ];
    $scope.rooms = [
        ["Home Depot", ["John Doe", "Jane Smith"]],
        ["Radvok", ["John Doe"]],
        ["Sandbox", ["John Doe", "Jane Smith"]],
        ["Sandbox", ["John Doe", "Jane Smith"]],
        ["Microsoft", ["John Doe", "Jane Smith"]]
    ];
    $scope.trunc = function (str, n) {
        return (str.length > n) ? str.substr(0, n) + '..' : str;
    };
});
