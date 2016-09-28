child_process = require 'child_process'
Dsl = require './dsl'
log = (require ('debug')) ('mockserver:log')
http = require 'http'

class MockApi
  constructor: (@options) ->

  start: (done) ->
    args = ['--port', @options.port]
    args.push '--no-log-to-console' unless @options.logToConsole
    if @options.logToFile
      args.push '--log-to-file'
      args.push @options.logToFile
    if @options.apiPath
      args.push '--api-path'
      args.push @options.apiPath
    if @options.staticPath
      args.push '--static-path'
      args.push @options.staticPath
      
    child_process.spawn "#{__dirname}/../bin/mock-api-server", args, {stdio: "inherit"}

    setTimeout done, 500
 
  stop: ->
    @_sendCommand 'stop'

  reset: ->
    @_sendCommand 'reset'

  respondTo: (args...) ->
    new Dsl @_addResponseSpecification, args

  _addResponseSpecification: (spec) =>
    req = http.request
      method: 'POST'
      headers:
        'Content-Type': 'application/json'
      port: @options.port
      path: '/mock-api/add-response'

#    req.on "error", (e) -> log "err" + e
#    req.on "response", (res) -> log res
    req.write JSON.stringify(spec)
    req.end()


  _sendCommand: (name) ->
    req = http.request
      method: 'GET'
      port: @options.port
      path: "/mock-api/#{name}"
    req.end()

module.exports = MockApi
