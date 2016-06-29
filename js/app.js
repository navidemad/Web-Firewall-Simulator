(function () {

  'use strict';

  // Including ui.bootstrap to handle UI
  var module = angular.module('myApp', ['ui.bootstrap']);

  /*
  ** MainController
  ** Listing rules and actions to add/edit/delete
  */
  module.controller('MainController', function($scope, $uibModal, $log) {

    $scope.nbRulesTested = 0;
    $scope.nbRulesFailed = 0;
    $scope.nbRulesSucceed = 0;

    $scope.rules = (localStorage.getItem('rules') !== null) ? JSON.parse(localStorage.getItem('rules')) : [];
    $scope.packets = (localStorage.getItem('packets') !== null) ? JSON.parse(localStorage.getItem('packets')) : [];

    localStorage.setItem('rules', JSON.stringify($scope.rules));
    localStorage.setItem('packets', JSON.stringify($scope.packets));

    $scope.nbRulesTotal = function () {
      return $scope.rules.length;
    };

    $scope.nbPacketsTotal = function () {
      return $scope.packets.length;
    };

    $scope.runSimulations = function () {
      angular.forEach($scope.packets, function(packet, _) {
        $log.info('packet: ' + packet);
      });
      $scope.nbRulesTested = 1;
    };

    $scope.openRuleEditor = function (selectedRule) {
      $uibModal.open({
        animation: true,
        templateUrl: '/modalRuleEditorContent.html',
        controller: 'RuleController',
        size: 'lg',
        resolve: {
          ruleSelected: function () {
            return selectedRule;
          }
        }
      }).result.then(function (rule) {
        $scope.rules.push(rule);
        localStorage.setItem('rules', JSON.stringify($scope.rules));
      });
    };

    $scope.deleteRule = function(selectedRule) {
      var idx = $scope.rules.indexOf(selectedRule);
      if (idx != -1) {
        $scope.rules.splice(idx, 1);
        localStorage.setItem('rules', JSON.stringify($scope.rules));
      }
    };

  });

  /*
  ** RuleController
  ** Popup saving rule
  */

  module.controller('RuleController', function ($scope, $uibModalInstance, $log, ruleSelected) {
    if (ruleSelected !== void(0)) {
      $scope.ruleSelected = ruleSelected;
    } else {
      $scope.ruleSelected = { 
        ruleName: '', 
        sourceZone: '', 
        sourceAddress: '', 
        user: '', 
        destinationZone: '', 
        destinationAddress: '', 
        destinationPort: '', 
        application: '', 
        action: '' 
      };
    }
    $scope.save   = function () { $uibModalInstance.close($scope.ruleSelected); };
    $scope.cancel = function () { $uibModalInstance.dismiss('cancel'); };
  });

}());
