(()=>{var t={506:t=>{t.exports=function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}},926:t=>{function e(t,e,n,r,o,i,a){try{var c=t[i](a),u=c.value}catch(t){return void n(t)}c.done?e(u):Promise.resolve(u).then(r,o)}t.exports=function(t){return function(){var n=this,r=arguments;return new Promise((function(o,i){var a=t.apply(n,r);function c(t){e(a,o,i,c,u,"next",t)}function u(t){e(a,o,i,c,u,"throw",t)}c(void 0)}))}}},575:t=>{t.exports=function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}},913:t=>{function e(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}t.exports=function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}},754:t=>{function e(n){return t.exports=e=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)},e(n)}t.exports=e},205:(t,e,n)=>{var r=n(489);t.exports=function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&r(t,e)}},585:(t,e,n)=>{var r=n(8),o=n(506);t.exports=function(t,e){return!e||"object"!==r(e)&&"function"!=typeof e?o(t):e}},489:t=>{function e(n,r){return t.exports=e=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t},e(n,r)}t.exports=e},8:t=>{function e(n){return"function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?t.exports=e=function(t){return typeof t}:t.exports=e=function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},e(n)}t.exports=e},553:t=>{var e=function(t){"use strict";var e,n=Object.prototype,r=n.hasOwnProperty,o="function"==typeof Symbol?Symbol:{},i=o.iterator||"@@iterator",a=o.asyncIterator||"@@asyncIterator",c=o.toStringTag||"@@toStringTag";function u(t,e,n){return Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}),t[e]}try{u({},"")}catch(t){u=function(t,e,n){return t[e]=n}}function l(t,e,n,r){var o=e&&e.prototype instanceof m?e:m,i=Object.create(o.prototype),a=new _(r||[]);return i._invoke=function(t,e,n){var r=s;return function(o,i){if(r===d)throw new Error("Generator is already running");if(r===v){if("throw"===o)throw i;return j()}for(n.method=o,n.arg=i;;){var a=n.delegate;if(a){var c=L(a,n);if(c){if(c===p)continue;return c}}if("next"===n.method)n.sent=n._sent=n.arg;else if("throw"===n.method){if(r===s)throw r=v,n.arg;n.dispatchException(n.arg)}else"return"===n.method&&n.abrupt("return",n.arg);r=d;var u=h(t,e,n);if("normal"===u.type){if(r=n.done?v:f,u.arg===p)continue;return{value:u.arg,done:n.done}}"throw"===u.type&&(r=v,n.method="throw",n.arg=u.arg)}}}(t,n,a),i}function h(t,e,n){try{return{type:"normal",arg:t.call(e,n)}}catch(t){return{type:"throw",arg:t}}}t.wrap=l;var s="suspendedStart",f="suspendedYield",d="executing",v="completed",p={};function m(){}function y(){}function g(){}var b={};b[i]=function(){return this};var E=Object.getPrototypeOf,w=E&&E(E(F([])));w&&w!==n&&r.call(w,i)&&(b=w);var x=g.prototype=m.prototype=Object.create(b);function k(t){["next","throw","return"].forEach((function(e){u(t,e,(function(t){return this._invoke(e,t)}))}))}function P(t,e){function n(o,i,a,c){var u=h(t[o],t,i);if("throw"!==u.type){var l=u.arg,s=l.value;return s&&"object"==typeof s&&r.call(s,"__await")?e.resolve(s.__await).then((function(t){n("next",t,a,c)}),(function(t){n("throw",t,a,c)})):e.resolve(s).then((function(t){l.value=t,a(l)}),(function(t){return n("throw",t,a,c)}))}c(u.arg)}var o;this._invoke=function(t,r){function i(){return new e((function(e,o){n(t,r,e,o)}))}return o=o?o.then(i,i):i()}}function L(t,n){var r=t.iterator[n.method];if(r===e){if(n.delegate=null,"throw"===n.method){if(t.iterator.return&&(n.method="return",n.arg=e,L(t,n),"throw"===n.method))return p;n.method="throw",n.arg=new TypeError("The iterator does not provide a 'throw' method")}return p}var o=h(r,t.iterator,n.arg);if("throw"===o.type)return n.method="throw",n.arg=o.arg,n.delegate=null,p;var i=o.arg;return i?i.done?(n[t.resultName]=i.value,n.next=t.nextLoc,"return"!==n.method&&(n.method="next",n.arg=e),n.delegate=null,p):i:(n.method="throw",n.arg=new TypeError("iterator result is not an object"),n.delegate=null,p)}function O(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function S(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function _(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(O,this),this.reset(!0)}function F(t){if(t){var n=t[i];if(n)return n.call(t);if("function"==typeof t.next)return t;if(!isNaN(t.length)){var o=-1,a=function n(){for(;++o<t.length;)if(r.call(t,o))return n.value=t[o],n.done=!1,n;return n.value=e,n.done=!0,n};return a.next=a}}return{next:j}}function j(){return{value:e,done:!0}}return y.prototype=x.constructor=g,g.constructor=y,y.displayName=u(g,c,"GeneratorFunction"),t.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===y||"GeneratorFunction"===(e.displayName||e.name))},t.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,g):(t.__proto__=g,u(t,c,"GeneratorFunction")),t.prototype=Object.create(x),t},t.awrap=function(t){return{__await:t}},k(P.prototype),P.prototype[a]=function(){return this},t.AsyncIterator=P,t.async=function(e,n,r,o,i){void 0===i&&(i=Promise);var a=new P(l(e,n,r,o),i);return t.isGeneratorFunction(n)?a:a.next().then((function(t){return t.done?t.value:a.next()}))},k(x),u(x,c,"Generator"),x[i]=function(){return this},x.toString=function(){return"[object Generator]"},t.keys=function(t){var e=[];for(var n in t)e.push(n);return e.reverse(),function n(){for(;e.length;){var r=e.pop();if(r in t)return n.value=r,n.done=!1,n}return n.done=!0,n}},t.values=F,_.prototype={constructor:_,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=e,this.done=!1,this.delegate=null,this.method="next",this.arg=e,this.tryEntries.forEach(S),!t)for(var n in this)"t"===n.charAt(0)&&r.call(this,n)&&!isNaN(+n.slice(1))&&(this[n]=e)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(t){if(this.done)throw t;var n=this;function o(r,o){return c.type="throw",c.arg=t,n.next=r,o&&(n.method="next",n.arg=e),!!o}for(var i=this.tryEntries.length-1;i>=0;--i){var a=this.tryEntries[i],c=a.completion;if("root"===a.tryLoc)return o("end");if(a.tryLoc<=this.prev){var u=r.call(a,"catchLoc"),l=r.call(a,"finallyLoc");if(u&&l){if(this.prev<a.catchLoc)return o(a.catchLoc,!0);if(this.prev<a.finallyLoc)return o(a.finallyLoc)}else if(u){if(this.prev<a.catchLoc)return o(a.catchLoc,!0)}else{if(!l)throw new Error("try statement without catch or finally");if(this.prev<a.finallyLoc)return o(a.finallyLoc)}}}},abrupt:function(t,e){for(var n=this.tryEntries.length-1;n>=0;--n){var o=this.tryEntries[n];if(o.tryLoc<=this.prev&&r.call(o,"finallyLoc")&&this.prev<o.finallyLoc){var i=o;break}}i&&("break"===t||"continue"===t)&&i.tryLoc<=e&&e<=i.finallyLoc&&(i=null);var a=i?i.completion:{};return a.type=t,a.arg=e,i?(this.method="next",this.next=i.finallyLoc,p):this.complete(a)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),p},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var n=this.tryEntries[e];if(n.finallyLoc===t)return this.complete(n.completion,n.afterLoc),S(n),p}},catch:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var n=this.tryEntries[e];if(n.tryLoc===t){var r=n.completion;if("throw"===r.type){var o=r.arg;S(n)}return o}}throw new Error("illegal catch attempt")},delegateYield:function(t,n,r){return this.delegate={iterator:F(t),resultName:n,nextLoc:r},"next"===this.method&&(this.arg=e),p}},t}(t.exports);try{regeneratorRuntime=e}catch(t){Function("r","regeneratorRuntime = r")(e)}},757:(t,e,n)=>{t.exports=n(553)}},e={};function n(r){if(e[r])return e[r].exports;var o=e[r]={exports:{}};return t[r](o,o.exports,n),o.exports}n.n=t=>{var e=t&&t.__esModule?()=>t.default:()=>t;return n.d(e,{a:e}),e},n.d=(t,e)=>{for(var r in e)n.o(e,r)&&!n.o(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:e[r]})},n.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),(()=>{"use strict";var t=n(757),e=n.n(t),r=n(926),o=n.n(r),i=n(575),a=n.n(i),c=n(913),u=n.n(c),l=n(205),h=n.n(l),s=n(585),f=n.n(s),d=n(754),v=n.n(d),p=function(){function t(e,n){var r,o,i,c;a()(this,t),this.config=void 0,this.htmlElement=void 0,this.name=void 0,this.io=void 0,this.fetch=void 0,this.behavior=void 0,this.config=e,this.io=null!==(r=this.config.io)&&void 0!==r?r:{},this.fetch=null!==(o=this.config.fetch)&&void 0!==o?o:{},this.behavior=null!==(i=this.config.behavior)&&void 0!==i?i:{};var u=null!==(c=this.io.event)&&void 0!==c?c:t.defaultConfig.io.event;if(this.htmlElement=n.htmlElement.querySelectorAll("[name=".concat(e.name,"]")),this.name=this.htmlElement[0].name,0===this.htmlElement.length)throw new Error("Element ".concat(e.name," not found"));1===this.htmlElement.length?(this.htmlElement=this.htmlElement[0],this.htmlElement.addEventListener(u,(function(t){n.notify(t.target.name)}))):this.htmlElement.forEach((function(t){t.addEventListener(u,(function(t){n.notify(t.target.name)}))}))}var n;return u()(t,[{key:"get",value:function(){return this.io.get?this.io.get(this.htmlElement):this.htmlElement.value}},{key:"set",value:function(t){return this.io.set?this.io.set(this.htmlElement,t):this.htmlElement.value=t}},{key:"clear",value:function(){if(this.behavior.clear)return this.behavior.clear(this.htmlElement);this.htmlElement.value=""}},{key:"update",value:(n=o()(e().mark((function t(n,r){return e().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:!1!==this.beforeUpdate(n,r)&&this.updateStatus(n,r),this.afterUpdate(n,r);case 3:case"end":return t.stop()}}),t,this)}))),function(t,e){return n.apply(this,arguments)})},{key:"beforeUpdate",value:function(t,e){return!this.behavior.beforeUpdate||this.behavior.beforeUpdate(this.htmlElement,t,e)}},{key:"updateStatus",value:function(t,e){if(this.behavior.updateStatus)return this.behavior.updateStatus(this.htmlElement,t,e)}},{key:"afterUpdate",value:function(t,e){if(this.behavior.afterUpdate)return this.behavior.afterUpdate(this.htmlElement,t,e)}}]),t}();p.defaultConfig={io:{event:"change"}};const m=p;function y(t){var e=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(t){return!1}}();return function(){var n,r=v()(t);if(e){var o=v()(this).constructor;n=Reflect.construct(r,arguments,o)}else n=r.apply(this,arguments);return f()(this,n)}}var g=function(t){h()(n,t);var e=y(n);function n(t,r){var o,i,c;return a()(this,n),(c=e.call(this,t,r)).method=void 0,c.dropdown=void 0,c.method=null!==(o=c.fetch.method)&&void 0!==o?o:n.defaultConfig.fetch.method,c.dropdown=null!==(i=c.config.dropdown)&&void 0!==i?i:{},c}return u()(n,[{key:"clear",value:function(){if(this.behavior.clear)return this.behavior.clear(this.htmlElement);for(var t=this.htmlElement.getElementsByTagName("option"),e=t.length-1;e>=0;e--){var n=t[e].value;null!=n&&""!=n.trim()&&(this.htmlElement.options[e]=null)}}},{key:"beforeUpdate",value:function(t,e){if(this.behavior.beforeUpdate)return this.behavior.beforeUpdate(this.htmlElement,t,e);if(e&&!t[e]&&!0===(void 0!==this.dropdown.clearOnParentVoid?this.dropdown.clearOnParentVoid:n.defaultConfig.dropdown.clearOnParentVoid))return this.clear(),!1;return!0}},{key:"updateStatus",value:function(t,e){var n=this;if(this.behavior.updateStatus)return this.behavior.updateStatus(this.htmlElement,t,e);var r=this.fetch.makeUrl(t),o=null;if(this.fetch.fullFetchConfig)o=this.fetch.fullFetchConfig;else{(o={}).method=this.method;var i=this.fetch.makeBody?this.fetch.makeBody(t):null;i&&(o.body=i)}return fetch(r,o).then((function(t){if(t.ok)return t.json();throw t})).then((function(t){return n.postProcessData(t)})).then((function(t){return n.saveData(t)})).catch((function(t){console.error(t)}))}},{key:"postProcessData",value:function(t){return this.dropdown.postProcessData?this.dropdown.postProcessData(this.htmlElement,t):t}},{key:"saveData",value:function(t){var e=this;if(this.dropdown.saveData)return this.dropdown.saveData(this.htmlElement,t);if(this.clear(),!this.htmlElement.querySelector('option:not([value]), option[value=""]')){var n=document.createElement("option");n.text="",n.value="",this.htmlElement.add(n)}return t.forEach((function(t){var n=document.createElement("option");n.text=t.text,n.value=t.value,e.htmlElement.add(n)})),t}}]),n}(m);g.defaultConfig={io:{event:"change"},fetch:{method:"GET"},dropdown:{clearOnParentVoid:!0}};const b=g;function E(t){var e=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(t){return!1}}();return function(){var n,r=v()(t);if(e){var o=v()(this).constructor;n=Reflect.construct(r,arguments,o)}else n=r.apply(this,arguments);return f()(this,n)}}var w=function(t){h()(n,t);var e=E(n);function n(t,r){var o,i;return a()(this,n),(i=e.call(this,t,r)).checkbox=void 0,i.checkbox=null!==(o=i.config.checkbox)&&void 0!==o?o:{},i}return u()(n,[{key:"get",value:function(){return this.io.get?this.io.get(this.htmlElement):!0===(void 0!==this.checkbox.booleanValue?this.checkbox.booleanValue:n.defaultConfig.checkbox.booleanValue)?this.htmlElement.checked:this.htmlElement.value}},{key:"set",value:function(t){return this.io.set?this.io.set(this.htmlElement,t):this.htmlElement.checked=t}},{key:"clear",value:function(){if(this.behavior.clear)return this.behavior.clear(this.htmlElement);this.set(!1)}}]),n}(m);w.defaultConfig={io:{event:"change"},checkbox:{booleanValue:!0}};const x=w;function k(t){var e=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(t){return!1}}();return function(){var n,r=v()(t);if(e){var o=v()(this).constructor;n=Reflect.construct(r,arguments,o)}else n=r.apply(this,arguments);return f()(this,n)}}const P=function(t){h()(n,t);var e=k(n);function n(t,r){return a()(this,n),e.call(this,t,r)}return u()(n,[{key:"get",value:function(){if(this.io.get)return this.io.get(this.htmlElement);for(var t=0;t<this.htmlElement.length;t++){var e=this.htmlElement[t];if(!0===e.checked)return e.value}return null}},{key:"set",value:function(t){if(this.io.set)return this.io.set(this.htmlElement,t);for(var e=0;e<this.htmlElement.length;e++){var n=this.htmlElement[e];if(n.value===t)return void(n.checked=!0);n.checked=!1}}},{key:"clear",value:function(){if(this.behavior.clear)return this.behavior.clear(this.htmlElement);for(var t=0;t<this.htmlElement.length;t++)this.htmlElement[t].checked=!1}}]),n}(m);const L=function(){function t(e){var n,r,o,i=this;a()(this,t),this.id=void 0,this.debug=void 0,this.behavior=void 0,this.fields=void 0,this.rules=void 0,this.init=void 0,this.config=void 0,this.htmlElement=void 0,this.enabled=void 0,this.elementToClassMapping={default:m,checkbox:x,radio:P,"select-one":b,"select-multiple":b};var c=this;c.id=e.id,c.config=e,c.htmlElement=document.forms[e.id],c.fields=new Map,c.rules=null!==(n=e.rules)&&void 0!==n?n:[],c.init=null!==(r=e.int)&&void 0!==r?r:[],c.debug=!0===e.debug,c.enabled=!0,c.behavior=null!==(o=e.behavior)&&void 0!==o?o:{},e.fields.forEach((function(t){var e,n=c.htmlElement.querySelectorAll("[name=".concat(t.name,"]")),r=null;if(0===n.length)throw new Error("Element ".concat(t.name," not found"));null!=(r=(n.length,n[0].type))&&i.elementToClassMapping[r]||(r="default"),e=new i.elementToClassMapping[r](t,c),i.fields.set(e.name,e)})),e.init.forEach((function(t){var e=t.name,n=i.fetchAllParameters(t);c.manualUpdate(n,e)}))}var n,r;return u()(t,[{key:"notify",value:function(t){var e=this;if(!1!==this.isEnabled()){this.getField(t).get();this.debug&&console.log("-\n".concat(new Date,"\n> [").concat(t,"] Changed. Notifying observers...\n-"));var n=null;this.behavior.beforeUpdate&&(n=this.behavior.beforeUpdate(t));var r=[];!1!==n&&this.rules.filter((function(e){return e.name===t})).forEach((function(n){var o=e.fetchAllParameters(n);n.update.forEach((function(n){if(n!==t){e.debug&&(console.log("> > [".concat(t,"] ==update==> [").concat(e.getField(n).name,"]")),console.log("Parameters:",o));var i=e.getField(n).update(o,t);r.push(i),e.clearCascade(n)}}))})),this.behavior.afterUpdate&&Promise.allSettled(r).then((function(n){e.behavior.afterUpdate(t)}))}}},{key:"fetchAllParameters",value:function(t){var e=this,n=t.name,r=this.getField(n).get(),o={};if(o[n]=r,t.additionalData&&t.additionalData.forEach((function(t){o[t]=e.getField(t).get()})),t.externalData){var i=t.externalData(o,n);Object.assign(o,i)}return o}},{key:"clearCascade",value:(r=o()(e().mark((function t(n){var r,o=this,i=arguments;return e().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:(r=i.length>1&&void 0!==i[1]?i[1]:[]).push(n),this.rules.filter((function(t){return t.name===n})).forEach((function(t){t.update.forEach((function(t){r.includes(t)||(o.debug&&console.log("> > > [".concat(n,"] ==x==> [").concat(o.getField(t).name,"]")),o.getField(t).clear(o.getField(t)),o.clearCascade(t,r))}))}));case 3:case"end":return t.stop()}}),t,this)}))),function(t){return r.apply(this,arguments)})},{key:"manualUpdate",value:(n=o()(e().mark((function t(n,r){return e().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.abrupt("return",this.getField(r).update(n,null));case 1:case"end":return t.stop()}}),t,this)}))),function(t,e){return n.apply(this,arguments)})},{key:"getField",value:function(t){return this.fields.get(t)}},{key:"getId",value:function(){return this.id}},{key:"setEnabled",value:function(t){this.enabled=!!t,this.debug&&console.log("Form enabled: ".concat(this.enabled))}},{key:"isEnabled",value:function(){return!!this.enabled}}]),t}();var O=function(){var t=new Map;function e(){console.info("DynamicForms! Developed with ❤ by simomosi - Ping me @ https://github.com/simomosi/dynamic-forms")}return e(),{makeForm:function(e){var n=new L(e);return t.set(n.getId(),n),n},getForm:function(e){return t.get(e)},author:e}}();window.dynamicForms=O})()})();
//# sourceMappingURL=dynamicforms.js.map