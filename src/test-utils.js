"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
exports.__esModule = true;
var mockLink_1 = require("./test-utils/mockLink");
exports.MockLink = mockLink_1["default"];
var setContext_1 = require("./test-utils/setContext");
exports.SetContextLink = setContext_1["default"];
__export(require("./test-utils/testingUtils"));
