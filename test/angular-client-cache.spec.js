'use strict';
var Tests;
(function (Tests) {
    describe('Storage Service test: ', function () {
        var storage, $timeout, $httpBackend, $http, $cache;
        beforeEach(function () {
            module('ClientCache');
            inject(function (_ClientCacheService_, _$timeout_, _$httpBackend_, _$http_, _$cacheFactory_) {
                storage = _ClientCacheService_;
                $timeout = _$timeout_;
                $httpBackend = _$httpBackend_;
                $http = _$http_;
                $cache = _$cacheFactory_.get('client-cache');
            });
        });
        afterEach(function () {
            storage.removeAll();
        });
        it('should be able to set in local storage', function () {
            var valueToBeSet = 'hello';
            storage.set('testKey', valueToBeSet);
            var browserLocalStorage = localStorage.getItem('client-cache.testKey');
            expect(browserLocalStorage).toBe(valueToBeSet);
        });
        it('should be able to set in cache factory storage', function () {
            var valueToBeSet = 'hello';
            spyOn(storage.sessionCache, 'put').and.callThrough();
            storage.set('testKey', valueToBeSet);
            expect(storage.sessionCache.put).toHaveBeenCalled();
            expect(storage.sessionCache.put).toHaveBeenCalledWith('client-cache.testKey', valueToBeSet);
            expect($cache.get('client-cache.testKey')).toBe(valueToBeSet);
        });
        it('should perform the API call then set it to local storage and angular cacheFactory storage', function () {
            $httpBackend.when('GET', 'blah').respond({ t: 'blah' });
            var apiCall = function () { return $http.get('blah'); };
            storage.tryGetSet('key', apiCall).then(function () {
                expect(localStorage.getItem('client-cache.key')).toBeDefined();
                expect($cache.get('client-cache.testKey')).toBeDefined();
                expect($cache.get('client-cache.testKey')).not.toBe(null);
            });
        });
        it('should perform the API call then set it to local storage and return a build object with a date', function () {
            var date = new Date().toISOString();
            $httpBackend.when('GET', 'blah').respond({ t: date });
            var apiCall = function () { return $http.get('blah'); };
            var builder = function (item) { return { t: new Date(item.t) }; };
            var obk = { apiCall: apiCall, builder: builder };
            spyOn(obk, 'builder');
            spyOn(storage, 'set');
            storage.tryGetSet('key', obk.apiCall, obk.builder).then(function (item) {
                expect(storage.set).toHaveBeenCalled();
                expect(item.t instanceof Date).toBeTruthy();
                expect($cache.get('client-cache.testKey')).not.toBe(date);
                expect(localStorage.getItem('client-cache.key')).toBeDefined();
                expect(obk.builder).toHaveBeenCalled();
            });
        });
        it('should fall back to localStorage when API call fails', function () {
            $httpBackend.when('GET', 'blah').respond(0);
            var apiCall = function () { return $http.get('blah'); };
            spyOn(localStorage, 'getItem');
            storage.tryGetSet('key', apiCall).then(function (item) {
                expect(localStorage.getItem).toHaveBeenCalled();
            });
        });
        it('should not run the builder when the builder is null', function () {
            var date = new Date().toISOString();
            $httpBackend.when('GET', 'blah').respond({ t: date });
            var apiCall = function () { return $http.get('blah'); };
            var obk = { apiCall: apiCall, builder: null };
            spyOn(obk, 'builder');
            storage.tryGetSet('key', obk.apiCall, obk.builder).then(function (item) {
                expect(obk.builder).not.toHaveBeenCalled();
            });
        });
        it('should pull from session storage and not perform API call', function () {
            var callerService = { apiCall: function () { return $http.get('blah'); } };
            spyOn(callerService, 'apiCall').and.callThrough();
            storage.set('key', { t: 'as' });
            storage.tryGetSet('key', callerService.apiCall).then(function () {
                expect(callerService.apiCall).not.toHaveBeenCalled();
            });
        });
        it('should compress the target value and set in local and session storage', function () {
            storage.configure({
                useCompression: true
            });
            var valueToBeSet = {
                a: 'adsfklsdfkmlsklfsdlkdsfklfsdlkjfsdklsfdkljsfdkjlsfdjklsfdjkfsdj dsfjfdsjlkfdsjlkfsdjlkjksldf j sfjkfds jlk sfdjkl sfd',
                b: 'adskldsl kfdjkslfjdslk jkdfsjksfd jfksdjk dfsjk fdskjfsdkjl fdskfkjlfdkjlfdkfskjljk sldfjk l sdfk js kjsfdkjlfsdjksfdjksfdkj l kjfs dkjlsf djkljkl fsdkjls'
            };
            var stringLength = JSON.stringify(valueToBeSet).length;
            storage.set('compressionTest', valueToBeSet);
            var browserLocalStorage = localStorage.getItem('client-cache.compressionTest').length;
            expect(browserLocalStorage).toBeLessThan(stringLength);
            console.log('size before: ' + stringLength + ' size after:' + browserLocalStorage);
            storage.configure({
                useCompression: false
            });
        });
        it('should return js objects if they are set as such', function () {
            var obj = {
                prop: 'hello',
                truth: false,
                h: 5
            };
            storage.set('val', obj);
            var after = storage.get('val');
            expect(angular.isString(after.prop)).toBeTruthy();
            expect(angular.isNumber(after.h)).toBeTruthy();
            expect(after.truth).toBeFalsy();
        });
        it('should return ISO date strings', function () {
            var date = new Date();
            storage.set('ab', date);
            var val = storage.get('ab');
            expect(angular.isString(val)).toBeTruthy();
            expect(val).toEqual(date.toISOString());
        });
        it('should throw an error if the key passed in set is undefined', function () {
            expect(function () {
                storage.set(undefined, { test: 'a' });
            }).toThrowError();
        });
        it('should throw an error if the key passed in set is null', function () {
            expect(function () {
                storage.set(null, { test: 'a' });
            }).toThrowError();
        });
        it('should throw an error if the value passed in set is undefined', function () {
            expect(function () {
                storage.set('legitKey', undefined);
            }).toThrowError();
        });
        it('should throw an error if the value passed in set is null', function () {
            expect(function () {
                storage.set('legitKey', null);
            }).toThrowError();
        });
        it('should throw an error if the key passed in get is undefined', function () {
            expect(function () {
                storage.set(undefined);
            }).toThrowError();
        });
        it('should throw an error if the key passed in get is null', function () {
            expect(function () {
                storage.set(null);
            }).toThrowError();
        });
        it('should have the correct config values when the configure method is called', function () {
            var oldOptions = storage.options;
            var prefix = 'someOtherPrefix' + Math.random();
            var useCompression = true;
            storage.configure({
                storagePrefix: prefix,
                useCompression: useCompression
            });
            expect(storage.options.storagePrefix).toBe(prefix);
            expect(storage.options.useCompression).toBe(useCompression);
        });
        it('should remove value from local storage', function () {
            var value = 's';
            spyOn(window.localStorage, 'removeItem').and.callThrough();
            storage.set('item', value);
            expect(storage.get('item')).toBe(value);
            storage.remove('item');
            expect(localStorage.getItem('client-cache.item')).toBe(null);
            expect(window.localStorage.removeItem).toHaveBeenCalled();
        });
        it('should clear local and session storage', function () {
            var value = 's';
            spyOn(window.localStorage, 'clear').and.callThrough();
            spyOn(storage, 'removeAll').and.callThrough();
            storage.set('item', value);
            expect(storage.get('item')).toBe(value);
            storage.removeAll();
            expect(localStorage.getItem('client-cache.item')).toBe(null);
            expect(window.localStorage.clear).toHaveBeenCalled();
            expect(storage.removeAll).toHaveBeenCalled();
        });
        it('should compute a hash correctly', function () {
            var hash = storage.hash('value');
            var expectedHash = 111972721;
            expect(hash).toBe(expectedHash);
        });
        it('should return a 0 hash if an empty string is given', function () {
            var hash = storage.hash('');
            var expectedHash = 0;
            expect(hash).toBe(expectedHash);
        });
        it('should not override if the hash is the same', function () {
            var key = 'testKey';
            var value = 'derp';
            spyOn(localStorage, 'getItem').and.returnValue(LZString.compressToUTF16(value));
            storage.options.useCompression = true;
            var shouldOverride = storage.overrideCacheItem(key, value);
            expect(shouldOverride).toBeFalsy();
            storage.options.useCompression = false;
        });
        it('should override if the hash is different', function () {
            var key = 'testKey';
            var value = 'derp';

            var differentValue = LZString.compressToUTF16('this is different!');
            
            spyOn(localStorage, 'getItem').and.returnValue(differentValue);
            storage.options.useCompression = true;
            var shouldOverride = storage.overrideCacheItem(key, value);
            expect(shouldOverride).toBeTruthy();
            storage.options.useCompression = false;
        });
        it('should pull from localStorage if it doesnt exist in cacheFactory', function () {
            localStorage.setItem('client-cache.key', 'hello');
            spyOn(localStorage, 'getItem').and.callThrough();
            var item = storage.get('key');
            expect(localStorage.getItem).toHaveBeenCalled();
        });
        it('should return undefined if item doesnt exist in storage', function () {
            var item = storage.get('key');
            expect(item).toBeUndefined();
        });
        it('should decompress from localStorage when get is called', function () {
            var compressedItem = LZString.compressToUTF16('hello');
            localStorage.setItem('client-cache.key', compressedItem);
            spyOn(localStorage, 'getItem').and.callThrough();
            spyOn(LZString, 'decompressFromUTF16').and.callThrough();
            storage.options.useCompression = true;
            var item = storage.get('key');
            expect(LZString.decompressFromUTF16).toHaveBeenCalledWith(compressedItem);
            storage.options.useCompression = false;
        });
    });
})(Tests || (Tests = {}));
