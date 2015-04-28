/* tslint:disable:no-bitwise */
'use strict';
var ClientCache;
(function (ClientCache) {
    (function (StorageType) {
        StorageType[StorageType["Local"] = 0] = "Local";
        StorageType[StorageType["Session"] = 1] = "Session";
        StorageType[StorageType["All"] = 2] = "All";
    })(ClientCache.StorageType || (ClientCache.StorageType = {}));
    var StorageType = ClientCache.StorageType;
    var ClientCacheService = (function () {
        function ClientCacheService($q, $timeout) {
            this.$q = $q;
            this.$timeout = $timeout;
            this.options = {
                storagePrefix: 'angular-cache',
                useCompression: false,
                storageType: 2 /* All */
            };
        }
        ClientCacheService.prototype.set = function (key, value, storageType) {
            var _this = this;
            if (angular.isUndefined(key))
                throw new Error('Argument null exception. Parameter name: key. Function called: set');
            if (angular.isUndefined(value))
                throw new Error('Argument null exception. Parameter name: value. Function called: set');
            var stringValue = value;
            var deffered = this.$q.defer();
            // Only stringify if json.
            if (angular.isObject(stringValue) || angular.isArray(stringValue) || angular.isNumber(+stringValue || stringValue)) {
                stringValue = angular.toJson(value);
            }
            this.$timeout(function () {
                var shouldOverride = _this.overrideCacheItem(key, stringValue, _this.resolveStorageType(storageType));
                if (shouldOverride) {
                    if (_this.options.useCompression) {
                        stringValue = LZString.compress(stringValue);
                    }
                    _this.store(key, stringValue, _this.resolveStorageType(storageType));
                }
                deffered.resolve();
            });
            return deffered.promise;
        };
        ClientCacheService.prototype.get = function (key, storageType) {
            if (angular.isUndefined(key))
                throw new Error('Argument null exception. Parameter name: key. Function called: get');
            var stringValue = this.retrieve(key, this.resolveStorageType(storageType));
            if (angular.isUndefined(stringValue) || stringValue === null) {
                return undefined;
            }
            if (this.options.useCompression)
                stringValue = LZString.decompress(stringValue);
            var value;
            try {
                value = angular.fromJson(stringValue);
            }
            catch (e) {
                value = stringValue;
            }
            return value;
        };
        ClientCacheService.prototype.tryGetSet = function (key, apiCall, objectBuilder) {
            var _this = this;
            var deferred = this.$q.defer();
            var value = this.get(key, 2 /* All */);
            if (!angular.isUndefined(value) && value !== null) {
                if (!angular.isUndefined(objectBuilder) && objectBuilder !== null)
                    value = objectBuilder(value);
                deferred.resolve(value);
                return deferred.promise;
            }
            return apiCall().then(function (response) {
                if (!angular.isUndefined(objectBuilder) && objectBuilder !== null)
                    response = objectBuilder(response);
                _this.set(key, response);
                return response;
            });
        };
        ClientCacheService.prototype.configure = function (options) {
            angular.extend(this.options, options);
        };
        ClientCacheService.prototype.removeAll = function (storageType) {
            storageType = this.resolveStorageType(storageType);
            switch (storageType) {
                case 0 /* Local */:
                    localStorage.clear();
                    break;
                case 1 /* Session */:
                    sessionStorage.clear();
                    break;
                default:
                    sessionStorage.clear();
                    localStorage.clear();
            }
        };
        ClientCacheService.prototype.remove = function (key, storageType) {
            key = this.prefix(key);
            storageType = this.resolveStorageType(storageType);
            switch (storageType) {
                case 0 /* Local */:
                    localStorage.removeItem(key);
                    break;
                case 1 /* Session */:
                    sessionStorage.removeItem(key);
                    break;
                default:
                    sessionStorage.removeItem(key);
                    localStorage.removeItem(key);
            }
        };
        ClientCacheService.prototype.resolveStorageType = function (storageType) {
            return angular.isUndefined(storageType) ? this.options.storageType : storageType;
        };
        ClientCacheService.prototype.overrideCacheItem = function (key, stringValue, storageType) {
            var itemExist = this.retrieve(key, storageType);
            if (angular.isUndefined(itemExist) || itemExist === null)
                return true;
            if (this.options.useCompression)
                itemExist = LZString.decompress(itemExist);
            var origionalHash = this.hash(itemExist);
            var newHash = this.hash(stringValue);
            return origionalHash !== newHash;
        };
        ClientCacheService.prototype.retrieve = function (key, storageType) {
            key = this.prefix(key);
            switch (storageType) {
                case 0 /* Local */:
                    return localStorage.getItem(key);
                case 1 /* Session */:
                    return sessionStorage.getItem(key);
                default:
                    var sessionStoreValue = sessionStorage.getItem(key);
                    if (!angular.isUndefined(sessionStorage))
                        return sessionStoreValue;
                    return localStorage.getItem(key);
            }
        };
        ClientCacheService.prototype.store = function (key, value, storageType) {
            key = this.prefix(key);
            switch (storageType) {
                case 0 /* Local */:
                    localStorage.setItem(key, value);
                    break;
                case 1 /* Session */:
                    sessionStorage.setItem(key, value);
                    break;
                default:
                    localStorage.setItem(key, value);
                    sessionStorage.setItem(key, value);
            }
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
    function factory($q, $timeout) {
        return new ClientCacheService($q, $timeout);
    }
    factory.$inject = [
        '$q',
        '$timeout'
    ];
    angular.module('ClientCache', []);
    angular.module('ClientCache').factory('ClientCacheService', factory);
})(ClientCache || (ClientCache = {}));

//# sourceMappingURL=angular-client-cache.js.map