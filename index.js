/**
 * XadillaX <i@2333.moe> created at 2017-07-28 15:31:36 with ❤
 *
 * Copyright (c) 2017 xcoder.in, all rights reserved.
 */
"use strict";

const path = require("path");

const cfork = require("cfork");

function doLog(akyuu, worker, msg) {
    const name = `${worker.process.pid} ${msg.id}`;
    const _msg = msg.msg;
    const meta = msg.meta;
    const level = msg.level;

    const logger = akyuu.logger.get(name);
    let log = logger[name];
    if(undefined === log) log = logger.info;

    log.call(logger, _msg, meta);
}

function onDisconnect(logger, worker) {
    logger.warn(`Worker ${worker.process.pid} disconnect.`, {
        exitedAfterDisconnect: worker.exitedAfterDisconnect,
        state: worker.state
    });
}

function onExit(logger, worker, code, signal) {
    const exitCode = worker.process.exitCode;
    logger.error(`Woeker ${worker.process.pid} died.`, {
        code: exitCode,
        signal: signal,
        exitedAfterDisconnect: worker.exitedAfterDisconnect,
        state: worker.state
    });
}

function onReachReforkLimit(logger) {
    logger.error(`Refork limit reached.`);
}

function startCluster(akyuuPath, listeners) {
    let entry = (this.config.cluster || {}).entry;
    if(!entry) {
        entry = path.join(require.main.filename, "../app.js");
    }
    const workerCount = (this.config.cluster || {}).workerCount || (require("os").cpus() - 1);

    const config = this.config.cluster || {};
    const env = JSON.parse(JSON.stringify(process.env));
    env.___AKYUU_PATH = akyuuPath;
    env.NODE_CONFIG = JSON.stringify({
        logger: {
            transports: [{
                type: "master"
            }, {
                type: "console",
                enabled: false
            }]
        }
    });
    env.AKYUU_NO_GENERATE_CONFIG = "true";

    const akyuu = this;
    const cf = cfork({
        exec: entry,
        count: workerCount,
        execArgv: [ "-r", path.join(__dirname, "prerequire.js") ],

        limit: config.limit,
        duration: config.duration,

        env: env,
        refork: true
    });

    const clusterLogger = akyuu.logger.get("cluster");
    cf.on("fork", function(worker) {
        worker.on("message", function(msg) {
            if(!msg) return;
            switch(msg.type) {
            case "log": doLog(akyuu, worker, msg); break;
            default: return;
            }
        });
    });
    cf.on("fork", function(worker) {
        clusterLogger.info(`Worker ${worker.process.pid} started.`);
    })

    listeners = listeners || {};
    if(listeners.onFork) cf.on("fork", listeners.onFork);
    if(listeners.onUnexpectedExit) cf.on("unexpectedExit", listeners.onUnexpectedExit);

    cf.on("disconnect", listeners.onDisconnect || onDisconnect.bind(akyuu, clusterLogger));
    cf.on("exit", listeners.onExit || onExit.bind(akyuu, clusterLogger));
    cf.on("reachReforkLimit", listeners.onReachReforkLimit || onReachReforkLimit.bind(akyuu, clusterLogger));

    return cf;
}

exports.startCluster = startCluster;
