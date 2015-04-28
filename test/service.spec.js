'use strict';

describe('Storage Service test: ', function() {
	var storage, $timeout, $httpBackend, $http;
	beforeEach(module('ClientCache'))

	beforeEach(inject(function (_ClientCacheService_, _$timeout_, _$httpBackend_, _$http_) {
		storage = _ClientCacheService_;
		$timeout = _$timeout_;
		$httpBackend = _$httpBackend_;
		$http = _$http_;
	}));

	afterEach(function() {
		storage.removeAll();
	});

	it('should be able to set in local storage', function() {
		var valueToBeSet = 'hello';
		storage.set('testKey', valueToBeSet);
		var browserLocalStorage = localStorage.getItem('intergen.testKey');
		expect(browserLocalStorage).toBe(valueToBeSet);
	});

	it('should perform the API call then set it to local storage', function() {
		$httpBackend.when('GET','blah').respond({ t: 'blah'});
		var apiCall = function() { return $http.get('blah'); }

		storage.tryGetSet('key', apiCall).then(function() {
			expect(localStorage.getItem('intergen.key')).toBeDefined();
		});
	});

	it('should perform the API call then set it to local storage and return a build object with a date', function() {
		var date = new Date().toISOString();
		$httpBackend.when('GET','blah').respond({ t: date});
		var apiCall = function() { return $http.get('blah'); }
		var builder = function(item) { return { t: new Date(item.t) } };

		storage.tryGetSet('key', apiCall, builder).then(function(item) {
			expect(item.t instanceof Date).toBeTruthy();
			expect(localStorage.getItem('intergen.key')).toBeDefined();
		});
	});

	it('should pull from session storage and not perform API call', function() {
		var callerService = { apiCall : function() { return $http.get('blah'); } };
		spyOn(callerService, 'apiCall').and.callThrough();

		storage.set('key', { t: 'as' });

		storage.tryGetSet('key', callerService.apiCall).then(function() {
			expect(callerService.apiCall).not.toHaveBeenCalled();
		});
	});

	it('should compress the target value and set in local and session storage', function() {
		storage.configure({
			useCompression: true
		});

		var valueToBeSet = {
			a: 'adsfklsdfkmlsklfsdlkdsfklfsdlkjfsdklsfdkljsfdkjlsfdjklsfdjkfsdj dsfjfdsjlkfdsjlkfsdjlkjksldf j sfjkfds jlk sfdjkl sfd',
			b: 'adskldsl kfdjkslfjdslk jkdfsjksfd jfksdjk dfsjk fdskjfsdkjl fdskfkjlfdkjlfdkfskjljk sldfjk l sdfk js kjsfdkjlfsdjksfdjksfdkj l kjfs dkjlsf djkljkl fsdkjls'
		}
		var stringLength = JSON.stringify(valueToBeSet).length;

		storage.set('compressionTest', valueToBeSet);
		var browserLocalStorage = localStorage.getItem('intergen.compressionTest').length;
		expect(browserLocalStorage).toBeLessThan(stringLength)
		console.log('size before: ' + stringLength + ' size after:' +  browserLocalStorage);

		storage.configure({
			useCompression: false
		});
	});

	it('should return js objects if they are set as such', function() {
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

	it('should return ISO date strings', function() {
		var date = new Date();
		storage.set('ab', date);

		var val = storage.get('ab');

		expect(angular.isString(val)).toBeTruthy();
		expect(val).toEqual(date.toISOString())
	});

	it('should throw an error if the key passed in set is undefined', function() {
		expect(function() {
			storage.set(undefined, { test: 'a'});
		}).toThrowError();
	});

	it('should throw an error if the value passed in set is undefined', function() {
		expect(function() {
			storage.set('legitKey', undefined);
		}).toThrowError();
	});

	it('should throw an error if the key passed in get is undefined', function() {
		expect(function() {
			storage.set(undefined);
		}).toThrowError();
	});

	it('should have the correct config values when the configure method is called', function() {
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

	it('should remove value from local storage', function() {
		var value = 's';
		spyOn(window.localStorage, 'removeItem').and.callThrough();
		storage.set('item', value);
		expect(storage.get('item')).toBe(value);
		storage.remove('item');
		expect(localStorage.getItem('intergen.item')).toBe(null);
		expect(window.localStorage.removeItem).toHaveBeenCalled();
	});

	it('should clear local and session storage', function() {
		var value = 's';
		spyOn(window.localStorage, 'clear').and.callThrough();
		spyOn(storage, 'removeAll').and.callThrough();
		storage.set('item', value);
		expect(storage.get('item')).toBe(value);
		storage.removeAll();
		expect(localStorage.getItem('intergen.item')).toBe(null);
		expect(window.localStorage.clear).toHaveBeenCalled();
		expect(storage.removeAll).toHaveBeenCalled();
	});
});
