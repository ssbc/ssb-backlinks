var FlumeQueryLinks = require('./lib/flumeview-links-raw')
var ref = require('ssb-ref')
var deepEqual = require('deep-equal')
var extend = require('xtend')
var matchChannel = /^#[^\s#]+$/
var ssbKeys = require('ssb-keys')
var toUrlFriendly = require('base64-url').escape

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
    FlumeQueryLinks(indexes, extractLinks, indexVersion, unbox)
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

function extractLinks (msg, emit) {
  var links = new Set()
  walk(msg.value.content, function (path, value) {
    // HACK: handle legacy channel mentions
    if (deepEqual(path, ['channel']) && typeof value === 'string' && value.length < 30) {
      value = `#${value.replace(/\s/g, '')}`
    }

    // TODO: should add channel matching to ref.type
    if (ref.type(value) || isChannel(value)) {
      links.add(value)
    }
  })
  links.forEach(link => {
    emit(extend(msg, {
      dest: link
    }))
  })
}

function isChannel (value) {
  return typeof value === 'string' && value.length < 30 && matchChannel.test(value)
}

function walk (obj, fn, prefix) {
  if (obj && typeof obj === 'object') {
    for (var k in obj) {
      walk(obj[k], fn, (prefix || []).concat(k))
    }
  } else {
    fn(prefix, obj)
  }
}
