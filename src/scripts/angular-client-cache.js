'use strict';
var ClientCache;
(function (ClientCache) {
    var ClientCacheService = (function () {
        function ClientCacheService($q, $cacheFactory) {
            this.$q = $q;
            this.$cacheFactory = $cacheFactory;
            this.options = {
                storagePrefix: 'client-cache',
                useCompression: false
            };
            this.sessionCache = $cacheFactory(this.options.storagePrefix);
        }
        ClientCacheService.prototype.set = function (key, value) {
            if (angular.isUndefined(key) || key === null) {
                throw new Error('Argument null exception. Parameter name: key. Function called: set');
            }
            if (angular.isUndefined(value) || value === null) {
                throw new Error('Argument null exception. Parameter name: value. Function called: set');
            }
            key = this.prefix(key);
            var stringValue = value;
            if (angular.isObject(stringValue) || angular.isArray(stringValue) || angular.isNumber(+stringValue || stringValue)) {
                stringValue = angular.toJson(value);
            }
            this.sessionCache.put(key, stringValue);
            var shouldOverride = this.overrideCacheItem(key, stringValue);
            if (shouldOverride) {
                if (this.options.useCompression) {
                    stringValue = LZString.compress(stringValue);
                }
                localStorage.setItem(key, stringValue);
            }
        };
        ClientCacheService.prototype.get = function (key) {
            if (angular.isUndefined(key) || key === null) {
                throw new Error('Argument null exception. Parameter name: key. Function called: get');
            }
            key = this.prefix(key);
            var stringValue = this.sessionCache.get(key);
            if (!angular.isUndefined(stringValue) && stringValue !== null) {
                return this.parse(stringValue);
            }
            else {
                stringValue = localStorage.getItem(key);
            }
            if (angular.isUndefined(stringValue) || stringValue === null) {
                return undefined;
            }
            if (this.options.useCompression) {
                stringValue = LZString.decompress(stringValue);
            }
            return this.parse(stringValue);
        };
        ClientCacheService.prototype.tryGetSet = function (key, apiCall, objectBuilder) {
            var _this = this;
            var deferred = this.$q.defer();
            key = this.prefix(key);
            var value = this.sessionCache.get(key);
            if (!angular.isUndefined(value) && value !== null) {
                this.set(key, value);
                value = this.parse(value);
                if (!angular.isUndefined(objectBuilder) && objectBuilder !== null) {
                    value = objectBuilder(value);
                }
                deferred.resolve(value);
                return deferred.promise;
            }
            return apiCall().then(function (response) {
                _this.set(key, response);
                if (!angular.isUndefined(objectBuilder) && objectBuilder !== null) {
                    response = objectBuilder(response);
                }
                return response;
            }, function () {
                var value = _this.get(key);
                if (!angular.isUndefined(objectBuilder) && objectBuilder !== null) {
                    value = objectBuilder(value);
                }
                return value;
            });
        };
        ClientCacheService.prototype.configure = function (options) {
            angular.extend(this.options, options);
            if (angular.isDefined(options.storagePrefix) && options.storagePrefix !== null) {
                this.sessionCache.destroy();
                this.sessionCache = this.$cacheFactory(options.storagePrefix);
            }
        };
        ClientCacheService.prototype.removeAll = function () {
            localStorage.clear();
            this.sessionCache.removeAll();
        };
        ClientCacheService.prototype.remove = function (key) {
            key = this.prefix(key);
            localStorage.removeItem(key);
            this.sessionCache.remove(key);
        };
        ClientCacheService.prototype.parse = function (stringValue) {
            var value;
            try {
                value = angular.fromJson(stringValue);
            }
            catch (e) {
                value = stringValue;
            }
            return value;
        };
        ClientCacheService.prototype.overrideCacheItem = function (key, stringValue) {
            var itemExist = localStorage.getItem(this.prefix(key));
            if (angular.isUndefined(itemExist) || itemExist === null) {
                return true;
            }
            if (this.options.useCompression) {
                itemExist = LZString.decompress(itemExist);
            }
            var origionalHash = this.hash(itemExist);
            var newHash = this.hash(stringValue);
            return origionalHash !== newHash;
        };
        ClientCacheService.prototype.prefix = function (key) {
            return this.options.storagePrefix + '.' + key;
        };
        ClientCacheService.prototype.hash = function (value) {
            var hash = 0, i, chr, len;
            if (value.length === 0)
                return hash;
            for (i = 0, len = value.length; i < len; i++) {
                chr = value.charCodeAt(i);
                hash = ((hash << 5) - hash) + chr;
                hash |= 0;
            }
            return hash;
        };
        return ClientCacheService;
    })();
    ClientCache.ClientCacheService = ClientCacheService;
    function factory($q, $cacheFactory) {
        return new ClientCacheService($q, $cacheFactory);
    }
    factory.$inject = [
        '$q',
        '$cacheFactory'
    ];
    angular.module('ClientCache', []);
    angular
        .module('ClientCache')
        .factory('ClientCacheService', factory);
})(ClientCache || (ClientCache = {}));
