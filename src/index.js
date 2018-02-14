"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
exports.__esModule = true;
__export(require("./link"));
var linkUtils_1 = require("./linkUtils");
exports.createOperation = linkUtils_1.createOperation;
exports.makePromise = linkUtils_1.makePromise;
exports.toPromise = linkUtils_1.toPromise;
exports.fromPromise = linkUtils_1.fromPromise;
var zen_observable_1 = require("zen-observable");
exports.Observable = zen_observable_1["default"];
