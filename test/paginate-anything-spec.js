(function () {
  'use strict';

  var $httpBackend, $compile, $rootScope;
  beforeEach(function () {
    angular.mock.module('begriffs.paginate-anything');
    angular.mock.module('tpl/paginate-anything.html');

    angular.mock.inject(
      ['$httpBackend', '$compile', '$rootScope',
      function (httpBackend, compile, rootScope) {
        $httpBackend = httpBackend;
        $compile = compile;
        $rootScope = rootScope;
      }]
    );
  });

  describe('paginate-anything', function () {
    it('has buttons', function () {
      var elt = $compile('<pagination>hi</pagination>')($rootScope);
      $rootScope.$digest();
      console.log(elt.html());
    });
  });
}());
