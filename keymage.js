// keymage.js - Javascript keyboard event handling

(function(global, exports, undefined) {
    function _bind(fn, ctx) {
        return function() {
            return fn.apply(ctx, arguments);
        };
    }


    // Defining all keys
    var MODPROPS = ['shiftKey', 'ctrlKey', 'altKey', 'metaKey'];
    var MODS = {
        'shift': 'shift',
        'ctrl': 'ctrl', 'control': 'ctrl',
        'alt': 'alt', 'option': 'alt',
        'win': 'meta', 'cmd': 'meta', 'super': 'meta',
                          'meta': 'meta',
        // default modifier for os x is cmd and for others is ctrl
        'defmod': ~navigator.userAgent.indexOf('Mac OS X') ?
            'meta' : 'ctrl'
        };
    var MODORDER = ['shift', 'ctrl', 'alt', 'meta'];
    var MODNUMS = [16, 17, 18, 91];

    var KEYS = {
        'backspace': 8,
        'tab': 9,
        'enter': 13, 'return': 13,
        'pause': 19,
        'caps': 20, 'capslock': 20,
        'escape': 27, 'esc': 27,
        'space': 32,
        'pgup': 33, 'pageup': 33,
        'pgdown': 34, 'pagedown': 34,
        'end': 35,
        'home': 36,
        'ins': 45, 'insert': 45,
        'del': 46, 'delete': 46,

        'left': 37,
        'up': 38,
        'right': 39,
        'down': 40,

        '*': 106,
        '+': 107, 'plus': 107,
        '-': 109, 'minus': 109,
        ';': 186,
        '=': 187,
        ',': 188,
        '.': 190,
        '/': 191,
        '`': 192,
        '[': 219,
        '\\': 220,
        ']': 221,
        "'": 222
    };

    var i;
    // numpad
    for (i = 0; i < 10; i++) {
        KEYS['num-' + i] = i + 95;
    }
    // top row 0-9
    for (i = 0; i < 10; i++) {
        KEYS[i.toString()] = i + 48;
    }
    // f1-f24
    for (i = 1; i < 25; i++) {
        KEYS['f' + i] = i + 111;
    }
    // alphabet
    for (i = 65; i < 91; i++) {
        KEYS[String.fromCharCode(i).toLowerCase()] = i;
    }

    // Reverse key codes
    var KEYREV = {};
    for (var k in KEYS) {
        var val = KEYS[k];
        if (!KEYREV[val] || KEYREV[val].length < k.length) {
            KEYREV[val] = k;
        }
    }

    // Sequence matching states

    var STATE = {
        MATCH: 1,
        PARTIAL: 2,
        INTERRUPT: 3
    };

    // -----------------------
    // Actual work is done here

    var currentScope = 'all';

    function parseKeyString(keystring) {
        var bits = keystring.split('-');
        var button = bits[bits.length - 1];
        var key = {code: KEYS[button]};

        if (!key.code) {
            throw 'Unknown key "' + button + '" in keystring "' +
                keystring + '"';
        }

        var mod;
        for (var i = 0; i < bits.length - 1; i++) {
            button = bits[i];
            mod = MODS[button];
            if (!mod) {
                    throw 'Unknown modifier "' + button + '" in keystring "' +
                        keystring + '"';
            }
            key[mod] = true;
        }

        return key;
    }

    function stringifyKey(key) {
        var s = '';
        for (var i = 0; i < MODORDER.length; i++) {
            if (key[MODORDER[i]]) {
                s += MODORDER[i] + '-';
            }
        }
        s += KEYREV[key.code];
        return s;
    }

    function normalizeKeyChain(keychainString) {
        var keychain = [];
        var keys = keychainString.split(' ');

        for (var i = 0; i < keys.length; i++) {
            var key = parseKeyString(keys[i]);
            key = stringifyKey(key);
            keychain.push(key);
        }

        keychain.original = keychainString;
        return keychain;
    }

    function eventKeyString(e) {
        var key = {code: e.keyCode};
        for (var i = 0; i < MODPROPS.length; i++) {
            var mod = MODPROPS[i];
            if (e[mod]) {
                key[mod.slice(0, mod.length - 3)] = true;
            }
        }
        return stringifyKey(key);
    }


    var sequence = [];
    function dispatch(e) {
        // Skip all modifiers
        if (~MODNUMS.indexOf(e.keyCode)) {
            return;
        }

        var seq = sequence.slice();
        seq.push(eventKeyString(e));
        var matched = true;

        var chains = keymage.bindings[currentScope];
        var key;
        for (var i = 0; i < seq.length; i++) {
            key = seq[i];
            if (!chains[key]) {
                matched = false;
                break;
            }
            chains = chains[key];
        }

        if (matched) {
            // partial match
            if (!chains.handlers) {
                sequence = seq;
            } else {
                for (i = 0; i < chains.handlers.length; i++) {
                    var handler = chains.handlers[i];
                    var res = handler(e, handler._original);
                    if (res === false) {
                        e.preventDefault();
                    }
                }
            }
        }
    }

    function assignKey(scope, keychain, fn) {
        var chains = keymage.bindings[scope] || (keymage.bindings[scope] = {});

        for (var i = 0, l = keychain.length; i < l; i++) {
            var key = keychain[i];
            chains = chains[key] || (chains[key] = {});

            if (i === l - 1) {
                var handlers = chains.handlers || (chains.handlers = []);
                handlers.push(fn);
            }
        }
    }

    var keymage = exports.keymage = function(scope, keychain, fn) {
        if (keychain === undefined && fn === undefined) {
            return function(keychain, fn) {
                return keymage(scope, keychain, fn);
            };
        }

        if (fn === undefined && typeof keychain === 'function') {
            fn = keychain;
            keychain = scope;
            scope = 'all';
        }

        var normalized = normalizeKeyChain(keychain);
        fn._original = keychain;
        assignKey(scope, normalized, fn);
    };


    keymage.bindings = {all: {}};
    keymage.setScope = function(scope) {
        currentScope = scope;
    };
    keymage.getScope = function() { return currentScope; };


    window.addEventListener('keydown', dispatch, false);
    return keymage;
})(this,
   (typeof module !== 'undefined' && module.exports ? module.exports : this));
