(function () {
  'use strict';

  var $httpBackend, $compile, scope;
  beforeEach(function () {
    angular.mock.module('begriffs.paginate-anything');
    angular.mock.module('tpl/paginate-anything.html');

    angular.mock.inject(
      ['$httpBackend', '$compile', '$rootScope',
      function (httpBackend, compile, rootScope) {
        $httpBackend = httpBackend;
        $compile = compile;
        scope = rootScope.$new();
      }]
    );
  });

  var template = '<pagination ' + [
    'collection="items"', 'page="page"',
    'client-limit="clientLimit"',
    'per-page="perPage"', 'url="/items"',
    'num-pages="numPages"'
  ].join(' ') + '></pagination>';

  describe('paginate-anything', function () {
    it('does not appear for a non-range-paginated resource', function () {
      $httpBackend.expectGET('/items').respond(200, '');
      var elt = $compile(template)(scope);
      scope.$digest();
      $httpBackend.flush();
      expect(elt.find('ul').length).toEqual(0);
    });

    it('does not appear for a ranged yet complete resource', function () {
      $httpBackend.expectGET('/items').respond(200,
        '', { 'Range-Unit': 'items', 'Content-Range': '0-24/25' }
      );
      var elt = $compile(template)(scope);
      scope.$digest();
      $httpBackend.flush();
      expect(elt.find('ul').length).toEqual(0);
    });

    it('appears for a ranged incomplete resource', function () {
      $httpBackend.expectGET('/items').respond(206,
        '', { 'Range-Unit': 'items', 'Content-Range': '0-24/26' }
      );
      var elt = $compile(template)(scope);
      scope.$digest();
      $httpBackend.flush();
      expect(elt.find('ul').length).toEqual(1);
    });

    it('starts at page 0', function () {
      $httpBackend.expectGET('/items').respond(206,
        '', { 'Range-Unit': 'items', 'Content-Range': '0-24/26' }
      );
      $compile(template)(scope);
      scope.$digest();
      $httpBackend.flush();
      expect(scope.page).toEqual(0);
    });

    it('knows total pages', function () {
      $httpBackend.expectGET('/items').respond(206,
        '', { 'Range-Unit': 'items', 'Content-Range': '0-24/26' }
      );
      $compile(template)(scope);
      scope.$digest();
      $httpBackend.flush();
      expect(scope.numPages).toEqual(2);
    });

  });
}());
