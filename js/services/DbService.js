(function () {

  angular.module('myApp').factory('DbService', DbService);

  DbService.$inject = ['ArrayService'];
  function DbService(ArrayService) {

    var rules;
    if (localStorage.getItem('rules') !== null) {
      rules = JSON.parse(localStorage.getItem('rules'));
    } else {
      rules = [];
    }

    var packets;
    if (localStorage.getItem('packets') !== null) {
      packets = JSON.parse(localStorage.getItem('packets'));
    } else {
      packets = [];
    }

    return {
      Rule: {
        all: function() {
          return rules;
        },
        update_or_create_by: function(rule) {
          var count = 0;
          angular.forEach(rules, function(value, key) {
            if (value.rule_id === rule.rule_id || value.name === rule.name) {
              rule.rule_id = value.rule_id;
              rules[key] = rule;
              count++;
            }
          });
          if (rule.rule_id == -1)
            rule.rule_id = Math.max(Math.max.apply(null, Object.keys(rules).map(f => rules[f].rule_id)) + 1, 1);
          if (count == 0)
            rules.push(rule);
          localStorage.setItem('rules', JSON.stringify(rules));
        },
        delete: function(rule) {
          ArrayService.deleteElement(rules, rule);
          localStorage.setItem('rules', JSON.stringify(rules));
        }
      },
      Packet: {
        all: function() {
          return packets;
        },
        update_or_create_by: function(packet) {
          var count = 0;
          angular.forEach(packets, function(value, key) {
            if (value.packet_id === packet.packet_id) {
              packets[key] = packet;
              count++;
            }
          });
          if (packet.packet_id == -1)
            packet.packet_id = Math.max(Math.max.apply(null, Object.keys(packets).map(f => packets[f].packet_id)) + 1, 1);
          if (count == 0)
            packets.push(packet);
          localStorage.setItem('packets', JSON.stringify(packets));
        },
        delete: function(packet) {
          ArrayService.deleteElement(packets, packet);
          localStorage.setItem('packets', JSON.stringify(packets));
        }
      },
    }
  }

}());
