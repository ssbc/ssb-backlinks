var FlumeQueryLinks = require('flumeview-query/links')
var ssbKeys = require('ssb-keys')
var toUrlFriendly = require('base64-url').escape
var emitLinks = require('./emit-links')

var indexes = [
  { key: 'DTS', value: [['dest'], ['timestamp']] },
  { key: 'DTA', value: [['dest'], ['rts']] }, // asserted timestamp
  { key: 'TDT', value: [['value', 'content', 'type'], ['dest'], ['rts']] }
]

var indexVersion = 8

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
      opts.unlinkedValues = true
      if (opts.index) {
        // backwards compatibility for opts.index sorting
        var sort = selectValueByKey(indexes, opts.index)
        if (sort) {
          opts.query = opts.query ? [].concat(opts.query) : []
          opts.query.push({
            $sort: sort
          })
        } else {
          throw new Error('Invalid index: ' + opts.index)
        }
      }
      return index.read(opts)
    }
  }
}

function selectValueByKey (indexes, key) {
  for (var i = 0; i < indexes.length; i++) {
    if (indexes[i].key === key) {
      return indexes[i].value
    }
  }
}