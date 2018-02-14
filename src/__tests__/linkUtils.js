"use strict";
exports.__esModule = true;
var linkUtils_1 = require("../linkUtils");
var Observable = require("zen-observable");
describe('Link utilities:', function () {
    describe('validateOperation', function () {
        it('should throw when invalid field in operation', function () {
            expect(function () { return linkUtils_1.validateOperation({ qwerty: '' }); }).toThrow();
        });
        it('should not throw when valid fields in operation', function () {
            expect(function () {
                return linkUtils_1.validateOperation({
                    query: '1234',
                    context: {},
                    variables: {}
                });
            }).not.toThrow();
        });
    });
    describe('makePromise', function () {
        var data = {
            data: {
                hello: 'world'
            }
        };
        var error = new Error('I always error');
        it('return next call as Promise resolution', function () {
            return linkUtils_1.makePromise(Observable.of(data)).then(function (result) {
                return expect(data).toEqual(result);
            });
        });
        it('return error call as Promise rejection', function () {
            return linkUtils_1.makePromise(new Observable(function (observer) { return observer.error(error); }))
                .then(expect.fail)["catch"](function (actualError) { return expect(error).toEqual(actualError); });
        });
        describe('warnings', function () {
            var spy = jest.fn();
            var _warn;
            beforeEach(function () {
                _warn = console.warn;
                console.warn = spy;
            });
            afterEach(function () {
                console.warn = _warn;
            });
            it('return error call as Promise rejection', function (done) {
                linkUtils_1.makePromise(Observable.of(data, data)).then(function (result) {
                    expect(data).toEqual(result);
                    expect(spy).toHaveBeenCalled();
                    done();
                });
            });
        });
    });
    describe('fromPromise', function () {
        var data = {
            data: {
                hello: 'world'
            }
        };
        var error = new Error('I always error');
        it('return next call as Promise resolution', function () {
            var observable = linkUtils_1.fromPromise(Promise.resolve(data));
            return linkUtils_1.makePromise(observable).then(function (result) {
                return expect(data).toEqual(result);
            });
        });
        it('return Promise rejection as error call', function () {
            var observable = linkUtils_1.fromPromise(Promise.reject(error));
            return linkUtils_1.makePromise(observable)
                .then(expect.fail)["catch"](function (actualError) { return expect(error).toEqual(actualError); });
        });
    });
});
