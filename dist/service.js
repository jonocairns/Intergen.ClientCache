/* tslint:disable:no-bitwise */
'use strict';
var StorageService;
(function (StorageService) {
    (function (StorageType) {
        StorageType[StorageType["Local"] = 0] = "Local";
        StorageType[StorageType["Session"] = 1] = "Session";
        StorageType[StorageType["All"] = 2] = "All";
    })(StorageService.StorageType || (StorageService.StorageType = {}));
    var StorageType = StorageService.StorageType;
    var IntergenStorageService = (function () {
        function IntergenStorageService($q, $timeout) {
            this.$q = $q;
            this.$timeout = $timeout;
            this.options = {
                storagePrefix: 'intergen',
                useCompression: false,
                storageType: 2 /* All */
            };
        }
        IntergenStorageService.prototype.set = function (key, value, storageType) {
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
                        stringValue = LZString.compressToBase64(stringValue);
                    }
                    ;
                    _this.store(key, stringValue, _this.resolveStorageType(storageType));
                }
                deffered.resolve();
            });
            return deffered.promise;
        };
        IntergenStorageService.prototype.get = function (key, storageType) {
            if (angular.isUndefined(key))
                throw new Error('Argument null exception. Parameter name: key. Function called: get');
            var stringValue = this.retrieve(key, this.resolveStorageType(storageType));
            if (angular.isUndefined(stringValue) || stringValue === null) {
                return undefined;
            }
            if (this.options.useCompression)
                stringValue = LZString.decompressFromBase64(stringValue);
            var value;
            try {
                value = angular.fromJson(stringValue);
            }
            catch (e) {
                value = stringValue;
            }
            return value;
        };
        IntergenStorageService.prototype.configure = function (options) {
            angular.extend(this.options, options);
        };
        IntergenStorageService.prototype.removeAll = function (storageType) {
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
        IntergenStorageService.prototype.remove = function (key, storageType) {
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
        IntergenStorageService.prototype.resolveStorageType = function (storageType) {
            return angular.isUndefined(storageType) ? this.options.storageType : storageType;
        };
        IntergenStorageService.prototype.overrideCacheItem = function (key, stringValue, storageType) {
            var itemExist = this.retrieve(key, storageType);
            if (angular.isUndefined(itemExist) || itemExist === null)
                return true;
            if (this.options.useCompression)
                itemExist = LZString.decompressFromBase64(itemExist);
            var origionalHash = this.hash(itemExist);
            var newHash = this.hash(stringValue);
            return origionalHash !== newHash;
        };
        IntergenStorageService.prototype.retrieve = function (key, storageType) {
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
        IntergenStorageService.prototype.store = function (key, value, storageType) {
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
        IntergenStorageService.prototype.prefix = function (key) {
            return this.options.storagePrefix + '.' + key;
        };
        IntergenStorageService.prototype.hash = function (value) {
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
        return IntergenStorageService;
    })();
    StorageService.IntergenStorageService = IntergenStorageService;
    function factory($q, $timeout) {
        return new IntergenStorageService($q, $timeout);
    }
    factory.$inject = [
        '$q',
        '$timeout'
    ];
    angular.module('IntergenStorage').factory('IntergenStorageService', factory);
})(StorageService || (StorageService = {}));

//# sourceMappingURL=service.js.map