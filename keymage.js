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
        'shift': 'shiftKey',
        'ctrl': 'ctrlKey', 'control': 'ctrlKey',
        'alt': 'altKey', 'option': 'altKey',
        'win': 'metaKey', 'cmd': 'metaKey', 'super': 'metaKey',
                          'meta': 'metaKey',
        // default modifier for os x is cmd and for others is ctrl
        'defmod': ~navigator.userAgent.indexOf('Mac OS X') ?
            'metaKey' : 'ctrlKey'
        };

    var KEYS = {
        'backspace': 8,
        'tab': 9,
        'enter': 13, 'return': 13,
        'pause': 19,
        'caps': 20, 'caps-lock': 20,
        'escape': 27, 'esc': 27,
        'space': 32,
        'pgup': 33, 'page-up': 33,
        'pgdown': 34, 'page-down': 34,
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


    // -----------------------
    // Actual work is done here

    var STATE = {
        MATCH: 1,
        PARTIAL: 2,
        INTERRUPT: 3
    };

    function parseKeystring(keystring) {
        var keychain = [];
        var combs = keystring.split(' ');

        var keySplit, keyInfo, key, keyCode, mod;
        for (var i = 0; i < combs.length; i++) {
            keySplit = combs[i].split('-');

            key = keySplit[keySplit.length - 1];
            keyInfo = {keyCode: KEYS[key]};

            if (!keyInfo.keyCode) {
                throw 'Unknown key "' + key + '" in keystring "' +
                    keystring + '"';
            }

            for (var j = 0; j < keySplit.length - 1; j++) {
                key = keySplit[j];
                mod = MODS[key];
                if (!mod) {
                    throw 'Unknown modifier "' + key + '" in keystring "' +
                        keystring + '"';
                }
                keyInfo[mod] = true;
            }

            keychain.push(keyInfo);
        }

        keychain.original = keystring;
        return keychain;
    }

    function eventInfo(e) {
        var info = {keyCode: e.keyCode};
        for (var i = 0; i < MODPROPS.length; i++) {
            if (e[MODPROPS[i]]) {
                info[MODPROPS[i]] = true;
            }
        }
        return info;
    }

    function infoEqual(i1, i2) {
        var k;
        var eq = true;

        for (k in i1) {
            eq = eq && i1[k] == i2[k];
        }

        for (k in i2) {
            eq = eq && i2[k] == i1[k];
        }

        return eq;
    }

    function KeyMage(keystrings, options) {
        // _bind(this.handler, this);

        this.chains = [];
        this.handlers = [];
        this.seq = [];

        for (var i = 0; i < keystrings.length; i++) {
            this.chains.push(parseKeystring(keystrings[i]));
        }

        if (options.global) {
            this.global();
        }
    }

    KeyMage.prototype = {
        add: function(fn, context) {
            this.handlers.push([fn, context]);
        },

        remove: function(fn) {
            for (var i = 0; i < this.handlers.length; i++) {
                if (this.handlers[i][0] === fn) {
                    this.handlers.splice(i, 1);
                    break;
                }
            }
        },

        global: function() {
            document.addEventListener('keydown', this.handler.bind(this),
                                      false);
        },

        handler: function(e) {
            var info = eventInfo(e);
            var seq = this.seq.slice();
            seq.push(info);
            var chain;
            var state = STATE.MATCH;

            for (var i = 0; i < this.chains.length; i++) {
                chain = this.chains[i];

                state = STATE.MATCH;
                for (var j = 0; j < seq.length; j++) {
                    if (!infoEqual(seq[j], chain[j])) {
                        state = STATE.INTERRUPT;
                        break;
                    }
                }

                if (state !== STATE.INTERRUPT) {
                    // If we've got a match, but sequence is smaller than chain,
                    // this is not a real match. But sequence needs to be
                    // updated.
                    if (seq.length < chain.length) {
                        state = STATE.PARTIAL;
                        this.seq = seq;
                    }

                    // By breaking in any case here we explicitly have no
                    // possibility to support chain which is part of other
                    // chain.
                    break;
                }
            }

            switch (state) {
            case STATE.INTERRUPT:
                this.seq = [];
                break;
            case STATE.PARTIAL:
                break;
            case STATE.MATCH:
                this.seq = [];
                for (i = 0; i < this.handlers.length; i++) {
                    var handler = this.handlers[i];
                    var res = handler[0].call(handler[1], e, chain.original);
                    if (res === false) {
                        e.preventDefault();
                    }
                }
            }
        }
    };

    var keymage = exports.keymage = function(keystrings, fn, options) {
        if (typeof keystrings === 'string') {
            keystrings = [keystrings];
        }

        if (options === undefined && typeof fn === 'object') {
            options = fn;
            fn = null;
        }

        if (typeof keystrings === 'object' && !Array.isArray(keystrings)) {
            var mages = [];
            for (var k in keystrings) {
                mages.push(new KeyMage(k, options).add(keystrings[k]));
            }
            return mages;
        } else {
            var mage = new KeyMage(keystrings, options);
            if (fn) {
                mage.add(fn);
            }
            return mage;
        }
    };

    keymage.KEYS = KEYS;

    return keymage;

})(this,
   (typeof module !== 'undefined' && module.exports ? module.exports : this));
