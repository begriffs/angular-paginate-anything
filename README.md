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

Load the javascript and declare your Angular dependency

```js
angular.module('myModule', ['begriffs.paginate-anything']);
```

Then in your view

```html
<!-- elements such as an ng-table reading from someVariable -->

<begriffs.pagination collection="someVariable" url="'http://api.server.com/stuff'" />
```

The `pagination` directive uses an external template stored in
`tpl/paginate-anything.html`.  Host it in a place accessible to
your page and set the `template-url` attribute (see below).

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
      <td>Max number of elements per page</td>
      <td>Read/write. The server may choose to send fewer items though.</td>
    </tr>
    <tr>
      <td>per-page-presets</td>
      <td>Array of suggestions for per-page. Adjusts depending on server limits</td>
      <td>Read/write.</td>
    </tr>
    <tr>
      <td>client-limit</td>
      <td>Biggest page size the directive will show. Server response may be smaller.</td>
      <td>Read/write.</td>
    </tr>
    <tr>
      <td>monkey-number</td>
      <td>If true, forces the per-page and client-limit value to be a value in the sequence of 1 2 5 10 25 50 100 250 500 ...</td>
      <td>Read/write.</td>
    </tr>
    <tr>
      <td>link-group-size</td>
      <td>Number of elements surrounding current page. <img src="img/link-group-size.png" alt="illustration" /></td>
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
  </tbody>
</table>

### How to deal with sorting, filtering and facets?

Your server is responsible for interpreting URLs to provide these
features.  You can connect the `url` attribute of this directive
to a scope variable and adjust the variable with query params and
whatever else your server recognizes. Changing the url causes the
pagination to reset to the first page and maintain page size.

### What your server needs to do

This directive decorates AJAX requests to your server with some
simple, standard headers. You read these headers to determine the
limit and offset of the requested data. Your need to set response
headers to indicate the range returned and the total number of items
in the collection.

You can write the logic yourself, or try a **pre-made library like
[begriffs/clean_pagination](https://github.com/begriffs/clean_pagination).**

For a reference of a properly configured server, visit
[pagination.begriffs.com](http://pagination.begriffs.com/).

Here is an example HTTP transaction that requests the first twenty-five
items and a response that provides them and says there are one
hundred total items.

Request

```HTTP
GET /items HTTP/1.1
Range-Unit: items
Range: 0-24
```

Response

```HTTP
HTTP/1.1 206 Partial Content
Accept-Ranges: items
Content-Range: 0-24/100
Range-Unit: items
Content-Type: application/json

[ etc, etc, ... ]
```

In short your server parses the `Range` header to find the zero-based
start and end item. It includes a `Content-Range` header in the
response disclosing the range it chooses to return, along with the
total items after a slash, where total items can be "*" meaning
unknown or infinite.

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

### Further reading

* [Hypertext Transfer Protocol (HTTP/1.1): Range Requests](http://greenbytes.de/tech/webdav/draft-ietf-httpbis-p5-range-latest.html)
* [RFC2616 Section 3.12, custom range units](http://www.ietf.org/rfc/rfc2616.txt)
* [Beyond HTTP Header Links](http://blog.begriffs.com/2014/03/beyond-http-header-links.html)

### Thanks

Thanks to [Steve Klabnik](https://twitter.com/steveklabnik) for
discussions about doing hypermedia/HATEOAS right, and to [Rebecca
Wright](https://twitter.com/rebecca_wrights) for reviewing and
improving my original user interface ideas for the paginator.
