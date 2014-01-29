// Generated by CoffeeScript 2.0.0-beta7
void function () {
  var cache$, each, filter, patternMatcher, Responder, ResponseSpecification, size, sortBy, url;
  patternMatcher = require('./pattern_matcher');
  cache$ = require('underscore');
  each = cache$.each;
  filter = cache$.filter;
  size = cache$.size;
  sortBy = cache$.sortBy;
  url = require('url');
  ResponseSpecification = function () {
    function ResponseSpecification(param$) {
      var cache$1;
      {
        cache$1 = param$;
        this.method = cache$1.method;
        this.path = cache$1.path;
        this.query = cache$1.query;
        this.content = cache$1.content;
      }
    }
    return ResponseSpecification;
  }();
  Responder = function () {
    function Responder(fsHash) {
      this.responseMap = this._buildResponseMap(fsHash);
    }
    Responder.prototype.respondTo = function (request) {
      var allowedEntries, entries;
      entries = this.responseMap[this._stripExtension(request.path)];
      if (entries === void 0)
        return;
      allowedEntries = filter(entries, function (this$) {
        return function (entry) {
          return this$._entryAllowedForRequest(request, entry);
        };
      }(this));
      if (allowedEntries.length === 0)
        return;
      return allowedEntries[0].content;
    };
    Responder.prototype._stripExtension = function (path) {
      return path.replace(/\.json$/, '');
    };
    Responder.prototype._extractMethod = function (filename) {
      var method, path;
      method = filename.split('/')[1];
      path = filename.replace(/\/[^\/]*/, '');
      return {
        method: method,
        path: path
      };
    };
    Responder.prototype._buildResponseMap = function (fsHash) {
      var responseMap;
      responseMap = {};
      each(fsHash, function (this$) {
        return function (content, filename) {
          var entry;
          entry = this$._buildStaticResponseEntry(filename, content);
          if (null != responseMap[entry.path])
            responseMap[entry.path];
          else
            responseMap[entry.path] = [];
          return responseMap[entry.path].push(entry);
        };
      }(this));
      each(responseMap, function (entries, path) {
        return responseMap[path] = sortBy(entries, function (entry) {
          return 1e9 - size(entry.query);
        });
      });
      return responseMap;
    };
    Responder.prototype._buildStaticResponseEntry = function (filename, content) {
      var cache$1, cache$2, method, path, pathname, query;
      cache$1 = url.parse(filename, true);
      pathname = cache$1.pathname;
      query = cache$1.query;
      cache$2 = this._extractMethod(this._stripExtension(pathname));
      method = cache$2.method;
      path = cache$2.path;
      return new ResponseSpecification({
        content: content,
        method: method,
        path: path,
        query: query
      });
    };
    Responder.prototype._entryAllowedForRequest = function (request, responseMapEntry) {
      var matches;
      if (!(request.method === responseMapEntry.method))
        return false;
      matches = true;
      each(responseMapEntry.query, function (value, name) {
        if (!patternMatcher(value)(request.query[name]))
          return matches = false;
      });
      return matches;
    };
    return Responder;
  }();
  module.exports = Responder;
}.call(this);