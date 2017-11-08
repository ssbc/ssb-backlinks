var FlumeQueryLinks = require('./lib/flumeview-links-raw')
var ssbKeys = require('ssb-keys')
var toUrlFriendly = require('base64-url').escape
var emitLinks = require('./emit-links')

var indexes = [
  { key: 'DTS', value: [['dest'], ['timestamp']] },
  { key: 'DTA', value: [['dest'], ['value', 'timestamp']] }, // asserted timestamp
  { key: 'TDT', value: [['value', 'content', 'type'], ['dest'], ['value', 'timestamp']] }
]

var indexVersion = 3

exports.name = 'backlinks'
exports.version = require('./package.json').version
exports.manifest = {
  read: 'source'
}

exports.init = function (ssb, config) {
  return ssb._flumeUse(
    `backlinks-${toUrlFriendly(ssb.id.slice(1, 10))}`,
    FlumeQueryLinks(indexes, emitLinks, indexVersion, unbox)
  )

  function unbox (msg) {
    if (typeof msg.value.content === 'string') {
      var value = unboxValue(msg.value)
      if (value) {
        return {
          key: msg.key, value: value, timestamp: msg.timestamp
        }
      }
    }
    return msg
  }

  function unboxValue (value) {
    var plaintext = null
    try {
      plaintext = ssbKeys.unbox(value.content, ssb.keys.private)
    } catch (ex) {}
    if (!plaintext) return null
    return {
      previous: value.previous,
      author: value.author,
      sequence: value.sequence,
      timestamp: value.timestamp,
      hash: value.hash,
      content: plaintext,
      private: true
    }
  }
}
