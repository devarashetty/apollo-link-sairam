"use strict";
exports.__esModule = true;
var Observable = require("zen-observable");
var linkUtils_1 = require("./linkUtils");
var passthrough = function (op, forward) { return (forward ? forward(op) : Observable.of()); };
var toLink = function (handler) {
    return typeof handler === 'function' ? new ApolloLink(handler) : handler;
};
exports.empty = function () {
    return new ApolloLink(function (op, forward) { return Observable.of(); });
};
exports.from = function (links) {
    if (links.length === 0)
        return exports.empty();
    return links.map(toLink).reduce(function (x, y) { return x.concat(y); });
};
exports.split = function (test, left, right) {
    if (right === void 0) { right = new ApolloLink(passthrough); }
    var leftLink = toLink(left);
    var rightLink = toLink(right);
    if (linkUtils_1.isTerminating(leftLink) && linkUtils_1.isTerminating(rightLink)) {
        return new ApolloLink(function (operation) {
            return test(operation)
                ? leftLink.request(operation) || Observable.of()
                : rightLink.request(operation) || Observable.of();
        });
    }
    else {
        return new ApolloLink(function (operation, forward) {
            return test(operation)
                ? leftLink.request(operation, forward) || Observable.of()
                : rightLink.request(operation, forward) || Observable.of();
        });
    }
};
// join two Links together
exports.concat = function (first, second) {
    var firstLink = toLink(first);
    if (linkUtils_1.isTerminating(firstLink)) {
        console.warn(new linkUtils_1.LinkError("You are calling concat on a terminating link, which will have no effect", firstLink));
        return firstLink;
    }
    var nextLink = toLink(second);
    if (linkUtils_1.isTerminating(nextLink)) {
        return new ApolloLink(function (operation) {
            return firstLink.request(operation, function (op) { return nextLink.request(op) || Observable.of(); }) || Observable.of();
        });
    }
    else {
        return new ApolloLink(function (operation, forward) {
            return (firstLink.request(operation, function (op) {
                return nextLink.request(op, forward) || Observable.of();
            }) || Observable.of());
        });
    }
};
var ApolloLink = /** @class */ (function () {
    function ApolloLink(request) {
        if (request)
            this.request = request;
    }
    ApolloLink.prototype.split = function (test, left, right) {
        if (right === void 0) { right = new ApolloLink(passthrough); }
        return this.concat(exports.split(test, left, right));
    };
    ApolloLink.prototype.concat = function (next) {
        return exports.concat(this, next);
    };
    ApolloLink.prototype.request = function (operation, forward) {
        throw new Error('request is not implemented');
    };
    ApolloLink.empty = exports.empty;
    ApolloLink.from = exports.from;
    ApolloLink.split = exports.split;
    ApolloLink.execute = execute;
    return ApolloLink;
}());
exports.ApolloLink = ApolloLink;
function execute(link, operation) {
    return (link.request(linkUtils_1.createOperation(operation.context, linkUtils_1.transformOperation(linkUtils_1.validateOperation(operation)))) || Observable.of());
}
exports.execute = execute;
