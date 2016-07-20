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

    return {
      Rule: {
        all: function() {
          return rules;
        },
        update_or_create_by: function(rule) {
          var count = 0;
          angular.forEach(rules, function(value, key) {
            if (value.rule_id === rule.rule_id) {
              rules[key] = rule;
              count++;
            }
          });
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
          if (localStorage.getItem('packets') !== null) {
            return JSON.parse(localStorage.getItem('packets'));
          }
          return [];
        }
      },
    }
  }

}());
