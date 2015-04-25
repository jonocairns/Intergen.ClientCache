'use strict';

describe('TODO:LOL', function() {
  var storage, $timeout;
  beforeEach(module('IntergenStorage'))

  beforeEach(inject(function (_IntergenStorageService_, _$timeout_) {
    storage = _IntergenStorageService_;
    $timeout = _$timeout_
  }));

  afterEach(function() {
  	sessionStorage.clear();
  	localStorage.clear();
  });

  it('should be able to set in local and session storage', function() {
    var valueToBeSet = 'hello'
    storage.set('testKey', valueToBeSet).then(function() {
    	var browserSessionStorage = sessionStorage.getItem('intergen.testKey')
    	expect(browserSessionStorage).toBe(valueToBeSet);
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
  })

});