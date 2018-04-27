var FlumeQueryLinks = require('flumeview-query/links')
var ssbKeys = require('ssb-keys')
var toUrlFriendly = require('base64-url').escape
var emitLinks = require('./emit-links')

var indexes = [
  { key: 'DTS', value: [['dest'], ['timestamp']] },
  { key: 'DTA', value: [['dest'], ['rts']] }, // asserted timestamp
  { key: 'TDT', value: [['value', 'content', 'type'], ['dest'], ['rts']] }
]

var indexVersion = 7

exports.name = 'backlinks'
exports.version = require('./package.json').version
exports.manifest = {
  read: 'source'
}

exports.init = function (ssb, config) {
  var index = ssb._flumeUse(
    `backlinks-${toUrlFriendly(ssb.id.slice(1, 10))}`,
    FlumeQueryLinks(indexes, emitLinks, indexVersion)
  )

  return {
    read: function (opts) {
      opts.includeOriginalMessageValue = true
      return index.read(opts)
    }
  }
}
