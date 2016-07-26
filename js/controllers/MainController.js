(function () {

  angular.module('myApp').controller('MainController', MainController);

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
        user: '',
        application: '',
        sourceZone: {id: 'inside', name: 'Inside'},
        sourceAddress: '',
        destinationZone: {id: 'outside', name: 'Outside'},
        destinationAddress: '',
        destinationPort: 80,
        action: {id: 'deny', name: 'Deny'}
      };
    }
    $scope.save = function () {
      $scope.addrule.submitted = true;
      if($scope.addrule.$valid) {
        $uibModalInstance.close($scope.ruleSelected);
      } else {
        console.log('Errors in form data');
        console.log($scope.addrule.$error);
      }
    };
    $scope.cancel = function () { $uibModalInstance.dismiss('cancel'); };
  });

  angular.module('myApp').controller('PacketController', function ($scope, $uibModalInstance, packetSelected) {
    $scope.data = {
      availableZones: [
        {id: 'inside', name: 'Inside'},
        {id: 'outside', name: 'Outside'}
      ]
    };
    if (packetSelected !== void(0)) {
      $scope.packetSelected = packetSelected;
    }
    else {
      $scope.packetSelected = {
        packet_id: -1,
        user: '',
        application: '',
        sourceZone: {id: 'inside', name: 'Inside'},
        sourceAddress: '',
        destinationZone: {id: 'outside', name: 'Outside'},
        destinationAddress: '',
        destinationPort: 80,
        log_matched: ''
      };
    }
    $scope.save = function () {
      $scope.addpacket.submitted = true;
      if($scope.addpacket.$valid) {
        $uibModalInstance.close($scope.packetSelected);
      } else {
        console.log('Errors in form data');
        console.log($scope.addpacket.$error);
      }
    };
    $scope.cancel = function () { $uibModalInstance.dismiss('cancel'); };
  });

  MainController.$inject = ['$scope', '$controller', '$uibModal', 'ArrayService', 'DbService'];
  function MainController($scope, $controller, $uibModal, ArrayService, DbService) {

      $scope.rules = DbService.Rule.all();
      $scope.packets = DbService.Packet.all();

      $scope.nbRulesTotal = function () {
        return $scope.rules.length;
      };
      $scope.nbPacketsTotal = function () {
        return $scope.packets.length;
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
          DbService.Packet.update_or_create_by(packet);
          $scope.packets = DbService.Packet.all();
        });
      };
      $scope.deletePacket = function(selectedPacket) {
        DbService.Packet.delete(selectedPacket);
        $scope.packets = DbService.Packet.all();
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
      $scope.moveRuleElementUp = function(selectedRule) {
        ArrayService.moveElementUp($scope.rules, selectedRule);
        localStorage.setItem('rules', JSON.stringify($scope.rules));
      };
      $scope.moveRuleElementDown = function(selectedRule) {
        ArrayService.moveElementDown($scope.rules, selectedRule);
        localStorage.setItem('rules', JSON.stringify($scope.rules));
      };
      $scope.movePacketElementUp = function(selectedPacket) {
        ArrayService.moveElementUp($scope.packets, selectedPacket);
        localStorage.setItem('packets', JSON.stringify($scope.packets));
      };
      $scope.movePacketElementDown = function(selectedPacket) {
        ArrayService.moveElementDown($scope.packets, selectedPacket);
        localStorage.setItem('packets', JSON.stringify($scope.packets));
      };

      var passThroughFirewallRule = function (packet, rule) {
        var log = null;
        try {

          if (rule.user.toLowerCase() != "any" && rule.user.toLowerCase() != packet.user.toLowerCase())
            return [false, log];

          if (rule.application.toLowerCase() != "any" && rule.application.toLowerCase() != packet.application.toLowerCase())
            return [false, log];

          if (rule.sourceZone.name != packet.sourceZone.name)
            return [false, log];

          if (rule.destinationZone.name != packet.destinationZone.name)
            return [false, log];

          if (rule.destinationPort != packet.destinationPort)
            return [false, log];

          var packetSRCAddr = ipaddr.parse(packet.sourceAddress);
          var ruleSRCAddrCIDR = ipaddr.parseCIDR(rule.sourceAddress);
          if (!packetSRCAddr.match(ruleSRCAddrCIDR))
            return [false, log];

          var packetDestAddr = ipaddr.parse(packet.destinationAddress);
          var ruleDestAddrCIDR = ipaddr.parseCIDR(rule.destinationAddress);
          if (!packetDestAddr.match(ruleDestAddrCIDR))
            return [false, log];

          // inside -> outside, 10.10.1.2 -> 192.168.3.4, SSH, UDP 22, bob, Allow via Rule #2
          String.prototype.format = function () {
            var args = [].slice.call(arguments);
            return this.replace(/(\{\d+\})/g, function (a){
              return args[+(a.substr(1,a.length-2))||0];
            });
          };
          log = "{0} -> {1}, {2} -> {3}, {4}, {5}, {6}, {7} via Rule called '{8}'".format(
            packet.sourceZone.name,
            packet.destinationZone.name,
            packet.sourceAddress,
            packet.destinationAddress,
            packet.application,
            packet.destinationPort,
            packet.user,
            rule.action.name,
            rule.name
          );
        } catch (err) {
          alert(err.message);
          return [false, log];
        }
        return [true, log];
      }

      $scope.nbPacketsNotMatched = 0;
      $scope.nbPacketsMatched = 0;

      $scope.runSimulations = function () {
        $scope.nbPacketsNotMatched = 0;
        $scope.nbPacketsMatched = 0;

        for (var i = 0, length_i = $scope.packets.length; i < length_i; i++)
        {
          var packet = $scope.packets[i];
          for (var j = 0, length_j = $scope.rules.length; j < length_j; j++)
          {
            var rule = $scope.rules[j];
            var ret, log;
            [bool_matched, log_matched] = passThroughFirewallRule(packet, rule);
            if (bool_matched) {
              $scope.packets[i].log_matched = log_matched;
              $scope.nbPacketsMatched += 1;
              break;
            } else {
              $scope.nbPacketsNotMatched += 1;
            }
          }
        }

      };

  }

}());
