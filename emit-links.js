var ref = require('ssb-ref')
var matchChannel = /^#[^\s#]+$/

module.exports = emitLinks

// we don't need invite and address types, so don't use ref.type as those are quite slow
function type(id) {
  if(typeof(id) !== 'string') return ''
  var c = id.charAt(0)
  if (c == '@' && ref.isFeedId(id))
    return 'feed'
  else if (c == '%' && ref.isMsgId(id))
    return 'msg'
  else if (c == '&' && ref.isBlobId(id))
    return 'blob'
  else if (c == '#' && isChannel(id))
    return 'channel'
  else
    return ''
}

function emitLinks (msg, emit) {
  var links = new Set()
  walk(msg.value.content, function (path, value) {
    // HACK: handle legacy channel mentions
    if (Array.isArray(path) && path[0] === 'channel') {
      var channel = ref.normalizeChannel(value)
      if (channel) {
        value = `#${channel}`
      }
    }

    var idType = type(value)

    if (idType == 'channel')
      links.add(`#${ref.normalizeChannel(value.slice(1))}`)
    else if (idType != '')
      links.add(value)
  })
  links.forEach(link => {
    emit(Object.assign({}, msg, {
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
