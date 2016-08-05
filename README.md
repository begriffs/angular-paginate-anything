<img src="img/paginate-anything-logo.png" alt="Logo" align="right" />
## Angular Directive to Paginate Anything
[![Build Status](https://travis-ci.org/begriffs/angular-paginate-anything.png?branch=master)](https://travis-ci.org/begriffs/angular-paginate-anything)

Add server-side pagination to any list or table on the page. This
directive connects a variable of your choice on the local scope with
data provied on a given URL. It provides a pagination user interface
that triggers updates to the variable through paginated AJAX requests.

Pagination is a distinct concern and should be handled separately from
other app logic. Do it right, do it in one place. Paginate anything!

### [DEMO](http://begriffs.github.io/angular-paginate-anything/)

### Usage

Include with bower

```sh
bower install angular-paginate-anything
```

The bower package contains files in the ```dist/```directory with the following names:

- angular-paginate-anything.js
- angular-paginate-anything.min.js
- angular-paginate-anything-tpls.js
- angular-paginate-anything-tpls.min.js

Files with the ```min``` suffix are minified versions to be used in production. The files with ```-tpls``` in their name have the directive template bundled. If you don't need the default template use the ```angular-paginate-anything.min.js``` file and provide your own template with the ```templateUrl``` attribute.

Load the javascript and declare your Angular dependency

```html
<script src="bower_components/angular-paginate-anything/dist/angular-paginate-anything-tpls.min.js"></script>
```

```js
angular.module('myModule', ['bgf.paginateAnything']);
```

Then in your view

```html
<!-- elements such as an ng-table reading from someVariable -->

<bgf-pagination
  collection="someVariable"
  url="'http://api.server.com/stuff'">
</bgf-pagination>
```

The `pagination` directive uses an external template stored in
`tpl/paginate-anything.html`.  Host it in a place accessible to
your page and set the `templateUrl` attribute. Note that the `url`
param can be a scope variable as well as a hard-coded string.

### Benefits

* Attaches to anything — ng-repeat, ng-grid, ngTable etc
* Server side pagination scales to large data
* Works with any MIME type through RFC2616 Range headers
* Handles finite or infinite lists
* Negotiates per-page limits with server
* Keeps items in view when changing page size
* Twitter Bootstrap compatible markup

### Directive Attributes

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
      <th>Access</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>url</td>
      <td>url of endpoint which returns a JSON array</td>
      <td>Read/write. Changing it will reset to the first page.</td>
    </tr>
    <tr>
      <td>url-params</td>
      <td>map of strings or objects which will be turned to ?key1=value1&key2=value2 after the url</td>
      <td>Read/write. Changing it will reset to the first page.</td>
    </tr>
    <tr>
      <td>headers</td>
      <td>additional headers to send during request</td>
      <td>Write-only.</td>
    </tr>
    <tr>
      <td>page</td>
      <td>the currently active page</td>
      <td>Read/write. Writing changes pages. Zero-based.</td>
    </tr>
    <tr>
      <td>per-page</td>
      <td>(default=`50`) Max number of elements per page</td>
      <td>Read/write. The server may choose to send fewer items though.</td>
    </tr>
    <tr>
      <td>per-page-presets</td>
      <td>Array of suggestions for per-page. Adjusts depending on server limits</td>
      <td>Read/write.</td>
    </tr>
    <tr>
      <td>auto-presets</td>
      <td>(default=`true`) Overrides per-page presets and client-limit to quantized values 1,2,5,10,25,50...</td>
      <td>Read/write.</td>
    </tr>
    <tr>
      <td>client-limit</td>
      <td>(default=`250`) Biggest page size the directive will show. Server response may be smaller.</td>
      <td>Read/write.</td>
    </tr>
    <tr>
      <td>link-group-size</td>
      <td>(default=`3`) Number of elements surrounding current page. <img src="img/link-group-size.png" alt="illustration" /></td>
      <td>Read/write.</td>
    </tr>
    <tr>
      <td>num-items</td>
      <td>Total items reported by server for the collection</td>
      <td>Read-only.</td>
    </tr>
    <tr>
      <td>num-pages</td>
      <td>num-items / per-page</td>
      <td>Read-only.</td>
    </tr>
    <tr>
      <td>server-limit</td>
      <td>Maximum results the server will send (Infinity if not yet detected)</td>
      <td>Read-only.</td>
    </tr>
    <tr>
      <td>range-from</td>
      <td>Position of first item in currently loaded range</td>
      <td>Read-only.</td>
    </tr>
    <tr>
      <td>range-to</td>
      <td>Position of last item in currently loaded range</td>
      <td>Read-only.</td>
    </tr>
    <tr>
      <td>reload-page</td>
      <td>If set to true, the current page is reloaded.</td>
      <td>Write-only.</td>
    </tr>
    <tr>
      <td>size</td>
      <td>Twitter bootstrap sizing `sm`, `md` (default), or `lg` for the navigation elements.</td>
      <td>Write-only.</td>
    </tr>
    <tr>
      <td>passive</td>
      <td>If using more than one pagination control set this to 'true' on all but the first.</td>
      <td>Write-only.</td>
    </tr>
    <tr>
      <td>transform-response</td>
      <td>Function that will get called once the http response has returned. See <a href="https://docs.angularjs.org/api/ng/service/$http">Angular's $https documentation for more information.</td>
      <td>Read/write. Changing it will reset to the first page.</td>
    </tr>
    <tr>
      <td>method</td>
      <td>Type of request method. Can be either GET or POST. Default is GET.</td>
      <td>Read/write.</td>
    </tr>
    <tr>
      <td>postData</td>
      <td>An array of data to be sent when method is set to POST.</td>
      <td>Read/write.</td>
    </tr>
    <tr>
      <td>load-fn</td>
      <td>A callback function to perform the request. Gets the http config as parameter and must return a promise.</td>
      <td>Write-only.</td>
    </tr>
  </tbody>
</table>

### Events

The directive emits events as pages begin loading (`pagination:loadStart`)
or finish (`pagination:loadPage`) or errors occur (`pagination:error`).
To catch these events do the following:

```js
$scope.$on('pagination:loadPage', function (event, status, config) {
  // config contains parameters of the page request
  console.log(config.url);
  // status is the HTTP status of the result
  console.log(status);
});
```

The `pagination:loadStart` is passed the client request rather than
the server response.

To trigger a reload the `pagination:reload` event can be send:

```js
function () {
  $scope.$broadcast('pagination:reload');
}
```

### How to deal with sorting, filtering and facets?

Your server is responsible for interpreting URLs to provide these
features.  You can connect the `url` attribute of this directive
to a scope variable and adjust the variable with query params and
whatever else your server recognizes. Or you can use the `url-params`
attribute to connect a map of strings or objects which will be
turned to ?key1=value1&key2=value2 after the url.  Changing the
`url` or `url-params` causes the pagination to reset to the first
page and maintain page size.

Example:
```js
$scope.url = 'api/resources';
$scope.urlParams = {
  key1: "value1",
  key2: "value2"
};
```

Will turn into the URL of the resource that is being requested: `api/resources?key1=value1&key2=value2`

### What your server needs to do

This directive decorates AJAX requests to your server with some
simple, standard headers. You read these headers to determine the
limit and offset of the requested data. Your need to set response
headers to indicate the range returned and the total number of items
in the collection.

You can write the logic yourself, or use one of the following server
side libraries.

<table>
  <thead>
    <tr>
      <th>Framework</th>
      <th>Solution</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Ruby on Rails</td>
      <td><a href="https://github.com/begriffs/clean_pagination">begriffs/clean_pagination</a> gem</td>
    </tr>
    <tr>
      <td rowspan="2">Node.js</td>
      <td><a href="https://github.com/polo2ro/node-paginate-anything">node-paginate-anything</a> module</td>
    </tr>
    <tr>
      <td><a href="https://github.com/begriffs/angular-paginate-anything/wiki/How-to-configure-NodeJS">Express JS from scratch howto</a></td>
    </tr>
    <tr>
      <td>ServiceStack for .NET</td>
      <td><a href="https://github.com/begriffs/angular-paginate-anything/wiki/How-to-configure-ServiceStack-for-.NET">Service Stack .NET howto</a></td>
    </tr>
    <tr>
      <td>ASP.NET Web API</td>
      <td><a href="https://github.com/begriffs/angular-paginate-anything/wiki/How-To-Configure-ASP.NET-Web-API">ASP.NET Web API howto</a></td>
    </tr>
  </tbody>
</table>

For a reference of a properly configured server, visit
[pagination.begriffs.com](http://pagination.begriffs.com/).

Here is an example HTTP transaction that requests the first twenty-five
items and a response that provides them and says there are one
hundred total items.

Request

```HTTP
GET /stuff HTTP/1.1
Range-Unit: items
Range: 0-24
```

Response

```HTTP
HTTP/1.1 206 Partial Content
Content-Range: 0-24/100
Range-Unit: items
Content-Type: application/json

[ etc, etc, ... ]
```

In short your server parses the `Range` header to find the zero-based
start and end item. It includes a `Content-Range` header in the
response disclosing the unit and range it chooses to return, along with the
total items after a slash, where total items can be "*" meaning
unknown or infinite.

When there are zero elements to return your server should send
status code 204 (no content), `Content-Range: */0`, and an empty
body (or `[]` if the endpoint normally returns a JSON array).

To do all this header stuff you'll need to enable CORS on your server.
In a Rails app you can do this by adding the following to `config/application.rb`:

```ruby
config.middleware.use Rack::Cors do
  allow do
    origins '*'
    resource '*',
      :headers => :any,
      :methods => [:get, :options],
      :expose => ['Content-Range', 'Accept-Ranges']
  end
end
```

For a more complete implementation including other appropriate responses
see my [clean_pagination](https://github.com/begriffs/clean_pagination) gem.

### Using the load-fn callback

Instead of having paginate-anything handle the http requests there is the option of using a callback function to perform the requests. This might be helpful e.g. if the data does not come from http endpoints, further processing of the request needs to be done prior to submitting the request or further processing of the response is necessary.

The callback can be used as follows:

```html
<bgf-pagination collection="data" page="filter.page" per-page="filter.perpage" load-fn="callback(config)"></bgf-pagination>
```

```js
$scope.callback = function (config) {
  return $http(config);
}

// alternatively
$scope.callback = function(config) {
  return $q(function(resolve) {
    resolve({
      data: ['a', 'b'],
      status: 200,
      config: {},
      headers: function(headerName) {
        // fake Content-Range headers
        return '0-1/*';
      }
    });
  });
}
```

### Further reading

* [Hypertext Transfer Protocol (HTTP/1.1): Range Requests](http://greenbytes.de/tech/webdav/draft-ietf-httpbis-p5-range-latest.html)
* [RFC2616 Section 3.12, custom range units](http://www.ietf.org/rfc/rfc2616.txt)
* [Beyond HTTP Header Links](http://blog.begriffs.com/2014/03/beyond-http-header-links.html)
* [Heroku recommends Range headers for pagination](https://github.com/interagent/http-api-design#paginate-with-ranges)

### Thanks

Thanks to [Steve Klabnik](https://twitter.com/steveklabnik) for
discussions about doing hypermedia/HATEOAS right, and to [Rebecca
Wright](https://twitter.com/rebecca_wrights) for reviewing and
improving my original user interface ideas for the paginator.
