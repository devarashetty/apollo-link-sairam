"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
exports.__esModule = true;
var Observable = require("zen-observable");
var graphql_tag_1 = require("graphql-tag");
var printer_1 = require("graphql/language/printer");
var link_1 = require("../link");
var test_utils_1 = require("../test-utils");
var sampleQuery = graphql_tag_1["default"](templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  query SampleQuery {\n    stub {\n      id\n    }\n  }\n"], ["\n  query SampleQuery {\n    stub {\n      id\n    }\n  }\n"])));
var setContext = function () { return ({ add: 1 }); };
describe('ApolloLink(abstract class)', function () {
    describe('concat', function () {
        it('should concat a function', function (done) {
            var returnOne = new test_utils_1.SetContextLink(setContext);
            var link = returnOne.concat(function (operation, forward) {
                return Observable.of({ data: { count: operation.getContext().add } });
            });
            test_utils_1.testLinkResults({
                link: link,
                results: [{ count: 1 }],
                done: done
            });
        });
        it('should concat a Link', function (done) {
            var returnOne = new test_utils_1.SetContextLink(setContext);
            var mock = new test_utils_1.MockLink(function (op) {
                return Observable.of({ data: op.getContext().add });
            });
            var link = returnOne.concat(mock);
            test_utils_1.testLinkResults({
                link: link,
                results: [1],
                done: done
            });
        });
        it("should pass error to observable's error", function (done) {
            var error = new Error('thrown');
            var returnOne = new test_utils_1.SetContextLink(setContext);
            var mock = new test_utils_1.MockLink(function (op) {
                return new Observable(function (observer) {
                    observer.next({ data: op.getContext().add });
                    observer.error(error);
                });
            });
            var link = returnOne.concat(mock);
            test_utils_1.testLinkResults({
                link: link,
                results: [1, error],
                done: done
            });
        });
        it('should concat a Link and function', function (done) {
            var returnOne = new test_utils_1.SetContextLink(setContext);
            var mock = new test_utils_1.MockLink(function (op, forward) {
                op.setContext(function (_a) {
                    var add = _a.add;
                    return ({ add: add + 2 });
                });
                return forward(op);
            });
            var link = returnOne.concat(mock).concat(function (op) {
                return Observable.of({ data: op.getContext().add });
            });
            test_utils_1.testLinkResults({
                link: link,
                results: [3],
                done: done
            });
        });
        it('should concat a function and Link', function (done) {
            var returnOne = new test_utils_1.SetContextLink(setContext);
            var mock = new test_utils_1.MockLink(function (op, forward) {
                return Observable.of({ data: op.getContext().add });
            });
            var link = returnOne
                .concat(function (operation, forward) {
                operation.setContext({
                    add: operation.getContext().add + 2
                });
                return forward(operation);
            })
                .concat(mock);
            test_utils_1.testLinkResults({
                link: link,
                results: [3],
                done: done
            });
        });
        it('should concat two functions', function (done) {
            var returnOne = new test_utils_1.SetContextLink(setContext);
            var link = returnOne
                .concat(function (operation, forward) {
                operation.setContext({
                    add: operation.getContext().add + 2
                });
                return forward(operation);
            })
                .concat(function (op, forward) { return Observable.of({ data: op.getContext().add }); });
            test_utils_1.testLinkResults({
                link: link,
                results: [3],
                done: done
            });
        });
        it('should concat two Links', function (done) {
            var returnOne = new test_utils_1.SetContextLink(setContext);
            var mock1 = new test_utils_1.MockLink(function (operation, forward) {
                operation.setContext({
                    add: operation.getContext().add + 2
                });
                return forward(operation);
            });
            var mock2 = new test_utils_1.MockLink(function (op, forward) {
                return Observable.of({ data: op.getContext().add });
            });
            var link = returnOne.concat(mock1).concat(mock2);
            test_utils_1.testLinkResults({
                link: link,
                results: [3],
                done: done
            });
        });
        it("should return an link that can be concat'd multiple times", function (done) {
            var returnOne = new test_utils_1.SetContextLink(setContext);
            var mock1 = new test_utils_1.MockLink(function (operation, forward) {
                operation.setContext({
                    add: operation.getContext().add + 2
                });
                return forward(operation);
            });
            var mock2 = new test_utils_1.MockLink(function (op, forward) {
                return Observable.of({ data: op.getContext().add + 2 });
            });
            var mock3 = new test_utils_1.MockLink(function (op, forward) {
                return Observable.of({ data: op.getContext().add + 3 });
            });
            var link = returnOne.concat(mock1);
            test_utils_1.testLinkResults({
                link: link.concat(mock2),
                results: [5]
            });
            test_utils_1.testLinkResults({
                link: link.concat(mock3),
                results: [6],
                done: done
            });
        });
    });
    describe('split', function () {
        it('should split two functions', function (done) {
            var context = { add: 1 };
            var returnOne = new test_utils_1.SetContextLink(function () { return context; });
            var link1 = returnOne.concat(function (operation, forward) {
                return Observable.of({ data: operation.getContext().add + 1 });
            });
            var link2 = returnOne.concat(function (operation, forward) {
                return Observable.of({ data: operation.getContext().add + 2 });
            });
            var link = returnOne.split(function (operation) { return operation.getContext().add === 1; }, link1, link2);
            test_utils_1.testLinkResults({
                link: link,
                results: [2]
            });
            context.add = 2;
            test_utils_1.testLinkResults({
                link: link,
                results: [4],
                done: done
            });
        });
        it('should split two Links', function (done) {
            var context = { add: 1 };
            var returnOne = new test_utils_1.SetContextLink(function () { return context; });
            var link1 = returnOne.concat(new test_utils_1.MockLink(function (operation, forward) {
                return Observable.of({ data: operation.getContext().add + 1 });
            }));
            var link2 = returnOne.concat(new test_utils_1.MockLink(function (operation, forward) {
                return Observable.of({ data: operation.getContext().add + 2 });
            }));
            var link = returnOne.split(function (operation) { return operation.getContext().add === 1; }, link1, link2);
            test_utils_1.testLinkResults({
                link: link,
                results: [2]
            });
            context.add = 2;
            test_utils_1.testLinkResults({
                link: link,
                results: [4],
                done: done
            });
        });
        it('should split a link and a function', function (done) {
            var context = { add: 1 };
            var returnOne = new test_utils_1.SetContextLink(function () { return context; });
            var link1 = returnOne.concat(function (operation, forward) {
                return Observable.of({ data: operation.getContext().add + 1 });
            });
            var link2 = returnOne.concat(new test_utils_1.MockLink(function (operation, forward) {
                return Observable.of({ data: operation.getContext().add + 2 });
            }));
            var link = returnOne.split(function (operation) { return operation.getContext().add === 1; }, link1, link2);
            test_utils_1.testLinkResults({
                link: link,
                results: [2]
            });
            context.add = 2;
            test_utils_1.testLinkResults({
                link: link,
                results: [4],
                done: done
            });
        });
        it('should allow concat after split to be join', function (done) {
            var context = { test: true, add: 1 };
            var start = new test_utils_1.SetContextLink(function () { return (__assign({}, context)); });
            var link = start
                .split(function (operation) { return operation.getContext().test; }, function (operation, forward) {
                operation.setContext(function (_a) {
                    var add = _a.add;
                    return ({ add: add + 1 });
                });
                return forward(operation);
            }, function (operation, forward) {
                operation.setContext(function (_a) {
                    var add = _a.add;
                    return ({ add: add + 2 });
                });
                return forward(operation);
            })
                .concat(function (operation) {
                return Observable.of({ data: operation.getContext().add });
            });
            test_utils_1.testLinkResults({
                link: link,
                context: context,
                results: [2]
            });
            context.test = false;
            test_utils_1.testLinkResults({
                link: link,
                context: context,
                results: [3],
                done: done
            });
        });
        it('should allow default right to be empty or passthrough when forward available', function (done) {
            var context = { test: true };
            var start = new test_utils_1.SetContextLink(function () { return context; });
            var link = start.split(function (operation) { return operation.getContext().test; }, function (operation) {
                return Observable.of({
                    data: {
                        count: 1
                    }
                });
            });
            var concat = link.concat(function (operation) {
                return Observable.of({
                    data: {
                        count: 2
                    }
                });
            });
            test_utils_1.testLinkResults({
                link: link,
                results: [{ count: 1 }]
            });
            context.test = false;
            test_utils_1.testLinkResults({
                link: link,
                results: []
            });
            test_utils_1.testLinkResults({
                link: concat,
                results: [{ count: 2 }],
                done: done
            });
        });
    });
    describe('empty', function () {
        it('should returns an immediately completed Observable', function (done) {
            test_utils_1.testLinkResults({
                link: link_1.ApolloLink.empty(),
                done: done
            });
        });
    });
});
describe('context', function () {
    it('should merge context when using a function', function (done) {
        var returnOne = new test_utils_1.SetContextLink(setContext);
        var mock = new test_utils_1.MockLink(function (op, forward) {
            op.setContext(function (_a) {
                var add = _a.add;
                return ({ add: add + 2 });
            });
            op.setContext(function () { return ({ substract: 1 }); });
            return forward(op);
        });
        var link = returnOne.concat(mock).concat(function (op) {
            expect(op.getContext()).toEqual({
                add: 3,
                substract: 1
            });
            return Observable.of({ data: op.getContext().add });
        });
        test_utils_1.testLinkResults({
            link: link,
            results: [3],
            done: done
        });
    });
    it('should merge context when not using a function', function (done) {
        var returnOne = new test_utils_1.SetContextLink(setContext);
        var mock = new test_utils_1.MockLink(function (op, forward) {
            op.setContext({ add: 3 });
            op.setContext({ substract: 1 });
            return forward(op);
        });
        var link = returnOne.concat(mock).concat(function (op) {
            expect(op.getContext()).toEqual({
                add: 3,
                substract: 1
            });
            return Observable.of({ data: op.getContext().add });
        });
        test_utils_1.testLinkResults({
            link: link,
            results: [3],
            done: done
        });
    });
});
describe('Link static library', function () {
    describe('from', function () {
        var uniqueOperation = {
            query: sampleQuery,
            context: { name: 'uniqueName' },
            operationName: 'SampleQuery',
            extensions: {}
        };
        it('should create an observable that completes when passed an empty array', function (done) {
            var observable = link_1.execute(link_1.from([]), {
                query: sampleQuery
            });
            observable.subscribe(function () { return expect(false); }, function () { return expect(false); }, done);
        });
        it('can create chain of one', function () {
            expect(function () { return link_1.ApolloLink.from([new test_utils_1.MockLink()]); }).not.toThrow();
        });
        it('can create chain of two', function () {
            expect(function () {
                return link_1.ApolloLink.from([
                    new test_utils_1.MockLink(function (operation, forward) { return forward(operation); }),
                    new test_utils_1.MockLink(),
                ]);
            }).not.toThrow();
        });
        it('should receive result of one link', function (done) {
            var data = {
                data: {
                    hello: 'world'
                }
            };
            var chain = link_1.ApolloLink.from([new test_utils_1.MockLink(function () { return Observable.of(data); })]);
            // Smoke tests execute as a static method
            var observable = link_1.ApolloLink.execute(chain, uniqueOperation);
            observable.subscribe({
                next: function (actualData) {
                    expect(data).toEqual(actualData);
                },
                error: function () {
                    throw new Error();
                },
                complete: function () { return done(); }
            });
        });
        it('should accept AST query and pass AST to link', function () {
            var astOperation = __assign({}, uniqueOperation, { query: sampleQuery });
            var stub = jest.fn();
            var chain = link_1.ApolloLink.from([new test_utils_1.MockLink(stub)]);
            link_1.execute(chain, astOperation);
            expect(stub).toBeCalledWith({
                query: sampleQuery,
                operationName: 'SampleQuery',
                variables: {},
                extensions: {}
            });
        });
        it('should pass operation from one link to next with modifications', function (done) {
            var chain = link_1.ApolloLink.from([
                new test_utils_1.MockLink(function (op, forward) {
                    return forward(__assign({}, op, { query: sampleQuery }));
                }),
                new test_utils_1.MockLink(function (op) {
                    expect({
                        extensions: {},
                        operationName: 'SampleQuery',
                        query: sampleQuery,
                        variables: {}
                    }).toEqual(op);
                    return done();
                }),
            ]);
            link_1.execute(chain, uniqueOperation);
        });
        it('should pass result of one link to another with forward', function (done) {
            var data = {
                data: {
                    hello: 'world'
                }
            };
            var chain = link_1.ApolloLink.from([
                new test_utils_1.MockLink(function (op, forward) {
                    var observable = forward(op);
                    observable.subscribe({
                        next: function (actualData) {
                            expect(data).toEqual(actualData);
                        },
                        error: function () {
                            throw new Error();
                        },
                        complete: done
                    });
                    return observable;
                }),
                new test_utils_1.MockLink(function () { return Observable.of(data); }),
            ]);
            link_1.execute(chain, uniqueOperation);
        });
        it('should receive final result of two link chain', function (done) {
            var data = {
                data: {
                    hello: 'world'
                }
            };
            var chain = link_1.ApolloLink.from([
                new test_utils_1.MockLink(function (op, forward) {
                    var observable = forward(op);
                    return new Observable(function (observer) {
                        observable.subscribe({
                            next: function (actualData) {
                                expect(data).toEqual(actualData);
                                observer.next({
                                    data: __assign({}, actualData.data, { modification: 'unique' })
                                });
                            },
                            error: function (error) { return observer.error(error); },
                            complete: function () { return observer.complete(); }
                        });
                    });
                }),
                new test_utils_1.MockLink(function () { return Observable.of(data); }),
            ]);
            var result = link_1.execute(chain, uniqueOperation);
            result.subscribe({
                next: function (modifiedData) {
                    expect({
                        data: __assign({}, data.data, { modification: 'unique' })
                    }).toEqual(modifiedData);
                },
                error: function () {
                    throw new Error();
                },
                complete: done
            });
        });
        it('should chain together a function with links', function (done) {
            var add1 = new link_1.ApolloLink(function (operation, forward) {
                operation.setContext(function (_a) {
                    var num = _a.num;
                    return ({ num: num + 1 });
                });
                return forward(operation);
            });
            var add1Link = new test_utils_1.MockLink(function (operation, forward) {
                operation.setContext(function (_a) {
                    var num = _a.num;
                    return ({ num: num + 1 });
                });
                return forward(operation);
            });
            var link = link_1.ApolloLink.from([
                add1,
                add1,
                add1Link,
                add1,
                add1Link,
                new link_1.ApolloLink(function (operation) {
                    return Observable.of({ data: operation.getContext() });
                }),
            ]);
            test_utils_1.testLinkResults({
                link: link,
                results: [{ num: 5 }],
                context: { num: 0 },
                done: done
            });
        });
    });
    describe('split', function () {
        it('should create filter when single link passed in', function (done) {
            var link = link_1.split(function (operation) { return operation.getContext().test; }, function (operation, forward) { return Observable.of({ data: { count: 1 } }); });
            var context = { test: true };
            test_utils_1.testLinkResults({
                link: link,
                results: [{ count: 1 }],
                context: context
            });
            context.test = false;
            test_utils_1.testLinkResults({
                link: link,
                results: [],
                context: context,
                done: done
            });
        });
        it('should split two functions', function (done) {
            var link = link_1.ApolloLink.split(function (operation) { return operation.getContext().test; }, function (operation, forward) { return Observable.of({ data: { count: 1 } }); }, function (operation, forward) { return Observable.of({ data: { count: 2 } }); });
            var context = { test: true };
            test_utils_1.testLinkResults({
                link: link,
                results: [{ count: 1 }],
                context: context
            });
            context.test = false;
            test_utils_1.testLinkResults({
                link: link,
                results: [{ count: 2 }],
                context: context,
                done: done
            });
        });
        it('should split two Links', function (done) {
            var link = link_1.ApolloLink.split(function (operation) { return operation.getContext().test; }, function (operation, forward) { return Observable.of({ data: { count: 1 } }); }, new test_utils_1.MockLink(function (operation, forward) {
                return Observable.of({ data: { count: 2 } });
            }));
            var context = { test: true };
            test_utils_1.testLinkResults({
                link: link,
                results: [{ count: 1 }],
                context: context
            });
            context.test = false;
            test_utils_1.testLinkResults({
                link: link,
                results: [{ count: 2 }],
                context: context,
                done: done
            });
        });
        it('should split a link and a function', function (done) {
            var link = link_1.ApolloLink.split(function (operation) { return operation.getContext().test; }, function (operation, forward) { return Observable.of({ data: { count: 1 } }); }, new test_utils_1.MockLink(function (operation, forward) {
                return Observable.of({ data: { count: 2 } });
            }));
            var context = { test: true };
            test_utils_1.testLinkResults({
                link: link,
                results: [{ count: 1 }],
                context: context
            });
            context.test = false;
            test_utils_1.testLinkResults({
                link: link,
                results: [{ count: 2 }],
                context: context,
                done: done
            });
        });
        it('should allow concat after split to be join', function (done) {
            var context = { test: true };
            var link = link_1.ApolloLink.split(function (operation) { return operation.getContext().test; }, function (operation, forward) {
                return forward(operation).map(function (data) { return ({
                    data: { count: data.data.count + 1 }
                }); });
            }).concat(function () { return Observable.of({ data: { count: 1 } }); });
            test_utils_1.testLinkResults({
                link: link,
                context: context,
                results: [{ count: 2 }]
            });
            context.test = false;
            test_utils_1.testLinkResults({
                link: link,
                context: context,
                results: [{ count: 1 }],
                done: done
            });
        });
        it('should allow default right to be passthrough', function (done) {
            var context = { test: true };
            var link = link_1.ApolloLink.split(function (operation) { return operation.getContext().test; }, function (operation) { return Observable.of({ data: { count: 2 } }); }).concat(function (operation) { return Observable.of({ data: { count: 1 } }); });
            test_utils_1.testLinkResults({
                link: link,
                context: context,
                results: [{ count: 2 }]
            });
            context.test = false;
            test_utils_1.testLinkResults({
                link: link,
                context: context,
                results: [{ count: 1 }],
                done: done
            });
        });
    });
    describe('execute', function () {
        var _warn;
        beforeEach(function () {
            _warn = console.warn;
            console.warn = jest.fn(function (warning) {
                expect(warning).toBe("query should either be a string or GraphQL AST");
            });
        });
        afterEach(function () {
            console.warn = _warn;
        });
        it('should return an empty observable when a link returns null', function (done) {
            test_utils_1.testLinkResults({
                link: new test_utils_1.MockLink(),
                results: [],
                done: done
            });
        });
        it('should return an empty observable when a link is empty', function (done) {
            test_utils_1.testLinkResults({
                link: link_1.ApolloLink.empty(),
                results: [],
                done: done
            });
        });
        it("should return an empty observable when a concat'd link returns null", function (done) {
            var link = new test_utils_1.MockLink(function (operation, forward) {
                return forward(operation);
            }).concat(function () { return null; });
            test_utils_1.testLinkResults({
                link: link,
                results: [],
                done: done
            });
        });
        it('should return an empty observable when a split link returns null', function (done) {
            var context = { test: true };
            var link = new test_utils_1.SetContextLink(function () { return context; }).split(function (op) { return op.getContext().test; }, function () { return Observable.of(); }, function () { return null; });
            test_utils_1.testLinkResults({
                link: link,
                results: []
            });
            context.test = false;
            test_utils_1.testLinkResults({
                link: link,
                results: [],
                done: done
            });
        });
        it('should set a default context, variable, query and operationName on a copy of operation', function (done) {
            var operation = {
                query: graphql_tag_1["default"](templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n          {\n            id\n          }\n        "], ["\n          {\n            id\n          }\n        "])))
            };
            var link = new link_1.ApolloLink(function (op) {
                expect(operation['operationName']).toBeUndefined();
                expect(operation['variables']).toBeUndefined();
                expect(operation['context']).toBeUndefined();
                expect(operation['extensions']).toBeUndefined();
                expect(op['operationName']).toBeDefined();
                expect(op['variables']).toBeDefined();
                expect(op['context']).toBeUndefined();
                expect(op['extensions']).toBeDefined();
                expect(op.toKey()).toBeDefined();
                return Observable.of();
            });
            link_1.execute(link, operation).subscribe({
                complete: done
            });
        });
    });
});
describe('Terminating links', function () {
    var _warn = console.warn;
    var warningStub = jest.fn(function (warning) {
        expect(warning.message).toBe("You are calling concat on a terminating link, which will have no effect");
    });
    var data = {
        stub: 'data'
    };
    beforeAll(function () {
        console.warn = warningStub;
    });
    beforeEach(function () {
        warningStub.mockClear();
    });
    afterAll(function () {
        console.warn = _warn;
    });
    describe('concat', function () {
        it('should warn if attempting to concat to a terminating Link from function', function () {
            var link = new link_1.ApolloLink(function (operation) { return Observable.of({ data: data }); });
            expect(link_1.concat(link, function (operation, forward) { return forward(operation); })).toEqual(link);
            expect(warningStub).toHaveBeenCalledTimes(1);
            expect(warningStub.mock.calls[0][0].link).toEqual(link);
        });
        it('should warn if attempting to concat to a terminating Link', function () {
            var link = new test_utils_1.MockLink(function (operation) { return Observable.of(); });
            expect(link.concat(function (operation, forward) { return forward(operation); })).toEqual(link);
            expect(warningStub).toHaveBeenCalledTimes(1);
            expect(warningStub.mock.calls[0][0].link).toEqual(link);
        });
        it('should not warn if attempting concat a terminating Link at end', function () {
            var link = new test_utils_1.MockLink(function (operation, forward) { return forward(operation); });
            link.concat(function (operation) { return Observable.of(); });
            expect(warningStub).not.toBeCalled();
        });
    });
    describe('split', function () {
        it('should not warn if attempting to split a terminating and non-terminating Link', function () {
            var split = link_1.ApolloLink.split(function () { return true; }, function (operation) { return Observable.of({ data: data }); }, function (operation, forward) { return forward(operation); });
            split.concat(function (operation, forward) { return forward(operation); });
            expect(warningStub).not.toBeCalled();
        });
        it('should warn if attempting to concat to split two terminating links', function () {
            var split = link_1.ApolloLink.split(function () { return true; }, function (operation) { return Observable.of({ data: data }); }, function (operation) { return Observable.of({ data: data }); });
            expect(split.concat(function (operation, forward) { return forward(operation); })).toEqual(split);
            expect(warningStub).toHaveBeenCalledTimes(1);
        });
        it('should warn if attempting to split to split two terminating links', function () {
            var split = link_1.ApolloLink.split(function () { return true; }, function (operation) { return Observable.of({ data: data }); }, function (operation) { return Observable.of({ data: data }); });
            expect(split.split(function () { return true; }, function (operation, forward) { return forward(operation); }, function (operation, forward) { return forward(operation); })).toEqual(split);
            expect(warningStub).toHaveBeenCalledTimes(1);
        });
    });
    describe('from', function () {
        it('should not warn if attempting to form a terminating then non-terminating Link', function () {
            link_1.ApolloLink.from([
                function (operation, forward) { return forward(operation); },
                function (operation) { return Observable.of({ data: data }); },
            ]);
            expect(warningStub).not.toBeCalled();
        });
        it('should warn if attempting to add link after termination', function () {
            link_1.ApolloLink.from([
                function (operation, forward) { return forward(operation); },
                function (operation) { return Observable.of({ data: data }); },
                function (operation, forward) { return forward(operation); },
            ]);
            expect(warningStub).toHaveBeenCalledTimes(1);
        });
        it('should warn if attempting to add link after termination', function () {
            link_1.ApolloLink.from([
                new link_1.ApolloLink(function (operation, forward) { return forward(operation); }),
                new link_1.ApolloLink(function (operation) { return Observable.of({ data: data }); }),
                new link_1.ApolloLink(function (operation, forward) { return forward(operation); }),
            ]);
            expect(warningStub).toHaveBeenCalledTimes(1);
        });
    });
    describe('warning', function () {
        it('should include link that terminates', function () {
            var terminatingLink = new test_utils_1.MockLink(function (operation) {
                return Observable.of({ data: data });
            });
            link_1.ApolloLink.from([
                new link_1.ApolloLink(function (operation, forward) { return forward(operation); }),
                new link_1.ApolloLink(function (operation, forward) { return forward(operation); }),
                terminatingLink,
                new link_1.ApolloLink(function (operation, forward) { return forward(operation); }),
                new link_1.ApolloLink(function (operation, forward) { return forward(operation); }),
                new link_1.ApolloLink(function (operation) { return Observable.of({ data: data }); }),
                new link_1.ApolloLink(function (operation, forward) { return forward(operation); }),
            ]);
            expect(warningStub).toHaveBeenCalledTimes(4);
        });
    });
});
describe('execute', function () {
    it('transforms an opearation with context into something serlizable', function (done) {
        var query = graphql_tag_1["default"](templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n      {\n        id\n      }\n    "], ["\n      {\n        id\n      }\n    "])));
        var link = new link_1.ApolloLink(function (operation) {
            var str = JSON.stringify(__assign({}, operation, { query: printer_1.print(operation.query) }));
            expect(str).toBe(JSON.stringify({
                variables: { id: 1 },
                extensions: { cache: true },
                operationName: null,
                query: printer_1.print(operation.query)
            }));
            return Observable.of();
        });
        var noop = function () { };
        link_1.execute(link, {
            query: query,
            variables: { id: 1 },
            extensions: { cache: true }
        }).subscribe(noop, noop, done);
    });
});
var templateObject_1, templateObject_2, templateObject_3;
