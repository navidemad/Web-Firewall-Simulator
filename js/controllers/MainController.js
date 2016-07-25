(function () {

  angular.module('myApp').controller('MainController', MainController);

  var rule_id = 0;
  angular.module('myApp').controller('RuleController', function ($scope, $uibModalInstance, ruleSelected) {
    $scope.data = {
      availableZones: [
        {id: 'inside', name: 'Inside'},
        {id: 'outside', name: 'Outside'}
      ],
      availableActions: [
        {id: 'allow', name: 'Allow'},
        {id: 'deny', name: 'Deny'}
      ],
    };
    if (ruleSelected !== void(0)) {
      $scope.ruleSelected = ruleSelected;
    }
    else {
      $scope.ruleSelected = {
        rule_id: -1,
        name: '',
        sourceZone: {id: 'inside', name: 'Inside'},
        sourceAddress: '',
        user: '',
        destinationZone: {id: 'outside', name: 'Outside'},
        destinationAddress: '',
        destinationPort: '',
        application: '',
        action: {id: 'allow', name: 'Allow'}
      };
    }
    $scope.save = function () {
      if ($scope.ruleSelected.rule_id === -1) {
        $scope.ruleSelected.rule_id = ++rule_id;
      }
      $uibModalInstance.close($scope.ruleSelected);
    };
    $scope.cancel = function () { $uibModalInstance.dismiss('cancel'); };
  });

  angular.module('myApp').controller('PacketController', function ($scope, $uibModalInstance, packetSelected) {
    if (packetSelected !== void(0)) {
      $scope.packetSelected = packetSelected;
    }
    else {
      $scope.packetSelected = {
        packetName: '',
        sourceAddress: '',
        user: '',
        destinationAddress: '',
        destinationPort: '',
        application: '',
      };
    }
    $scope.save   = function () { $uibModalInstance.close($scope.packetSelected); };
    $scope.cancel = function () { $uibModalInstance.dismiss('cancel'); };
  });

  MainController.$inject = ['$scope', '$controller', '$uibModal', 'ArrayService', 'DbService'];
  function MainController($scope, $controller, $uibModal, ArrayService, DbService) {

      $scope.rules = DbService.Rule.all();
      $scope.packets = DbService.Packet.all();

      $scope.nbRulesTested = 0;
      $scope.nbRulesFailed = 0;
      $scope.nbRulesSucceed = 0;

      $scope.nbRulesTotal = function () {
        return $scope.rules.length;
      };
      $scope.openPacketEditor = function (selectedPacket) {
        $uibModal.open({
          animation: true,
          templateUrl: '/modalPacketEditorContent.html?nd=' + Date.now(),
          controller: 'PacketController',
          size: 'lg',
          resolve: {
            packetSelected: function () {
              return selectedPacket;
            }
          }
        }).result.then(function (packet) {
          $scope.packets.push(packet);
          localStorage.setItem('packets', JSON.stringify($scope.packets));
        });
      };
      $scope.openRuleEditor = function (selectedRule) {
        $uibModal.open({
          animation: true,
          templateUrl: '/modalRuleEditorContent.html?nd=' + Date.now(),
          controller: 'RuleController',
          size: 'lg',
          resolve: {
            ruleSelected: function () {
              return selectedRule;
            }
          }
        }).result.then(function (rule) {
          DbService.Rule.update_or_create_by(rule);
          $scope.rules = DbService.Rule.all();
        });
      };
      $scope.deleteRule = function(selectedRule) {
        DbService.Rule.delete(selectedRule);
        $scope.rules = DbService.Rule.all();
      };
      $scope.moveElementUp = function(selectedRule) {
        ArrayService.moveElementUp($scope.rules, selectedRule);
        localStorage.setItem('rules', JSON.stringify($scope.rules));
      };
      $scope.moveElementDown = function(selectedRule) {
        ArrayService.moveElementDown($scope.rules, selectedRule);
        localStorage.setItem('rules', JSON.stringify($scope.rules));
      };
      $scope.deletePacket = function(selectedPacket) {
        ArrayService.deleteElement($scope.packets, selectedPacket);
        localStorage.setItem('packets', JSON.stringify($scope.packets));
      };

      $scope.packets = (localStorage.getItem('packets') !== null) ? JSON.parse(localStorage.getItem('packets')) : [];
      localStorage.setItem('packets', JSON.stringify($scope.packets));
      $scope.nbPacketsTotal = function () {
        return $scope.packets.length;
      };

      var passThroughFirewallRule = function (packet, rule, reason) {
        // PACKET
        var packetSRCAddr = ipaddr.parse(packet.sourceAddress);
        var packetDestAddr = ipaddr.parse(packet.destinationAddress);

        // RULE
        var ruleSRCAddr = ipaddr.parse(rule.sourceAddress.split("/")[0]);
        var ruleSRCAddrCIDR = ipaddr.parseCIDR(rule.sourceAddress);
        var ruleDestAddr = ipaddr.parse(rule.destinationAddress.split("/")[0]);
        var ruleDestAddrCIDR = ipaddr.parseCIDR(rule.destinationAddress);

        console.log("SRC RULE addr = " + ruleSRCAddr);
        console.log("SRC RULE addrCIDR = " + ruleSRCAddrCIDR);
        console.log("DEST RULE addr = " + ruleDestAddr);
        console.log("DEST RULE addrCIDR = " + ruleDestAddrCIDR);

        console.log("SRC PACKET addr = " + packetSRCAddr);
        console.log("DEST PACKET addr = " + packetDestAddr);

        if (!packetSRCAddr.match(ruleSRCAddrCIDR)) {
          reason.reason = "balbla";
          return false;
        }
        if (!packetDestAddr.match(ruleDestAddrCIDR)) {
          reason.reason = "balblabloublabla";
          return false;
        }
        if (rule.user != "any" && rule.user != packet.user) {
          reason.reason = "balblablou";
          return false;
        }
        // TODO: try every test
        return true;
      }
      function* generatorMethodSimulation(){

        for (var i = $scope.packets.length - 1; i >= 0; i--) {
          var packet = $scope.packets[i];
          packet.reasons = [];
        }
        yield* [false];

        for (var i = 0; i < $scope.packets.length; i++) {
          var packet = $scope.packets[i];

          packet.reasons = [];

           for (var j = 0; j < $scope.rules.length; j++) {
            var rule = $scope.rules[j];
            var newReason = {reason:''};

            if (!passThroughFirewallRule(packet, rule, newReason)) {
              console.log(newReason);
              packet.reasons.push(newReason);
            }
            $scope.$apply();

              console.log(packet.reasons);
            yield* [false];

          }
        }

      };

      var tm = null;
      var gen = null;

      function simulationLoop() {
        tm = setTimeout(function() {
          if (gen == null) {
            gen = generatorMethodSimulation();
          }
          if (gen.next().done) {
            clearTimeout(tm);
            tm = null;
            gen = null;
          } else{
            simulationLoop();
          }
        }, 500);
      };


      $scope.runSimulations = function () {
        $scope.nbRulesTested = 0;
        if (tm == null) {
          console.log("runSimulations");
          simulationLoop();
        }
      };

  }

}());
