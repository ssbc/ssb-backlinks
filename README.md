# ssb-backlinks

[scuttlebot](http://scuttlebutt.nz/) plugin for indexing all link mentions of messages (including private for the current identity).

Walks all values of a message searching for [ssb-ref](https://github.com/ssbc/ssb-ref) recognized keys. Provides an [ssb-query](https://github.com/dominictarr/ssb-query) style interface.

## Example usage

```js
const pull = require('pull-stream')
function createBacklinkStream (id) {
  var filterQuery = {
    $filter: {
      dest: id
    }
  }

  return sbot.backlinks.read({
    query: [filterQuery],
    index: 'DTA', // use asserted timestamps
    live: true
  })
}

const msgKey = '%+zYA9WF9cY+HqGLzqS1H7FdUdK45tUmTqiZ85p+RNOQ=.sha256'
var relatedMessages = []

pull(
  createBacklinkStream(msgKey),
  pull.filter(msg => !msg.sync),
    // note the 'live' style streams emit { sync: true } when they're up to date!
  pull.drain(msg => {
    relatedMessages.push(msg)
  })
)
```

## Example usage as a Secret-Stack Plugin
`ssb-backlinks` can also be used as a `secret-stack`
[plugin](https://github.com/ssbc/secret-stack/blob/master/plugins.md) directly.

```js
var SecretStack = require('secret-stack')
var config = require('./some-config-file')

var {pull, drain} = require('pull-stream')

// you'd need many more plugins to make this useful
// demo purposes only
var create = SecretStack({
  appKey: appKey //32 random bytes
})
.use(require('ssb-db'))
.use(require('ssb-backlinks'))
.use(function (sbot, config) {
  pull(
    sbot.backlink.read({
      query: [{$filter: {dest: "%dfadf..."}}], // some message hash
      index: 'DTA',
      live: true
    }),
    drain(console.log)
  )
)}

var server = create(config) // start application
```

## Versions

Please note that 0.7.0 requires scuttlebot 11.3

## License

MIT
