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

## Versions

Please note that 0.6.2 requires scuttlebot 11.3

## License

MIT
