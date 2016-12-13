'use strict';

var assert = require('chai').assert;
var rule = require('../../../lib/rules/format.js');

describe('format', function () {
  it('should have a message', function () {
    assert.equal(rule.message, 'expected format {0}');
  });

  it('should pass empty strings', function () {
      assert.isTrue(rule('', 'url'));
  });

  it('should validate urls', function () {
    assert.isTrue(rule('localhost', 'url'));
    assert.isTrue(rule('test.com', 'url'));
    assert.isTrue(rule('www.test.com', 'url'));
    assert.isTrue(rule('www.test.co.uk', 'url'));
    assert.isTrue(rule('http://127.0.0.1', 'url'));
    assert.isTrue(rule('http://127.0.0.1/test', 'url'));
    assert.isTrue(rule('http://test.com', 'url'));
    assert.isTrue(rule('http://www.test.com', 'url'));
    assert.isTrue(rule('http://www.test.co.uk', 'url'));
    assert.isTrue(rule('http://www.test.com/test.html', 'url'));
    assert.isTrue(rule('http://www.test.com/test/test.html', 'url'));
    assert.isTrue(rule('http://www.test.com/test-hyphens/test-hyphens.html', 'url'));
    assert.isTrue(rule('http://www.test.com/test%20spaces/test%20spaces.html', 'url'));
    assert.isTrue(rule('http://www.test-hyphens.com', 'url'));
    assert.isTrue(rule('http://www.test.com/page(wikistyle)', 'url'));
    assert.isTrue(rule('http://www.test.com/?querystring=with+stuff&other=things', 'url'));
    assert.isTrue(rule('http://www.test.com/page-with?querystring=with+stuff&other=things', 'url'));
    assert.isTrue(rule('http://www.test.com?querystring+with+empty+path', 'url'));

    // sanity check:
    assert.isFalse(rule('http://www.te$t.com', 'url'));
    assert.isFalse(rule('http://www.test.com/no spaces', 'url'));
    assert.isFalse(rule('http://www.test.com/path/with/backslash\\', 'url'));
    assert.isFalse(rule('there\'s a lot of stuff that isn\'t a url honestly', 'url'));
  });

  it('should pass http, https, and ftp protocols', function () {
    assert.isTrue(rule('http://www.test.com', 'url'));
    assert.isTrue(rule('https://www.test.com', 'url'));
    assert.isTrue(rule('ftp://www.test.com', 'url'));
    assert.isFalse(rule('blah://www.test.com', 'url'));
  });

  it('should pass all combinations of scheme, hierarchy, query, and fragment', function () {
    assert.isTrue(rule('www.test.com/path/to%20page/page', 'url'));
    assert.isTrue(rule('www.test.com/path/to%20page/page?one=two&three=four+five&six=seven%20and%20eight', 'url'));
    assert.isTrue(rule('www.test.com/path/to%20page/page#thing', 'url'));
    assert.isTrue(rule('www.test.com/path/to%20page/page?one=two&three=four+five&six=seven%20and%20eight#thing', 'url'));
    assert.isTrue(rule('http://www.test.com/path/to%20page/page', 'url'));
    assert.isTrue(rule('http://www.test.com/path/to%20page/page?one=two&three=four+five&six=seven%20and%20eight', 'url'));
    assert.isTrue(rule('http://www.test.com/path/to%20page/page#thing', 'url'));
    assert.isTrue(rule('http://www.test.com/path/to%20page/page?one=two&three=four+five&six=seven%20and%20eight#thing', 'url'));
  });

  it('should cover a subset of Mathis Bynens\' sample URLs', function () {
    // list at https://mathiasbynens.be/demo/url-regex
    // current major misses:
    // * no unicode
    // * no authentication
    // * hostname validation passes garbage IPs

    assert.isTrue(rule('http://foo.com/blah_blah', 'url'));
    assert.isTrue(rule('http://foo.com/blah_blah/', 'url'));
    assert.isTrue(rule('http://foo.com/blah_blah_(wikipedia)', 'url'));
    assert.isTrue(rule('http://foo.com/blah_blah_(wikipedia)_(again)', 'url'));
    assert.isTrue(rule('http://www.example.com/wpstyle/?p=364', 'url'));
    assert.isTrue(rule('https://www.example.com/foo/?bar=baz&inga=42&quux', 'url'));
    // assert.isTrue(rule('http://✪df.ws/123', 'url'));
    // assert.isTrue(rule('http://userid:password@example.com:8080', 'url'));
    // assert.isTrue(rule('http://userid:password@example.com:8080/', 'url'));
    // assert.isTrue(rule('http://userid@example.com', 'url'));
    // assert.isTrue(rule('http://userid@example.com/', 'url'));
    // assert.isTrue(rule('http://userid@example.com:8080', 'url'));
    // assert.isTrue(rule('http://userid@example.com:8080/', 'url'));
    // assert.isTrue(rule('http://userid:password@example.com', 'url'));
    // assert.isTrue(rule('http://userid:password@example.com/', 'url'));
    assert.isTrue(rule('http://142.42.1.1/', 'url'));
    assert.isTrue(rule('http://142.42.1.1:8080/', 'url'));
    // assert.isTrue(rule('http://➡.ws/䨹', 'url'));
    // assert.isTrue(rule('http://⌘.ws', 'url'));
    // assert.isTrue(rule('http://⌘.ws/', 'url'));
    assert.isTrue(rule('http://foo.com/blah_(wikipedia)#cite-1', 'url'));
    assert.isTrue(rule('http://foo.com/blah_(wikipedia)_blah#cite-1', 'url'));
    assert.isTrue(rule('http://foo.com/unicode_(✪)_in_parens', 'url'));
    assert.isTrue(rule('http://foo.com/(something)?after=parens', 'url'));
    // assert.isTrue(rule('http://☺.damowmow.com/', 'url'));
    assert.isTrue(rule('http://code.google.com/events/#&product=browser', 'url'));
    assert.isTrue(rule('http://j.mp', 'url'));
    assert.isTrue(rule('ftp://foo.bar/baz', 'url'));
    assert.isTrue(rule('http://foo.bar/?q=Test%20URL-encoded%20stuff', 'url'));
    // assert.isTrue(rule('http://مثال.إختبار', 'url'));
    // assert.isTrue(rule('http://例子.测试', 'url'));
    // assert.isTrue(rule('http://उदाहरण.परीक्षा', 'url'));
    // assert.isTrue(rule('http://-.~_!$&\'()*+,;=:%40:80%2f::::::@example.com', 'url'));
    assert.isTrue(rule('http://1337.net', 'url'));
    assert.isTrue(rule('http://a.b-c.de', 'url'));
    assert.isTrue(rule('http://223.255.255.254', 'url'));

    assert.isFalse(rule('http://', 'url'));
    assert.isFalse(rule('http://.', 'url'));
    assert.isFalse(rule('http://..', 'url'));
    assert.isFalse(rule('http://../', 'url'));
    assert.isFalse(rule('http://?', 'url'));
    assert.isFalse(rule('http://??', 'url'));
    assert.isFalse(rule('http://??/', 'url'));
    assert.isFalse(rule('http://#', 'url'));
    assert.isFalse(rule('http://##', 'url'));
    assert.isFalse(rule('http://##/', 'url'));
    assert.isFalse(rule('http://foo.bar?q=Spaces should be encoded', 'url'));
    assert.isFalse(rule('//', 'url'));
    assert.isFalse(rule('//a', 'url'));
    assert.isFalse(rule('///a', 'url'));
    assert.isFalse(rule('///', 'url'));
    assert.isFalse(rule('http:///a', 'url'));
    assert.isFalse(rule('rdar://1234', 'url'));
    assert.isFalse(rule('h://test', 'url'));
    assert.isFalse(rule('http:// shouldfail.com', 'url'));
    assert.isFalse(rule(':// should fail', 'url'));
    assert.isFalse(rule('http://foo.bar/foo(bar)baz quux', 'url'));
    assert.isFalse(rule('ftps://foo.bar/', 'url'));
    assert.isFalse(rule('http://-error-.invalid/', 'url'));
    // assert.isFalse(rule('http://a.b--c.de/', 'url'));
    assert.isFalse(rule('http://-a.b.co', 'url'));
    assert.isFalse(rule('http://a.b-.co', 'url'));
    // assert.isFalse(rule('http://0.0.0.0', 'url'));
    // assert.isFalse(rule('http://10.1.1.0', 'url'));
    // assert.isFalse(rule('http://10.1.1.255', 'url'));
    // assert.isFalse(rule('http://224.1.1.1', 'url'));
    // assert.isFalse(rule('http://1.1.1.1.1', 'url'));
    // assert.isFalse(rule('http://123.123.123', 'url'));
    // assert.isFalse(rule('http://3628126748', 'url'));
    assert.isFalse(rule('http://.www.foo.bar/', 'url'));
    assert.isFalse(rule('http://www.foo.bar./', 'url'));
    assert.isFalse(rule('http://.www.foo.bar./', 'url'));
    // assert.isFalse(rule('http://10.1.1.1', 'url'));
    // assert.isFalse(rule('http://10.1.1.254', 'url'));
  });

  it('should validate emails', function () {
    // not supported:
    assert.isFalse(rule('"have some spaces"@test.com', 'email'));
    assert.isFalse(rule('üñîçøðé@test.com', 'email'));
    assert.isFalse(rule('test@local', 'email'));

    // supported:
    assert.isTrue(rule('test@test.com', 'email'));
    assert.isTrue(rule('test@test-hyphens.com', 'email'));
    assert.isTrue(rule('first.last@test.com', 'email'));
    assert.isTrue(rule('dubious.smythe-fauntleroy@test.com', 'email'));
    assert.isTrue(rule('test+test@test.com', 'email'));

    // sanity check:
    assert.isFalse(rule('test.test.com', 'email'));
    assert.isFalse(rule('test@test@test.com', 'email'));
    assert.isFalse(rule('first..last@test.com', 'email'));
    assert.isFalse(rule('quote"some"stuff@test.com', 'email'));
  });

  it('should validate ipv4 addresses', function () {
    assert.isTrue(rule('127.0.0.1', 'ipv4'));
    assert.isTrue(rule('2.2.2.2', 'ipv4'));

    assert.isFalse(rule('999.999.999.999', 'ipv4'));
    assert.isFalse(rule('254.254.254', 'ipv4'));
    assert.isFalse(rule('254.254.254.', 'ipv4'));
    assert.isFalse(rule('hi!', 'ipv4'));
  });

  it('should validate ipv6 addresses', function () {
    assert.isFalse(rule('::1', 'ipv6')); // you're going to have to spell it out :(
    assert.isTrue(rule('0:0:0:0:0:0:0:1', 'ipv6'));
    assert.isTrue(rule('2001:0db8:85a3:0000:0000:8a2e:0370:7334', 'ipv6'));

    assert.isFalse(rule('2001:0db8:85a3:0000:0000:8a2e:0370', 'ipv6'));
    assert.isFalse(rule('2001:0db8:85a3:0000:0000:8a2e:0370:', 'ipv6'));
    assert.isFalse(rule('20010101:0db8:85a3:0000:0000:8a2e:0370:7334', 'ipv6'));
    assert.isFalse(rule('qqqq:0db8:85a3:0000:0000:8a2e:0370:7334', 'ipv6'));
    assert.isFalse(rule('hi!', 'ipv6'));
  });

  it('should validate hostnames', function () {
    assert.isTrue(rule('test.com', 'hostname'));
    assert.isTrue(rule('test-hyphens.com', 'hostname'));
    assert.isTrue(rule('q.local', 'hostname'));
    assert.isTrue(rule('subdomain.test.com', 'hostname'));
    assert.isTrue(rule('test', 'hostname'));

    assert.isFalse(rule(new Array(257).join('a'), 'hostname'));  // 257 is intentional, resulting length is 256
    assert.isFalse(rule('üñîçøðé.test.com', 'hostname'));
    assert.isFalse(rule('under_score.com', 'hostname'));
    assert.isFalse(rule('-test.com', 'hostname'));
    assert.isFalse(rule('test-.com', 'hostname'));
  });

  it('should validate hostnames or ip addresses', function () {
    assert.isTrue(rule('test.com', 'hostnameOrIp'));
    assert.isTrue(rule('test-hyphens.com', 'hostnameOrIp'));
    assert.isTrue(rule('q.local', 'hostnameOrIp'));
    assert.isTrue(rule('subdomain.test.com', 'hostnameOrIp'));
    assert.isTrue(rule('test', 'hostnameOrIp'));
    assert.isTrue(rule('127.0.0.1', 'hostnameOrIp'));
    assert.isTrue(rule('2.2.2.2', 'hostnameOrIp'));
    assert.isTrue(rule('0:0:0:0:0:0:0:1', 'hostnameOrIp'));
    assert.isTrue(rule('2001:0db8:85a3:0000:0000:8a2e:0370:7334', 'hostnameOrIp'));

    // these next two are false positives due to the hostname regex matching them
    assert.isTrue(rule('999.999.999.999', 'hostnameOrIp'));
    assert.isTrue(rule('254.254.254', 'hostnameOrIp'));

    assert.isFalse(rule(new Array(257).join('a'), 'hostnameOrIp'));  // 257 is intentional, resulting length is 256
    assert.isFalse(rule('üñîçøðé.test.com', 'hostnameOrIp'));
    assert.isFalse(rule('under_score.com', 'hostnameOrIp'));
    assert.isFalse(rule('-test.com', 'hostnameOrIp'));
    assert.isFalse(rule('test-.com', 'hostnameOrIp'));
    assert.isFalse(rule('254.254.254.', 'hostnameOrIp'));
    assert.isFalse(rule('hi!', 'hostnameOrIp'));
  });

  it('should validate ObjectIds', function () {
    assert.isTrue(rule('507f1f77bcf86cd799439011', 'objectId'));
    assert.isFalse(rule('507f1f77bcf86cd79943901', 'objectId'));
    assert.isFalse(rule('507f1f77bcf86cd7994390111', 'objectId'));
    assert.isFalse(rule('z07f1f77bcf86cd799439011', 'objectId'));
  });

  it('should validate uuids', function () {
    assert.isTrue(rule('10f31cce-728a-11e5-84cf-27795119e869', 'uuid'));
    assert.isFalse(rule('10f31cce-728-11e5-84cf-27795119e869', 'uuid'));
    assert.isFalse(rule('10f31cce-728a-11e5ee-84cf-27795119e869', 'uuid'));
    assert.isFalse(rule('10f31cce-728a-11e5-84cf-2779-119e869', 'uuid'));
  });
});
