# akyuu-cluster

Cluster module for Akyuu.js.

## Usage

```js
akyuu.startCluster(listeners);
akyuu.startCluster({
    onFork: function() {
        // ...
    }
});
```

> `listeners` is optional and it contains several listeners.
>
> + `onFork(worker)`
> + `onDisconnect(worker)`
> + `onExit(worker, code, signal)`
> + `onUnexpectedExit(worker, code, signal)`
> + `onReachReforkLimit()`
>
> Refer to https://github.com/node-modules/cfork#example.

### Configuration Block

```js
{
    cluster: {
        workerCount: <worker count>,
        entry: <your entry code filename>,
        limit: <refer https://github.com/node-modules/cfork#options>,
        duration: <refer https://github.com/node-modules/cfork#options>
    }
}
```

> All configuration is optional but you'd better specify `entry`.
