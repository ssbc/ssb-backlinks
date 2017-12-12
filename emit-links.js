var ref = require('ssb-ref')
var deepEqual = require('deep-equal')
var extend = require('xtend')
var matchChannel = /^#[^\s#]+$/

module.exports = emitLinks

function emitLinks (msg, emit) {
  var links = new Set()
  walk(msg.value.content, function (path, value) {
    // HACK: handle legacy channel mentions
    if (deepEqual(path, ['channel'])) {
      var channel = ref.normalizeChannel(value)
      if (channel) {
        value = `#${channel}`
      }
    }

    // TODO: should add channel matching to ref.type
    if (ref.type(value)) {
      links.add(value)
    } else if (isChannel(value)) {
      links.add(`#${ref.normalizeChannel(value.slice(1))}`)
    }
  })
  links.forEach(link => {
    emit(extend(msg, {
      rts: resolveTimestamp(msg),
      dest: link
    }))
  })
}

function isChannel (value) {
  return typeof value === 'string' && value.length < 30 && matchChannel.test(value)
}

function resolveTimestamp (msg) {
  if (!msg || !msg.value || !msg.value.timestamp) return
  if (msg.timestamp) {
    return Math.min(msg.timestamp, msg.value.timestamp)
  } else {
    return msg.value.timestamp
  }
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
