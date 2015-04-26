# Intergen.ClientCache

[![Build Status](https://travis-ci.org/jonocairns/Intergen.ClientCache.svg?branch=master)](https://travis-ci.org/jonocairns/Intergen.ClientCache) [![Code Climate](https://codeclimate.com/github/jonocairns/Intergen.ClientCache/badges/gpa.svg)](https://codeclimate.com/github/jonocairns/Intergen.ClientCache) [![Test Coverage](https://codeclimate.com/github/jonocairns/Intergen.ClientCache/badges/coverage.svg)](https://codeclimate.com/github/jonocairns/Intergen.ClientCache)

Local storage and session storage wrapper for angular. Also has functionality to compress items to be stored in local/session storage.

Tests run across the lastest versions of IE/Firefox/Chrome

Uses http://caniuse.com/#search=web%20storage

Written in typescript

Options: interface IStorageOptions {
        storagePrefix?: string;
        useCompression?: boolean;
        storageType?: StorageType;
    }

Dependencies: 

LZ-string (https://github.com/pieroxy/lz-string/),
Angular
