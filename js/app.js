var module = angular.module('myApp', []);

module.controller('MainController', function($scope) {

  var generateEmptyRule = function () {
    return { // Used for adding rules feature
      ruleName: '',
      propertie1: 0,
      propertie2: ''
    };
  }

  $scope.rules = [{
    ruleName: 'Default',
    propertie1: 0x342,
    propertie2: 'all'
  }];

  $scope.tmpRule = generateEmptyRule(); // Used for adding rules feature

  $scope.addNewRule = function () {
    $scope.rules.push($scope.tmpRule);
    $scope.tmpRule = generateEmptyRule()
  }

  console.log('controller');
});
