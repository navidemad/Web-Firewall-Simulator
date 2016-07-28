(function () {

  angular.module('myApp').directive('netmask', netmask);
  angular.module('myApp').directive('ipaddress', ipaddress);
  angular.module('myApp').directive('port', port);

  function netmask() {
    return {
        require: 'ngModel',
        link: function(scope,elem,attrs,ctrl){
            ctrl.$validators.netmask = function (modelValue,viewValue){
                if (ctrl.$isEmpty(modelValue)){
                    return false;
                }
                try {
                  if (viewValue.toLowerCase() != "any") {
                    var matches = viewValue.replace(/\s/g, '').split(",");
                    if (matches && matches.length > 0) {
                      for (var i = 0, length = matches.length; i < length; i++)
                        ipaddr.parseCIDR(matches[i]);
                    } else {
                      ipaddr.parseCIDR(viewValue);
                    }
                  }
                  return true;
                } catch(err) {
                  return false;
                }
            }
        }
    }
  }

  function ipaddress() {
    return {
        require: 'ngModel',
        link: function(scope,elem,attrs,ctrl){
            ctrl.$validators.ipaddress = function (modelValue,viewValue){
                if (ctrl.$isEmpty(modelValue)){
                    return false;
                }
                try {
                  if (viewValue.toLowerCase() != "any") {
                    var matches = viewValue.replace(/\s/g, '').split(",");
                    if (matches && matches.length > 0) {
                      for (var i = 0, length = matches.length; i < length; i++)
                        ipaddr.parse(matches[i]);
                    } else {
                      ipaddr.parse(viewValue);
                    }
                  }

                  return true;
                } catch(err) {
                  return false;
                }
            }
        }
    }
  }

  function port() {
    return {
        require: 'ngModel',
        link: function(scope,elem,attrs,ctrl){
            ctrl.$validators.port = function (modelValue,viewValue){
                if (ctrl.$isEmpty(modelValue)){
                    return false;
                }
                try {
                  if (viewValue == "any")
                    return true;
                  var p = parseInt(viewValue) || 0;
                  return !!(p >= 1 && p <= 65535);
                } catch(err) {
                  return false;
                }
            }
        }
    }
  }

}());
