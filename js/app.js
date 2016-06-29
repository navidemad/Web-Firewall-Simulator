(function () {

  'use strict';

  // Including ui.bootstrap to handle UI
  var app = angular.module('myApp', ['ui.bootstrap']);

  /*
  ** RuleController
  ** Popup saving rule
  */
  app.factory('ArrayService', function() {
    return {
    	deleteElement: function(array, element) {
    		var index = array.indexOf(element);
    		if (index == -1) {
    			return false;
    		}
    		array.splice(index, 1);
    	},
    	moveElementUp: function(array, element) {
    		var index = array.indexOf(element);

    		// Item non-existent?
    		if (index == -1) {
    			return false;
    		}

    		// If there is a previous element in sections
    		if (array[index-1]) {
    			// Swap elements
    			array.splice(index - 1, 2, array[index], array[index-1]);
    		} else {
    			// Do nothing
    			return 0;
    		}
    	},
    	moveElementDown: function(array, element) {
    		var index = array.indexOf(element);

    		// Item non-existent?
    		if (index == -1) {
    			return false;
    		}

    		// If there is a next element in sections
    		if (array[index + 1]) {
    			// Swap elements
    			array.splice(index, 2, array[index + 1], array[index]);
    		} else {
    			// Do nothing
    			return 0;
    		}
    	}

    }
  });

  /*
  ** MainController
  ** Listing rules and actions to add/edit/delete
  */
  app.controller('MainController', function($scope, $uibModal, ArrayService, $log) {

    /*
    ** Tab: Rules
    */

      /*
      ** Rules data
      */
      $scope.rules = (localStorage.getItem('rules') !== null) ? JSON.parse(localStorage.getItem('rules')) : [];
      localStorage.setItem('rules', JSON.stringify($scope.rules));

      // Counters
      $scope.nbRulesTested = 0;
      $scope.nbRulesFailed = 0;
      $scope.nbRulesSucceed = 0;

      $scope.nbRulesTotal = function () {
        return $scope.rules.length;
      };

      // new/edit/delete buttons
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
        ArrayService.deleteElement($scope.rules, selectedRule);
        localStorage.setItem('rules', JSON.stringify($scope.rules));
      };
      $scope.moveElementUp = function(selectedRule) {
        ArrayService.moveElementUp($scope.rules, selectedRule);
        localStorage.setItem('rules', JSON.stringify($scope.rules));
      };
      $scope.moveElementDown = function(selectedRule) {
        ArrayService.moveElementDown($scope.rules, selectedRule);
        localStorage.setItem('rules', JSON.stringify($scope.rules));
      };

    /*
    ** Tab: Tester
    */

      /*
      ** Packets data
      */
      $scope.packets = (localStorage.getItem('packets') !== null) ? JSON.parse(localStorage.getItem('packets')) : [];
      localStorage.setItem('packets', JSON.stringify($scope.packets));

      $scope.nbPacketsTotal = function () {
        return $scope.packets.length;
      };

      $scope.runSimulations = function () {
        angular.forEach($scope.packets, function(packet, _) {
          $log.info('packet: ' + packet);
        });
        $scope.nbRulesTested = 1;
      };

    /*
    ** Tester
    */


  });

  /*
  ** RuleController
  ** Popup saving rule
  */
  app.controller('RuleController', function ($scope, $uibModalInstance, $log, ruleSelected) {
    // Edit mode
    if (ruleSelected !== void(0)) {
      $scope.ruleSelected = ruleSelected;
    }
    // New mode
    else {

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
