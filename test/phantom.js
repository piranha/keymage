var page=new WebPage;page.open(phantom.args[0]||"about:blank",function(){page.evaluate(function(){// https://github.com/WebReflection/wru
function wru(wru){

var MODS = ['ctrl', 'shift', 'alt', 'meta'];
function fire(key) {
    var e = document.createEvent('Event');

    if (typeof key === 'string') {
        key = keymage.parse(key);
    }

    e.initEvent('keydown', true, true);
    e.keyCode = key.code;
    for (var i = 0; i < MODS.length; i++) {
        var mod = MODS[i];
        if (key[mod]) {
            e[mod + 'Key'] = true;
        }
    }
    document.dispatchEvent(e);
}

wru.test([
    {
        name: "without async nothing works!",
        test: function () {
            setTimeout(wru.async(function () {
                wru.assert("called");
            }), 500);
        }
    },
    {name: 'Single shortcut',
     test: function() {
         var count = 0;
         keymage('a', function() { count++; });

         fire({code: 65});
         wru.assert('pressed', count === 1);

         fire({code: 65});
         wru.assert('pressed', count === 2);

         keymage('ctrl-alt--', function() { count--; });
         fire({code: 189, ctrl: true, alt: true});
         wru.assert('pressed', count === 1);
     }},
    {name: 'Sequence',
     test: function() {
         var count = 0;
         keymage('ctrl-a a', function() { count++; });

         fire({code: 65, ctrl: true}); fire({code: 65});
         wru.assert('Sequence works', count === 1);

         // failing attempts
         fire({code: 65, ctrl: true}); fire({code: 66});
         fire({code: 65, ctrl: true}); fire({code: 65, ctrl: true}); fire({code: 65});
         wru.assert('C-a b & C-a C-a a - do not trigger sequence', count === 1);

         // still works
         fire({code: 65, ctrl: true}); fire({code: 65});
         wru.assert('But it still works', count === 2);
     }},

    {name: 'Scopes',
     test: function() {
         var count = 0;
         var handler = function() { count++; };
         keymage('ctrl-a a', handler);
         keymage('chat', 'ctrl-a b', handler);
         keymage('chat.input', 'ctrl-a c', handler);

         keymage.pushScope('chat');
         fire({code: 65, ctrl: true}); fire({code: 65});
         wru.assert('C-a a - triggers, chat scope', count === 1);
         fire({code: 65, ctrl: true}); fire({code: 66});
         wru.assert('C-a b - triggers, chat scope', count === 2);
         fire({code: 65, ctrl: true}); fire({code: 67});
         wru.assert('C-a c - does not trigger, chat scope', count === 2);

         keymage.pushScope('input');
         fire({code: 65, ctrl: true}); fire({code: 67});
         wru.assert('C-a c - triggers, chat.input scope', count === 3);

         keymage.popScope('chat');
         fire({code: 65, ctrl: true}); fire({code: 65});
         wru.assert('C-a a - triggers, no scope', count === 4);
         fire({code: 65, ctrl: true}); fire({code: 66});
         wru.assert('C-a b - does not trigger, no scope', count === 4);

         keymage.pushScope('loading');
         keymage.popScope();
         wru.assert('popScope works', keymage.getScope() === '');
     }}
]);



}





// wru related code
window.phantomExit=false;window.quit=function(){window.phantomExit=true};window.require=function(){return{wru:window.wru}};window.global=window;
/*!
(C) Andrea Giammarchi, @WebReflection - Mit Style License
*/
if(typeof global!="undefined"){var setTimeout=global.setTimeout,setInterval=global.setInterval,clearInterval=global.clearInterval,clearTimeout=global.clearTimeout;setTimeout||(function(h,c,g,a){setInterval=global.setInterval=function b(j,i){return e(j,i,g.call(arguments,2),1)};setTimeout=global.setTimeout=function d(j,i){return e(j,i,g.call(arguments,2))};clearInterval=global.clearInterval=clearTimeout=global.clearTimeout=function f(i){c[i].cancel();h.purge();delete c[i]};function e(l,k,j,i){var m=++a;c[m]=new JavaAdapter(java.util.TimerTask,{run:function(){l.apply(null,j)}});i?h.schedule(c[m],k,k):h.schedule(c[m],k);return m}})(new java.util.Timer(),{},[].slice,0)}else{!function(c,b,a,e){function d(f,g){var h=new Date;while(new Date-h<g){}f.apply(null,e.call(arguments,2))}e=a.slice;c.setTimeout=c.setInterval=d;c.clearInterval=c.clearTimeout=function(){}}(this,0,[])}wru(function(U){function h(){w=F.call(j);if(w){if(typeof w=="function"){w={name:w[O]||"anonymous",test:w}}l(Z);l((ad(w,O)&&w[O])||(ad(w,e)&&w[e])||L);a=[];q=[];P=[];X={};b("setup");P[ae]||b("test");I||n()}else{p()}}function l(ah,ag){ah=ah+(ag?"":"\n");try{process.stdout.write(ah)}catch(af){try{require("util").print(ah)}catch(af){try{require("sys").print(ah)}catch(af){try{java.lang.System.out.print(ah)}catch(af){try{console.log(ah)}catch(af){print(ah)}}}}}}function p(){var ah=0,ag;l(g);l(Z);switch(true){case !!aa:ah++;ag="error";l(N+"   "+aa+" Errors");break;case !!z:ah++;ag="fail";l(J+g+z+" Failures");break;default:ag="pass";l(y+"      "+o+" Passes")}V.status=ag;l(Z);l(g);V.after();try{process.exit(ah)}catch(af){quit()}}function c(af){for(var ag=0,ah=af[ae];ag<ah;l("    "+(++ag)+". "+af[ag-1])){}}function n(){f();o+=a[ae];z+=q[ae];aa+=P[ae];if(P[ae]){S=N;c(P)}else{if(q[ae]){S=J;c(q)}else{S=y}}l(S+" passes: "+a[ae]+", fails: "+q[ae]+", errors: "+P[ae]);H=0;S=g;h()}function b(af){if(ad(w,af)){try{w[af](X)}catch(ag){W.call(P,g+ag)}}}function ad(ag,af){return m.call(ag,af)}function s(){return B()<0.5?-1:1}function f(){if(M){C(M);M=0}b("teardown")}var V={timeout:u,assert:function Q(ag,af){if(arguments[ae]==1){af=ag;ag=L}v=D;W.call(af?a:q,S+ag);return af},async:function R(ah,ak,ai,aj){var af=ai||V.timeout||(V.timeout=u);aj=++I;if(typeof ah=="function"){af=ak||V.timeout;ak=ah;ah="asynchronous test #"+aj}ai=T(function(){aj=0;W.call(q,ah);--I||(M=T(n,0))},G(af)||V.timeout);return function ag(){if(!aj){return}v=ab;S=ah+": ";try{ak.apply(this,arguments)}catch(al){v=D;W.call(P,S+al)}S=g;if(v){C(ai);--I||(M=T(n,0))}}},test:function k(af,ag){V.after=ag||function(){};j=E.apply(j,[af]);V.random&&ac.call(j,s);I||h()}},D=true,ab=!D,u=100,g=" ",L="unknown",ae="length",O="name",e="description",A="<li>",d="</li>",i="\\|/-",m=V.hasOwnProperty,S=g,Y=S.charAt,t=S.slice,j=[],E=j.concat,r=j.join,W=j.push,F=j.shift,ac=j.sort,I=0,H=0,o=0,z=0,aa=0,M=0,N="\x1B[1;31mERROR\x1B[0m",J="\x1B[0;31mFAILURE\x1B[0m",y="\x1B[0;32mOK\x1B[0m",Z="------------------------------",x,G,B,T,C,w,K,a,q,P,X,v;V.log=function(ah,ag){try{if(ag){throw new Error}console.log(ah)}catch(af){l(ah,0)}};if(typeof __dirname!="undefined"){U.wru=V;U.assert=V.assert;U.async=V.async;U.test=V.test;U.log=V.log;U.random=false;Object.defineProperty(U,"status",{get:function(){return V.status}});Object.defineProperty(U,"timeout",{get:function(){return V.timeout},set:function(af){V.timeout=parseInt(af,10)||V.timeout}});U=global}x=U.Math;G=x.abs;B=x.random;T=U.setTimeout;C=U.clearTimeout;U.setInterval(function(){I&&l(g+Y.call(i,H++%4)+"\b\b",true)},u);undefined;u*=u;V.random=ab;return V}(this));
});page.onConsoleMessage=function(msg){if (!/^s+(?:\\|\/|\||\-)/.test(msg))console.log(msg.replace("\n",""))};setInterval(function(){page.evaluate(function(){return window.phantomExit})&&phantom.exit()})});
