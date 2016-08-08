(function () {

  angular.module('myApp').controller('MainController', MainController);

  angular.module('myApp').controller('RuleController', function ($scope, $uibModalInstance, ruleSelected) {
    $scope.data = {
      availableActions: [
        {id: 'allow', name: 'allow'},
        {id: 'deny', name: 'deny'}
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
        sourceZone: '',
        sourceAddress: '',
        destinationZone: '',
        destinationAddress: '',
        destinationPort: null,
        action: null
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
    if (packetSelected !== void(0)) {
      $scope.packetSelected = packetSelected;
    }
    else {
      $scope.packetSelected = {
        packet_id: -1,
        user: '',
        application: '',
        sourceZone: '',
        sourceAddress: '',
        destinationZone: '',
        destinationAddress: '',
        destinationPort: null,
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

  MainController.$inject = ['$scope', '$controller', '$uibModal', '$q', 'ArrayService', 'DbService', 'FileInputService'];
  function MainController($scope, $controller, $uibModal, $q, ArrayService, DbService, FileInputService) {

      $scope.onFileUpload = function (element) {
        $scope.$apply(function (scope) {
          for (var i = 0, length = element.files.length; i < length; i++) {
            FileInputService.readFileAsync(element.files[i]).then(function(paloAltoNetworkContent) {
              $scope.importPAN(paloAltoNetworkContent);
            });
          }
        });
      };

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
      $scope.importPAN = function (paloAltoNetworkContent) {

        paloAltoNetworkContent = paloAltoNetworkContent.replace(/\[\s+/gi, '[');
        paloAltoNetworkContent = paloAltoNetworkContent.replace(/\s+\]/gi, ']');
        paloAltoNetworkContent = paloAltoNetworkContent.replace(/[ |\t]+/gi, ' ');
        paloAltoNetworkContent = paloAltoNetworkContent.replace(/([a-zA-Z0-9-./]+) ([\[\]a-zA-Z0-9-./ ]+);?/gi, '"$1": "$2",');
        paloAltoNetworkContent = paloAltoNetworkContent.replace(/"\[(.*)\]"/gi, '[$1]');
        paloAltoNetworkContent = paloAltoNetworkContent.replace(/, }/gi, ' }');
        paloAltoNetworkContent = paloAltoNetworkContent.replace(/([a-zA-Z0-9-.]+) \{/gi, '"$1": {');
        var lines = paloAltoNetworkContent.match(/[^\r\n]+/g);
        for (var i = 0, length = lines.length; i < length; i++) {
         matches = lines[i].match(/\[([^\]]+)\]/)
         if (matches && matches.length > 1) {
           var s = "[" + matches[1].split(" ").map(function(e) {return '"' + e + '"'}).join(", ") + "]";
           paloAltoNetworkContent = paloAltoNetworkContent.replace(`[${matches[1]}]`, s);
         }
        }
        paloAltoNetworkContent = paloAltoNetworkContent.replace(/\s+/gi, ' ');
        paloAltoNetworkContent = paloAltoNetworkContent.replace(/\}/gi, '},');
        paloAltoNetworkContent = paloAltoNetworkContent.replace(/, \}/gi, ' }');
        paloAltoNetworkContent = "{" + paloAltoNetworkContent + "}";
        paloAltoNetworkContent = paloAltoNetworkContent.replace(/\},\s?\}/gi, '} }');

        var obj = JSON.parse(paloAltoNetworkContent);

        var pan_rules = obj['rulebase']['security']['rules'];
        var pan_addresses = obj['address'];
        var pan_address_groups = obj['address-group'];

        var merge_array = function (array1, array2) {
            var result_array = [];
            var arr = array1.concat(array2);
            var len = arr.length;
            var assoc = {};

            while(len--) {
                var item = arr[len];

                if(!assoc[item])
                {
                    result_array.unshift(item);
                    assoc[item] = true;
                }
            }

            return result_array;
        }

        var replace_addresses = function (input, addresses, address_groups) {
          var inputs = (typeof input == 'string') ? [input] : input;
          var tmp_addresses = [];
          for (var _ in inputs) {
            let address_value = inputs[_];
            var found = false;
            try {
              if (!found) {
                for (var address_name in addresses) {
                  if (address_name === address_value) {
                    tmp_addresses = merge_array(tmp_addresses, replace_addresses(addresses[address_name]['ip-netmask'], addresses, address_groups));
                    found = true;
                    break;
                  }
                }
              }
              if (!found) {
                for (var address_group_name in address_groups) {
                  if (address_group_name === address_value) {
                    tmp_addresses = merge_array(tmp_addresses, replace_addresses(address_groups[inputs[_]]['static'], addresses, address_groups));
                    found = true;
                    break;
                  }
                }
              }
              if (!found) {
                tmp_addresses = merge_array(tmp_addresses, [address_value]);
              }
            }
            catch (err) {
              console.log('Error occured: ' + err.message);
            }
          }
          return tmp_addresses;
        }
        for (var rule_name in pan_rules) {
            let rule = pan_rules[rule_name];
            var new_rule = {};
            new_rule.rule_id = -1;
            new_rule.name = rule_name;
            new_rule.user = rule['source-user'];
            new_rule.application = rule['application'];
            new_rule.sourceAddress = replace_addresses(rule['source'], pan_addresses, pan_address_groups);
            new_rule.sourceZone = rule['from'];
            new_rule.destinationAddress = replace_addresses(rule['destination'], pan_addresses, pan_address_groups);
            new_rule.destinationZone = rule['to'];
            new_rule.destinationPort = ('port' in rule) ? rule['port'] : 'any';
            new_rule.action = {id: rule['action'], name: rule['action']}
            DbService.Rule.update_or_create_by(new_rule);
        }
        $scope.rules = DbService.Rule.all();

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

          if (rule.sourceZone.toLowerCase() != "any" && rule.sourceZone.toLowerCase() != packet.sourceZone.toLowerCase())
            return [false, log];

          if (rule.destinationZone.toLowerCase() != "any" && rule.destinationZone.toLowerCase() != packet.destinationZone.toLowerCase())
            return [false, log];

          if (rule.destinationPort.toLowerCase() != "any" && rule.destinationPort.toLowerCase() != packet.destinationPort.toLowerCase())
            return [false, log];

          var packetSRCAddr = ipaddr.parse(packet.sourceAddress);
          for (var _ in rule.sourceAddress) {
            let sourceAddr = rule.sourceAddress[_];
            if (sourceAddr.toLowerCase() == "any")
              break;
            var ruleSRCAddrCIDR = ipaddr.parseCIDR(sourceAddr);
            if (!packetSRCAddr.match(ruleSRCAddrCIDR))
              return [false, log];
          }

          var packetDestAddr = ipaddr.parse(packet.destinationAddress);
          for (var _ in rule.destinationAddress) {
            let destinationAddr = rule.destinationAddress[_];
            if (destinationAddr.toLowerCase() == "any")
              break;
            var ruleDestAddrCIDR = ipaddr.parseCIDR(destinationAddr);
            if (!packetDestAddr.match(ruleDestAddrCIDR))
              return [false, log];
          }

          String.prototype.format = function () {
            var args = [].slice.call(arguments);
            return this.replace(/(\{\d+\})/g, function (a){
              return args[+(a.substr(1,a.length-2))||0];
            });
          };
          log = "{0} -> {1}, {2} -> {3}, {4}, {5}, {6}, {7} via Rule called '{8}'".format(
            packet.sourceZone,
            packet.destinationZone,
            packet.sourceAddress,
            packet.destinationAddress,
            packet.application,
            packet.destinationPort,
            packet.user,
            rule.action.name,
            rule.name
          );
        } catch (err) {
          console.log(err);
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
