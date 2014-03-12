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
    'collection="collection"', 'page="page"',
    'client-limit="clientLimit"',
    'per-page="perPage"', 'url="/items"',
    'num-pages="numPages"'
  ].join(' ') + '></pagination>';

  function finiteStringBackend(s, maxRange) {
    maxRange = maxRange || s.length;

    return function(method, url, data, headers) {
      var m = headers.Range.match(/^(\d+)-(\d+)$/);
      if(m) {
        m[1] = +m[1];
        m[2] = +m[2];
        m[2] = Math.min(m[2] + 1, m[1] + maxRange);
        return [
          m[2] < s.length ? 206 : 200,
          s.slice(m[1], m[2]).split(''),
          {
            'Range-Unit': 'items',
            'Content-Range': [m[1], Math.min(s.length, m[2])-1].join('-') + '/' + s.length
          }
        ];
      }
    };
  }

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

    it('discovers server range limit when range comes back small', function () {
      $httpBackend.expectGET('/items').respond(
        finiteStringBackend('abcdefghijklmnopqrstuvwxyz', 2)
      );
      $compile(template)(scope);
      scope.$digest();
      $httpBackend.flush();
      expect(scope.numPages).toEqual(13);
      expect(scope.perPage).toEqual(2);
    });

    it('changing the page on the scope updates the collection', function () {
      $httpBackend.whenGET('/items').respond(
        finiteStringBackend('abcdefghijklmnopqrstuvwxyz', 20)
      );
      $compile(template)(scope);
      scope.$digest();
      $httpBackend.flush();

      scope.page = 1;
      scope.$digest();
      $httpBackend.flush();

      expect(scope.collection).toEqual(['u', 'v', 'w', 'x', 'y', 'z']);
    });

    it('can start on a different page', function () {
      scope.perPage = 20;
      scope.page = 1;
      $httpBackend.whenGET('/items').respond(
        finiteStringBackend('abcdefghijklmnopqrstuvwxyz', 20)
      );
      $compile(template)(scope);
      scope.$digest();
      $httpBackend.flush();

      expect(scope.collection).toEqual(['u', 'v', 'w', 'x', 'y', 'z']);
    });

    it('limited range at the end does not trigger resizing perPage', function () {
      scope.perPage = 20;
      scope.page = 1;
      $httpBackend.whenGET('/items').respond(
        finiteStringBackend('abcdefghijklmnopqrstuvwxyz', 20)
      );
      $compile(template)(scope);
      scope.$digest();
      $httpBackend.flush();

      scope.page = 0;
      scope.$digest();
      $httpBackend.flush();

      expect(scope.perPage).toEqual(20);
    });
  });
}());
