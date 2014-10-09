(function($) {
  /*
    ======== A Handy Little QUnit Reference ========
    http://api.qunitjs.com/

    Test methods:
      module(name, {[setup][ ,teardown]})
      test(name, callback)
      expect(numberOfAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      throws(block, [expected], [message])
  */

  module('jQuery#outliner', {
    // This will run before each test in this module.
    setup: function() {
      this.elems = $('#qunit-fixture').children();
    }
  });

  test('is chainable', function() {
    expect(1);
    // Not a bad test to run on collection methods.
    strictEqual(this.elems.outliner(), this.elems, 'should be chainable');
  });

  test('is outlined', function() {
    expect(1);
    strictEqual(this.elems.outliner().last().hasClass('dom-outliner'), true, 'should have the dom-outliner class');
  });

  module('jQuery.outliner');

  test('created dom helpers', function() {
    expect(2);

    $.outliner();

    strictEqual($('body > .dom-outliner-glass').length, 4, 'should have four glasses');
    strictEqual($('body > .dom-outliner-label').length, 1, 'should have one label helper');
  });

  module(':outliner selector', {
    // This will run before each test in this module.
    setup: function() {
      this.elems = $('#qunit-fixture').children();
    }
  });

  test('is outliner', function() {
    expect(1);
    // Use deepEqual & .get() when comparing jQuery objects.
    deepEqual(this.elems.outliner().filter(':outliner').get(), this.elems.get(), 'knows outliner when it sees it');
  });

}(jQuery));
