/**
 * XadillaX <i@2333.moe> created at 2017-07-28 16:10:25 with ❤
 *
 * Copyright (c) 2017 xcoder.in, all rights reserved.
 */
"use strict";

const path = require("path");

// 千万别用 NPM 3+，会挂掉！
// 我恨 flatten 依赖！
const winston = require(path.join(process.env.___AKYUU_PATH, "node_modules/winston"));

class MasterLogger extends winston.Transport {
    constructor(options) {
        super();
        this.name = "master";
        this.level = "silly";
        this.id = options.id;
    }

    log(level, msg, meta, callback) {
        callback(null, process.send({
            level: level,
            msg: msg,
            meta: meta,
            id: this.id,
            type: "log"
        }));
    }
}

winston.transports.Master = MasterLogger;
