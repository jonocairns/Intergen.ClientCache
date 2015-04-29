/* tslint:disable:no-bitwise */
'use strict';

module ClientCache {
    export interface IClientCacheService {
        set(key: string, value: any): void;
        get<T>(key: string): T;
        tryGetSet<T>(key: string, apiCall: Function, objectBuilder?: Function): ng.IPromise<T>;
        configure(options: IStorageOptions): void;
        remove(key: string): void;
        removeAll(): void;
    }

    export interface IStorageOptions {
        storagePrefix?: string;
        useCompression?: boolean;
    }

    export class ClientCacheService implements IClientCacheService {

        private options: IStorageOptions;
        private sessionCache: ng.ICacheObject;
        constructor(private $q: ng.IQService, private $cacheFactory: ng.ICacheFactoryService) {
          this.options = {
              storagePrefix: 'client-cache',
              useCompression: false
          };
          this.sessionCache = $cacheFactory(this.options.storagePrefix);
        }

        public set(key: string, value: any): void {
            if (angular.isUndefined(key) || key === null) throw new Error('Argument null exception. Parameter name: key. Function called: set');
            if (angular.isUndefined(value) || value === null) throw new Error('Argument null exception. Parameter name: value. Function called: set');
            key = this.prefix(key);

            var stringValue = value;

            // Only stringify if json.
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
        }

        public get<T>(key: string): T {
            if (angular.isUndefined(key) || key === null) throw new Error('Argument null exception. Parameter name: key. Function called: get');
            key = this.prefix(key);
            var stringValue = this.sessionCache.get(key);

            if (!angular.isUndefined(stringValue) && stringValue !== null) {
                return this.parse(stringValue);
            } else {
                stringValue = localStorage.getItem(key);
            }

            if (angular.isUndefined(stringValue) || stringValue === null) {
                return undefined;
            }

            if (this.options.useCompression) stringValue = LZString.decompress(stringValue);

            return this.parse(stringValue);
        }

        public tryGetSet<T>(key: string, apiCall: Function, objectBuilder?: Function): ng.IPromise<T> {
            var deferred = this.$q.defer();
            key = this.prefix(key);
            var value = this.sessionCache.get(key);

            if(!angular.isUndefined(value) && value !== null) {
                this.set(key, value);
                value = this.parse(value);
                if(!angular.isUndefined(objectBuilder) && objectBuilder !== null) value = objectBuilder(value);
                deferred.resolve(value);
                return deferred.promise;
            }
            /* istanbul ignore next */
            return apiCall().then((response: T) => {
                this.set(key, response);
                if(!angular.isUndefined(objectBuilder) && objectBuilder !== null) response = objectBuilder(response);
                return response;
            }, () => {
                // fallback to localStorage if API call fails
                var value = this.get(key);
                if(!angular.isUndefined(objectBuilder) && objectBuilder !== null) value = objectBuilder(value);
                return value;
            });
        }

        public configure(options: IStorageOptions) {
            angular.extend(this.options, options);
            if(angular.isDefined(options.storagePrefix) && options.storagePrefix !== null) {
                this.sessionCache.destroy();
                this.sessionCache = this.$cacheFactory(options.storagePrefix);
            }
        }

        public removeAll(): void {
            localStorage.clear();
            this.sessionCache.removeAll();
        }

        public remove(key: string): void {
            key = this.prefix(key);
            localStorage.removeItem(key);
            this.sessionCache.remove(key);
        }

        private parse(stringValue: string): any {
          var value;
          try {
              value = angular.fromJson(stringValue);
          } catch (e) {
              value = stringValue;
          }
          return value;
        }

        private overrideCacheItem(key: string, stringValue: string) {
            var itemExist = localStorage.getItem(this.prefix(key));
            if (angular.isUndefined(itemExist) || itemExist === null) return true;
            if (this.options.useCompression) itemExist = LZString.decompress(itemExist);
            var origionalHash = this.hash(itemExist);
            var newHash = this.hash(stringValue);
            return origionalHash !== newHash;
        }

        private prefix(key: string) {
            return this.options.storagePrefix + '.' + key;
        }

        private hash(value: string) {
            var hash = 0, i, chr, len;
            if (value.length === 0) return hash;
            for (i = 0, len = value.length; i < len; i++) {
                chr = value.charCodeAt(i);
                hash = ((hash << 5) - hash) + chr;
                hash |= 0;
            }
            return hash;
        }
    }

    function factory($q: ng.IQService, $cacheFactory: ng.ICacheFactoryService): IClientCacheService {
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
}
