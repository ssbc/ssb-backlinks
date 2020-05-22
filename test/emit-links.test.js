const test = require('ava')
const sinon = require('sinon')
const ref = require('ssb-ref')
const emitLinks = require('../emit-links')

let emit = sinon.stub()

test.before(() => {
  sinon.stub(ref, 'normalizeChannel')
})

test.afterEach(() => {
  ref.normalizeChannel.reset()
  emit.reset()
})

test.after.always(() => {
  ref.normalizeChannel.restore()
})

test('emitLinks does not call emit fn if there are no links', (t) => {
  const msg = { value: { content: {} } }
  emitLinks(msg, emit)
  t.true(emit.notCalled)
})

test('emitLinks calls emit fn if links are found in content', (t) => {
  const msg = { value: { content: { contact: '@6CAxOI3f+LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4+Uv0=.ed25519' } } }
  emitLinks(msg, emit)
  t.true(emit.calledOnce)
})

test('emitLinks does not call emit fn for duplicate links', (t) => {
  const msg = { value: { content: { contact: '@6CAxOI3f+LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4+Uv0=.ed25519', contact2: '@6CAxOI3f+LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4+Uv0=.ed25519' } } }
  emitLinks(msg, emit)
  t.true(emit.calledOnce)
})

test('emitLinks should normalize the link if it is a channel', (t) => {
  const msg = { value: { content: { channel: 'channel-name' } } }
  ref.normalizeChannel.returnsArg(0)
  emitLinks(msg, emit)
  t.true(ref.normalizeChannel.firstCall.calledWith('channel-name'))
  t.true(emit.calledOnce)
})

test('emitLinks should call emit fn with added rts and dest fields', (t) => {
  const msg = { value: { content: { contact: '@6CAxOI3f+LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4+Uv0=.ed25519' }, timestamp: 1 } }
  emitLinks(msg, emit)
  t.true(emit.calledWith(Object.assign({}, msg, {
    rts: 1,
    dest: '@6CAxOI3f+LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4+Uv0=.ed25519'
  })))
})
