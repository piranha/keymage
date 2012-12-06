# keymage.js

Keymage is a small library for handling key bindings in JavaScript.

It was written out of the fact that no other library supported combination of
all necessary features and their design made it easier to write a new one.

[Test results](http://htmlpreview.github.com/?http://github.com/piranha/keymage/blob/master/test/test.html).

## Features

 - Simple language for defining bindings
 - Key sequences (a-la Emacs chords)
 - Nested scopes
 - Default modifier (`defmod` key which is `command` on OS X and `control`
   elsewhere)


## Usage

Include `keymage.min.js` in your page:

```html
<script src="keymage.min.js"></script>
```

There are no dependencies. TODO: make it possible to use the library as an AMD
module.


## Defining shortcuts

Keymage exposes a single function, `keymage`:

```javascript
// bind on 'a'
keymage('a', function() { alert("You pressed 'a'"); });

// returning false prevents default browser reaction (you can always use
// e.preventDefault(), of course)
keymage('ctrl-e', function() { return false; });

// binding on 'defmod' binds on Command key on OS X and on Control key in other
// systems
keymage('defmod-j', function() { alert("I am fired"); });
```

Handler function receives two arguments: the original event and the context so
you can understand what and why was fired.

The context contains those properties:

 - `shortcut` is a string you've originally provided for binding
 - `scope` is a scope which is currently active
 - `definitionScope` is a scope where this shortcut was defined

```javascript
keymage('alt-c', function(e, ctx) {
    console.log(ctx.shortcut, ctx.scope, ctx.definitionScope);
});

// -> "alt-c", "", ""
```


## Sequences

Keymage supports key sequences:

```javascript
keymage('ctrl-j k', function() { alert("Nice!"); });
```

For this to fire you have to first press both `ctrl` and `j`, and then `k`.


## Scopes

Keymage support nested scopes. This means that your application can have few
areas where you can gradually have more and more specific shortcuts. It works
like this:

```javascript
// You can skip scope argument if you want global work-always shortcut
keymage('ctrl-j q', function() { alert("Default scope"); });

// This will fire after "keymage.setScope('chat')"
keymage('chat', 'ctrl-j w', function() { alert("Chat scope"); });

// This will fire after "keymage.setScope('chat.input')"
keymage('chat.input', 'ctrl-j e', function() { alert("Chat.input scope"); });
```

You can control scopes with helpful `pushScope` and `popScope` methods. This way
your nested view (or whatever is enabling nested scope) doesn't need to know
about parent scope:

```javascript
keymage.pushScope('chat') // scope is 'chat'

keymage.pushScope('input') // scope is 'chat.input'

keymage.popScope() // scope is 'chat'

keymage.pushScope('deep')
keymage.pushScope('deeper') // scope is 'chat.deep.deeper'

// way to jump out of deep scoping
keymage.popScope('chat') // scope is ''
```

`pushScope` returns resulting scope and `popScope` returns topmost scope it
removed (so with parameters it's the one you've asked to remove).

Note that calling `popScope` with name of a scope which is repeated few times
will pop topmost one, i.e.:

```javascript
keymage.setScope('this.scope.is.deep.scope')
keymage.popScope('scope') // scope is 'this'
```
