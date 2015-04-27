'use strict';

describe('Storage Service test: ', function() {
	var storage, $timeout;
	beforeEach(module('ClientCache'))

	beforeEach(inject(function (_ClientCacheService_, _$timeout_) {
		storage = _ClientCacheService_;
		$timeout = _$timeout_
	}));

	afterEach(function() {
		sessionStorage.clear();
		localStorage.clear();
	});

	it('should be able to set in local and session storage', function() {
		var valueToBeSet = 'hello'
		storage.set('testKey', valueToBeSet).then(function() {
			var browserSessionStorage = sessionStorage.getItem('intergen.testKey');
			var browserLocalStorage = localStorage.getItem('intergen.testKey');
			expect(browserSessionStorage).toBe(valueToBeSet);
			expect(browserLocalStorage).toBe(valueToBeSet);
		});
		$timeout.flush();
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

		storage.set('compressionTest', valueToBeSet).then(function() {
			var browserSessionStorage = sessionStorage.getItem('intergen.compressionTest').length;
			expect(browserSessionStorage).toBeLessThan(stringLength)
			console.log('size before: ' + stringLength + ' size after:' +  browserSessionStorage);
		});
		$timeout.flush();
		storage.configure({
			useCompression: false
		});
	});

	it('should get value from session storage', function() {
		var value = {
			a: 'blah'
		};

		sessionStorage.setItem('intergen.ses', value);

		var fromSessionStorage = storage.get('ses');

		expect(fromSessionStorage).not.toBe(null);
		expect(fromSessionStorage).not.toBe(undefined);
	});

	it('should get value from storage - with session storage preference', function() {
	  	var valueSession = {
	  		a: 'blah'
	  	};
	  	var valueLocal = {
	  		a: 'notblah'
	  	};

		sessionStorage.setItem('intergen.ses', JSON.stringify(valueSession));
	  	localStorage.setItem('intergen.ses', JSON.stringify(valueLocal));

	  	var fromSessionStorage = storage.get('ses');

	  	expect(fromSessionStorage.a).toBe(valueSession.a);
	});

	it('should not set over the current value if the object going in to storage is exactly the same', function() {
		var value = 'test';
		spyOn(storage, 'store').and.callThrough();

		storage.set('test', value);
		$timeout.flush();

		storage.set('test', value).then(function() {
			expect(storage.store.calls.count()).toEqual(1);
		});
		
		$timeout.flush();
	});

	it('should set over the current value if the object going in to storage is exactly the same', function() {
		var value = 'test';
		spyOn(storage, 'store').and.callThrough();

		storage.set('test', value);
		$timeout.flush();

		value = 'changed';

		storage.set('test', value).then(function() {
			expect(storage.store.calls.count()).toEqual(2);
		});
		
		$timeout.flush();
	});

	it('should return js objects if they are set as such', function() {
		var obj = {
			prop: 'hello',
			truth: false,
			h: 5
		};

		storage.set('val', obj);
		$timeout.flush();

		var after = storage.get('val');

		expect(angular.isString(after.prop)).toBeTruthy();
		expect(angular.isNumber(after.h)).toBeTruthy();
		expect(after.truth).toBeFalsy();
	});

	it('should return ISO date strings', function() {
		var date = new Date();
		storage.set('ab', date);
		$timeout.flush();

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
		var prefix = 'someOtherPrefix';
		var useCompression = true;
		var storageType = 1;

		storage.configure({
			storagePrefix: prefix,
			useCompression: useCompression,
			storageType: storageType
		});
		
		expect(storage.options.storagePrefix).toBe(prefix);
		expect(storage.options.useCompression).toBe(useCompression);
		expect(storage.options.storageType).toBe(storageType);

		storage.configure(oldOptions);
	});

	it('should remove value from session storage only', function() {
		var value = 's';
		spyOn(window.sessionStorage, 'removeItem').and.callThrough();

		storage.set('item', value).then(function() {
			expect(storage.get('item')).toBe(value);
			storage.remove('item', 1);
			expect(sessionStorage.getItem('intergen.item')).toBe(null);
			expect(localStorage.getItem('intergen.item')).toBe(value);
			expect(window.sessionStorage.removeItem).toHaveBeenCalled();
		});
		$timeout.flush();
	});

	it('should remove value from local storage only', function() {
		var value = 's';
		spyOn(window.localStorage, 'removeItem').and.callThrough();
		storage.set('item', value).then(function() {
			expect(storage.get('item')).toBe(value);
			storage.remove('item', 0);
			expect(sessionStorage.getItem('intergen.item')).toBe(value);
			expect(localStorage.getItem('intergen.item')).toBe(null);
			expect(window.localStorage.removeItem).toHaveBeenCalled();
		});
		$timeout.flush();
	});

	it('should remove value from local and session storage', function() {
		var value = 's';
		spyOn(window.localStorage, 'removeItem').and.callThrough();
		spyOn(window.sessionStorage, 'removeItem').and.callThrough();
		storage.set('item', value).then(function() {
			expect(storage.get('item')).toBe(value);
			storage.remove('item', 2);
			expect(sessionStorage.getItem('intergen.item')).toBe(null);
			expect(localStorage.getItem('intergen.item')).toBe(null);
			expect(window.localStorage.removeItem).toHaveBeenCalled();
			expect(window.sessionStorage.removeItem).toHaveBeenCalled();
		});
		$timeout.flush();
	});

	it('should clear local and session storage', function() {
		var value = 's';
		spyOn(window.localStorage, 'clear').and.callThrough();
		spyOn(window.sessionStorage, 'clear').and.callThrough();
		spyOn(storage, 'removeAll').and.callThrough();
		storage.set('item', value).then(function() {
			expect(storage.get('item')).toBe(value);
			storage.removeAll(2);
			expect(sessionStorage.getItem('intergen.item')).toBe(null);
			expect(localStorage.getItem('intergen.item')).toBe(null);
			expect(window.localStorage.clear).toHaveBeenCalled();
			expect(window.sessionStorage.clear).toHaveBeenCalled();
			expect(storage.removeAll).toHaveBeenCalled();
		});
		$timeout.flush();
	});

	it('should clear session storage only', function() {
		var value = 's';
		spyOn(window.sessionStorage, 'clear').and.callThrough();
		storage.set('item', value).then(function() {
			expect(storage.get('item')).toBe(value);
		});
		$timeout.flush();
		storage.set('anotherItem', value).then(function() {
			storage.removeAll(1);
			expect(sessionStorage.length).toBe(0);
			expect(localStorage.length).toBe(2);
			expect(window.sessionStorage.clear).toHaveBeenCalled();
		});
	});

	it('should clear local storage only', function() {
		var value = 's';
		spyOn(window.localStorage, 'clear').and.callThrough();
		storage.set('item', value).then(function() {
			expect(storage.get('item')).toBe(value);
		});
		$timeout.flush();
		storage.set('anotherItem', value).then(function() {
			storage.removeAll(0);
			expect(sessionStorage.length).toBe(2);
			expect(localStorage.length).toBe(0);
			expect(window.localStorage.clear).toHaveBeenCalled();
		});
	});
});