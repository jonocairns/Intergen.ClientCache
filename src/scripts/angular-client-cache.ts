/* tslint:disable:no-bitwise */
'use strict';

module ClientCache {
    export interface IClientCacheService {
        set(key: string, value: any, storageType?: StorageType): ng.IPromise<any>;
        get<T>(key: string, storageType?: StorageType): T;
        tryGetSet<T>(key: string, apiCall: Function, objectBuilder?: Function): ng.IPromise<T>;
        configure(options: IStorageOptions): void;
        remove(key: string, storageType?: StorageType): void;
        removeAll(storageType?: StorageType): void;
    }

    export interface IStorageOptions {
        storagePrefix?: string;
        useCompression?: boolean;
        storageType?: StorageType;
    }

    export enum StorageType {
        Local,
        Session,
        All
    }

    export class ClientCacheService implements IClientCacheService {

        private options: IStorageOptions = {
            storagePrefix: 'intergen',
            useCompression: false,
            storageType: StorageType.All
        };

        constructor(private $q: ng.IQService, private $timeout: ng.ITimeoutService) {
        }

        public set(key: string, value: any, storageType?: StorageType): ng.IPromise<any> {
            if (angular.isUndefined(key)) throw new Error('Argument null exception. Parameter name: key. Function called: set');
            if (angular.isUndefined(value)) throw new Error('Argument null exception. Parameter name: value. Function called: set');

            var stringValue = value;
            var deffered = this.$q.defer();

            // Only stringify if json.
            if (angular.isObject(stringValue) || angular.isArray(stringValue) || angular.isNumber(+stringValue || stringValue)) {
                stringValue = angular.toJson(value);
            }

            this.$timeout(() => {
                var shouldOverride = this.overrideCacheItem(key, stringValue, this.resolveStorageType(storageType));

                if (shouldOverride) {
                    if (this.options.useCompression) {
                        stringValue = LZString.compress(stringValue);
                    }
                    this.store(key, stringValue, this.resolveStorageType(storageType));
                }
                deffered.resolve();
            });
            return deffered.promise;
        }

        public get<T>(key: string, storageType?: StorageType): T {
            if (angular.isUndefined(key)) throw new Error('Argument null exception. Parameter name: key. Function called: get');

            var stringValue = this.retrieve(key, this.resolveStorageType(storageType));

            if (angular.isUndefined(stringValue) || stringValue === null) {
                return undefined;
            }

            if (this.options.useCompression) stringValue = LZString.decompress(stringValue);

            var value;
            try {
                value = angular.fromJson(stringValue);
            } catch (e) {
                value = stringValue;
            }

            return value;
        }

        public tryGetSet<T>(key: string, apiCall: Function, objectBuilder?: Function): ng.IPromise<T> {
            var deferred = this.$q.defer();

            var value = this.get<T>(key, StorageType.All);
            if(!angular.isUndefined(value) && value !== null) {
                if(!angular.isUndefined(objectBuilder) && objectBuilder !== null) value = objectBuilder(value);
                deferred.resolve(value);
                return deferred.promise;
            }

            return apiCall().then((response: T) => {
                if(!angular.isUndefined(objectBuilder) && objectBuilder !== null) response = objectBuilder(response);
                this.set(key, response);
                return response;
            });
        }

        public configure(options: IStorageOptions) {
            angular.extend(this.options, options);
        }

        public removeAll(storageType?: StorageType): void {
            storageType = this.resolveStorageType(storageType);

            switch (storageType) {
                case StorageType.Local:
                    localStorage.clear();
                    break;
                case StorageType.Session:
                    sessionStorage.clear();
                    break;
                default:
                    sessionStorage.clear();
                    localStorage.clear();
            }
        }

        public remove(key: string, storageType?: StorageType): void {
            key = this.prefix(key);
            storageType = this.resolveStorageType(storageType);
            switch (storageType) {
                case StorageType.Local:
                    localStorage.removeItem(key);
                    break;
                case StorageType.Session:
                    sessionStorage.removeItem(key);
                    break;
                default:
                    sessionStorage.removeItem(key);
                    localStorage.removeItem(key);
            }
        }

        private resolveStorageType(storageType: StorageType) {
            return angular.isUndefined(storageType) ? this.options.storageType : storageType;
        }

        private overrideCacheItem(key: string, stringValue: string, storageType: StorageType) {
            var itemExist = this.retrieve(key, storageType);
            if (angular.isUndefined(itemExist) || itemExist === null) return true;
            if (this.options.useCompression) itemExist = LZString.decompress(itemExist);
            var origionalHash = this.hash(itemExist);
            var newHash = this.hash(stringValue);
            return origionalHash !== newHash;
        }

        private retrieve(key: string, storageType: StorageType): string {
            key = this.prefix(key);

            switch (storageType) {
                case StorageType.Local:
                    return localStorage.getItem(key);

                case StorageType.Session:
                    return sessionStorage.getItem(key);

                default:
                    var sessionStoreValue = sessionStorage.getItem(key);
                    if (!angular.isUndefined(sessionStorage)) return sessionStoreValue;
                    return localStorage.getItem(key);
            }
        }

        private store(key: string, value: string, storageType: StorageType): void {
            key = this.prefix(key);

            switch (storageType) {
                case StorageType.Local:
                    localStorage.setItem(key, value);
                    break;

                case StorageType.Session:
                    sessionStorage.setItem(key, value);
                    break;

                default:
                    localStorage.setItem(key, value);
                    sessionStorage.setItem(key, value);
            }
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

    function factory($q: ng.IQService, $timeout: ng.ITimeoutService): IClientCacheService {
        return new ClientCacheService($q, $timeout);
    }
    factory.$inject = [
        '$q',
        '$timeout'
    ];

    angular.module('ClientCache', []);

    angular
        .module('ClientCache')
        .factory('ClientCacheService', factory);
}