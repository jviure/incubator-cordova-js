/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
*/

var cordova = require('cordova'),
    nativeApiProvider = require('cordova/plugin/android/nativeapiprovider'),
    POLL_INTERVAL = 50,
    enabled = false;

function pollOnce() {
    var exec = require('cordova/exec'),
        msg = nativeApiProvider.get().retrieveJsMessages();
    exec.processMessages(msg);
}

function doPoll() {
    if (!enabled) {
        return;
    }
    pollOnce();
    setTimeout(doPoll, POLL_INTERVAL);
}

module.exports = {
    start: function() {
        enabled = true;
        setTimeout(doPoll, 1);
    },
    stop: function() {
        enabled = false;
    },
    pollOnce: pollOnce
};

