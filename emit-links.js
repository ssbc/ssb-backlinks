var ref = require('ssb-ref')
var deepEqual = require('deep-equal')
var extend = require('xtend')
var matchChannel = /^#[^\s#]+$/

module.exports = emitLinks

function emitLinks (msg, emit) {
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
