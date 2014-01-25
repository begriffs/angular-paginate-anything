define(['angular', 'angular-mocks', '../paginated-resource.js'], function (ng, mock) {
  'use strict';

  var $httpBackend, $resource;
  beforeEach(function () {
    mock.module('begriffs.paginated-resource');
    mock.inject(['$httpBackend', 'paginated-resource', function (httpBackend, resource) {
      $httpBackend = httpBackend;
      $resource = resource;
    }]);
  });

  describe('paginated-resource', function () {
    it('exists', function () {
      return expect($resource).toBeDefined();
    });
  });
});
