const test = require('ava')
const sinon = require('sinon')
const ref = require('ssb-ref')
const emitLinks = require('../emit-links')

let emit = sinon.stub()

test.before(() => {
  sinon.stub(ref, 'normalizeChannel')
  sinon.stub(ref, 'type')
})

test.afterEach(() => {
  ref.normalizeChannel.reset()
  ref.type.reset()
  emit.reset()
})

test.after.always(() => {
  ref.normalizeChannel.restore()
  ref.type.restore()
})

test('emitLinks does not call emit fn if there are no links', (t) => {
  const msg = { value: { content: {} } }
  emitLinks(msg, emit)
  t.true(emit.notCalled)
})

test('emitLinks calls emit fn if links are found in content', (t) => {
  const msg = { value: { content: { contact: 'contact-id' } } }
  ref.type.returns(true)
  emitLinks(msg, emit)
  t.true(emit.calledOnce)
})

test('emitLinks does not call emit fn for duplicate links', (t) => {
  const msg = { value: { content: { contact: 'contact-id', contact2: 'contact-id' } } }
  ref.type.returns(true)
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
  const msg = { value: { content: { contact: 'contact-id' }, timestamp: 1 } }
  ref.type.returns(true)
  emitLinks(msg, emit)
  t.true(emit.calledWith(Object.assign(msg, {
    rts: 1,
    dest: 'contact-id'
  })))
})
