var system = require('system');
var page = new WebPage;

page.onConsoleMessage = function(msg) {
    // cursor removed from phantomjs
    if (!/^\s+(?:\\|\/|\||\-)/.test(msg)) {
        console.log(msg.replace("\n", ""));
    }
};

page.open('about:blank', function(status) {
    if (status != "success") {
        return phantom.exit();
    }

    page.evaluate(function () {
        window.phantomExit = false;
        window.quit = function () {
            window.phantomExit = true;
        };
        window.require = function () {
            return {wru: window.wru};
        };
        window.global = window;
    });

    page.injectJs('keymage.js');
    page.injectJs("test/vendor/wru.console.max.js");
    page.injectJs("test/test.js");

    setInterval(function () {
        page.evaluate(function () {
            return window.phantomExit;
        }) && phantom.exit();
    }, 50);
});
