define(['../paginated-resource.js', 'angular-mocks'], function (presource, mock) {
  'use strict';

  var $httpBackend;
  beforeEach(mock.inject(['$httpBackend', function(httpBackend){
    $httpBackend = httpBackend;
  }]));

  describe('paginated-resource', function () {
    it('exists', function () {
      return expect(presource.name).toBe('begriffs.paginated-resource');
    });
  });
});
