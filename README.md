# angular-client-cache

[![Build Status](https://travis-ci.org/jonocairns/angular-client-cache.svg?branch=master)](https://travis-ci.org/jonocairns/angular-client-cache) [![Code Climate](https://codeclimate.com/github/jonocairns/angular-client-cache/badges/gpa.svg)](https://codeclimate.com/github/jonocairns/angular-client-cache) [![Test Coverage](https://codeclimate.com/github/jonocairns/angular-client-cache/badges/coverage.svg)](https://codeclimate.com/github/jonocairns/angular-client-cache) [![NPM version][npm-image]][npm-url] [![License][license-image]][license-url] [![Dependency Status][david-image]][david-url]
 

Local storage and session storage wrapper for angular. Also has functionality to compress items to be stored in local/session storage. 

Assists with the issue of low (2.5-10MB~) storage limits. Example case - had 5.12MB of localStorage data - this was compressed to 500kb.

Tests run across the lastest versions of IE/Firefox/Chrome

Uses http://caniuse.com/#search=web%20storage

Written in typescript

##Get Started

**(1)** Grab the **npm** package
```bash
$ npm install lz-string angular-client-cache --save
```
**(2)** Include `angular-client-cache.js` from the [dist](https://github.com/jonocairns/angular-client-cache/tree/master/dist/bin) and `lz-string.js` in your `index.html` after angular.

**(3)** Add `'ClientCache'` to your main module's list of dependencies.

**(4)** Inject 'ClientCacheService' and use it!

Usage info: 
```javascript
     set(key: string, value: any, storageType?: StorageType): ng.IPromise<any>;
     
     get<T>(key: string, storageType?: StorageType): T;
     
     tryGetSet<T>(key: string, apiCall: Function, objectBuilder?: Function): ng.IPromise<T>;
     
     configure(options: IStorageOptions): void;
     
     remove(key: string, storageType?: StorageType): void;
     
     removeAll(storageType?: StorageType): void;
``` 

Example usages:
(note: the enum StorageType can only be used if you are using typescript - the values for pure js are Local - 0, Session - 1 and All - 2)
````javascript    
    //set:
    
    var value = 'storeMePlz';
    clientCache.set('key', value);
    
    // or 
    
    clientCache.set('key', value, StorageType.Session);
    
    //get:
    
    clientCache.get('key');
    
    // or
    
    clientCache.get('key', StorageType.Local);
    
    // tryGetSet
    
    clientCache.tryGetSet('key', $http.get('/api/blah'));
    
    // or
    
    var builder = function(itemToBuild) { return { something: new Date(itemToBuild.date); }};
    clientCache.tryGetSet('key', $http.get('/api/blah'), builder);
    
    // configure
    
    clientCache.configure({ useCompression: true });
    
    // remove
    
    clientCache.remove('key');
    
    // or
    
    clientCache.remove('key', StorageType.All);
    
    // removeAll
    
    clientCache.removeAll();
    
    // or 
    
    clientCache.removeAll(StorageType.Session);
```

``` javascript
Options: interface IStorageOptions {
        storagePrefix?: string;
        useCompression?: boolean; // defaulted to false
        storageType?: StorageType; // defaulted to BOTH session and local storage
    }
```    

Dependencies: 

LZ-string (https://github.com/pieroxy/lz-string/),
Angular

[npm-image]: https://img.shields.io/npm/v/angular-client-cache.svg?style=flat-square
[npm-url]: https://npmjs.org/package/angular-client-cache
[license-image]: http://img.shields.io/npm/l/angular-client-cache.svg?style=flat-square
[license-url]: LICENSE
[david-image]: http://img.shields.io/david/jonocairns/angular-client-cache.svg?style=flat-square
[david-url]: https://david-dm.org/jonocairns/angular-client-cache
