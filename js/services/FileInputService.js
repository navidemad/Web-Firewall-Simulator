(function () {

  angular.module('myApp').service('FileInputService', function ($q) {

      this.readFileAsync = function (file) {
          var deferred = $q.defer();
          var fileReader = new FileReader();
          fileReader.readAsText(file);
          fileReader.onload = function (e) {
              deferred.resolve(e.target.result);
          };
          return deferred.promise;
      };
  });

}());
