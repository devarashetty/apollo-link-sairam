"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var link_1 = require("../link");
var MockLink = /** @class */ (function (_super) {
    __extends(MockLink, _super);
    function MockLink(handleRequest) {
        if (handleRequest === void 0) { handleRequest = function () { return null; }; }
        var _this = _super.call(this) || this;
        _this.request = handleRequest;
        return _this;
    }
    MockLink.prototype.request = function (operation, forward) {
        throw Error('should be overridden');
    };
    return MockLink;
}(link_1.ApolloLink));
exports["default"] = MockLink;
