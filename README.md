# Intergen.ClientCache

[![Build Status](https://travis-ci.org/jonocairns/Intergen.ClientCache.svg?branch=master)](https://travis-ci.org/jonocairns/Intergen.ClientCache)

Local storage and session storage wrapper for angular. Also has functionality to compress items to be stored in local/session storage.

Written in typescript

Options: interface IStorageOptions {
        storagePrefix?: string;
        useCompression?: boolean;
        storageType?: StorageType;
    }

Dependencies: 

LZ-string (https://github.com/pieroxy/lz-string/),
Angular
