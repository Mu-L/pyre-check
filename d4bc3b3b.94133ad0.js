(window.webpackJsonp=window.webpackJsonp||[]).push([[19],{100:function(e,n,t){"use strict";t.d(n,"b",(function(){return r})),t.d(n,"a",(function(){return o}));var a=t(22),i=t(102);function r(){var e=Object(a.default)().siteConfig,n=(e=void 0===e?{}:e).baseUrl,t=void 0===n?"/":n,r=e.url;return{withBaseUrl:function(e,n){return function(e,n,t,a){var r=void 0===a?{}:a,o=r.forcePrependBaseUrl,s=void 0!==o&&o,c=r.absolute,l=void 0!==c&&c;if(!t)return t;if(t.startsWith("#"))return t;if(Object(i.b)(t))return t;if(s)return n+t;var u=t.startsWith(n)?t:n+t.replace(/^\//,"");return l?e+u:u}(r,t,e,n)}}}function o(e,n){return void 0===n&&(n={}),(0,r().withBaseUrl)(e,n)}},102:function(e,n,t){"use strict";function a(e){return!0===/^(\w*:|\/\/)/.test(e)}function i(e){return void 0!==e&&!a(e)}t.d(n,"b",(function(){return a})),t.d(n,"a",(function(){return i}))},89:function(e,n,t){"use strict";t.r(n),t.d(n,"frontMatter",(function(){return s})),t.d(n,"metadata",(function(){return c})),t.d(n,"rightToc",(function(){return l})),t.d(n,"default",(function(){return p}));var a=t(3),i=t(7),r=(t(0),t(96)),o=t(100),s={id:"pysa-implementation-details",title:"Implementation Details",sidebar_label:"Implementation Details"},c={unversionedId:"pysa-implementation-details",id:"pysa-implementation-details",isDocsHomePage:!1,title:"Implementation Details",description:"This page covers how Pysa actually tracks the flow of tainted data from source",source:"@site/docs/pysa_implementation_details.md",slug:"/pysa-implementation-details",permalink:"/docs/pysa-implementation-details",editUrl:"https://github.com/facebook/pyre-check/tree/master/documentation/website/docs/pysa_implementation_details.md",version:"current",sidebar_label:"Implementation Details",sidebar:"pysa",previous:{title:"Advanced Topics",permalink:"/docs/pysa-advanced"},next:{title:"Running Pysa",permalink:"/docs/pysa-running"}},l=[{value:"Summaries",id:"summaries",children:[{value:"Iteration",id:"iteration",children:[]},{value:"Source Summaries",id:"source-summaries",children:[]},{value:"Sink Summaries",id:"sink-summaries",children:[]},{value:"Taint In Taint Out (TITO) Summaries",id:"taint-in-taint-out-tito-summaries",children:[]}]},{value:"Emitting Issues",id:"emitting-issues",children:[]},{value:"Visualizing Issues",id:"visualizing-issues",children:[]}],u={rightToc:l};function p(e){var n=e.components,t=Object(i.a)(e,["components"]);return Object(r.b)("wrapper",Object(a.a)({},u,t,{components:n,mdxType:"MDXLayout"}),Object(r.b)("p",null,"This page covers how Pysa actually tracks the flow of tainted data from source\nto sink. These implementation details affect how some functionality of Pysa\nworks, such as source- and sink-specific sanitizers, so it is useful reading\neven for end users who never intend to work on Pysa itself."),Object(r.b)("p",null,"This page is a subset of what is presented in the ",Object(r.b)("a",Object(a.a)({parentName:"p"},{href:"https://youtu.be/8I3zlvtpOww?t=2358"}),"Pysa DEF CON\nTutorial"),". Work through that tutorial for\nan even more complete understanding of how Pysa works."),Object(r.b)("h2",{id:"summaries"},"Summaries"),Object(r.b)("p",null,"Pysa works by computing ",Object(r.b)("em",{parentName:"p"},"summaries")," of all functions. ",Object(r.b)("strong",{parentName:"p"},"Summaries")," describe:"),Object(r.b)("ul",null,Object(r.b)("li",{parentName:"ul"},"Which function arguments hit sinks"),Object(r.b)("li",{parentName:"ul"},"Which sources the function returns"),Object(r.b)("li",{parentName:"ul"},"Which arguments propagate their taint to the return value in some way")),Object(r.b)("p",null,"These summaries cover the entire call graph of the function. Covering the entire\ncall graph means that if ",Object(r.b)("inlineCode",{parentName:"p"},"foo")," calls ",Object(r.b)("inlineCode",{parentName:"p"},"bar"),", ",Object(r.b)("inlineCode",{parentName:"p"},"foo"),"'s summary will include\ninformation on sources and sinks that are reachable in ",Object(r.b)("inlineCode",{parentName:"p"},"bar"),"."),Object(r.b)("h3",{id:"iteration"},"Iteration"),Object(r.b)("p",null,"Pysa's summary inference process is iterative. Summaries must be continually\nrecomputed until a global fixed point is reached. The fixed point occurs when an\nentire iteration is completed without any summary changing. Pysa uses a call\ndependency graph to determine which functions need to be re-analyzed after a\ngiven iteration (ie. if ",Object(r.b)("inlineCode",{parentName:"p"},"foo")," calls ",Object(r.b)("inlineCode",{parentName:"p"},"bar"),", and ",Object(r.b)("inlineCode",{parentName:"p"},"bar"),"'s summary changed last\niteration, ",Object(r.b)("inlineCode",{parentName:"p"},"foo")," must be reanalyzed this iteration to see if it's summary will\nalso change)."),Object(r.b)("h3",{id:"source-summaries"},"Source Summaries"),Object(r.b)("p",null,"The source portion of summaries track how data from a source is eventually\nreturned by a function. To compute the source portion of a summary, Pysa must\nstart with a model such as this one that states ",Object(r.b)("inlineCode",{parentName:"p"},"source")," returns tainted data of\ntype ",Object(r.b)("inlineCode",{parentName:"p"},"UserControlled"),":"),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-python"}),"def source() -> TaintSource[UserControlled]: ...\n")),Object(r.b)("p",null,"Then Pysa can analyze the source code of a function such as ",Object(r.b)("inlineCode",{parentName:"p"},"returns_source")," and\ninfer that it will also return taint of type ",Object(r.b)("inlineCode",{parentName:"p"},"UserControlled"),":"),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-python"}),"def returns_source():\n  return source()\n")),Object(r.b)("p",null,"This inference results in a summary for ",Object(r.b)("inlineCode",{parentName:"p"},"returns_source"),", which we can\nconceptually think of as an inferred model like this:"),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-python"}),"def returns_source() -> TaintSource[UserControlled]: ...\n")),Object(r.b)("p",null,"Pysa's next iteration can start with that summary for ",Object(r.b)("inlineCode",{parentName:"p"},"returns_source"),", and use\nit when anlyzing the code for ",Object(r.b)("inlineCode",{parentName:"p"},"wraps_source"),":"),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-python"}),"def wraps_source():\n  return returns_source()\n")),Object(r.b)("p",null,"From this code, Pysa can infer a model documenting that ",Object(r.b)("inlineCode",{parentName:"p"},"wraps_source")," will also\nend up (indirectly) returning taint of type ",Object(r.b)("inlineCode",{parentName:"p"},"UserControlled"),":"),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-python"}),"def wraps_source() -> TaintSource[UserControlled]\n")),Object(r.b)("h3",{id:"sink-summaries"},"Sink Summaries"),Object(r.b)("p",null,"The sink portion of summaries track how arguments to a function eventually flow\ninto a sink. To compute the sink portion of a summary, Pysa must start with a\nmodel such as this one that states ",Object(r.b)("inlineCode",{parentName:"p"},"sink"),"'s parameter ",Object(r.b)("inlineCode",{parentName:"p"},"arg")," is as an\n",Object(r.b)("inlineCode",{parentName:"p"},"RemoteCodeExecution")," sink:"),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-python"}),"def sink(arg: TaintSink[RemoteCodeExecution]): ...\n")),Object(r.b)("p",null,"Then Pysa can analyze the source code of a function such as ",Object(r.b)("inlineCode",{parentName:"p"},"calls_sink")," and\ninfer that ",Object(r.b)("inlineCode",{parentName:"p"},"calls_sink"),"'s ",Object(r.b)("inlineCode",{parentName:"p"},"arg")," will also end up in a ",Object(r.b)("inlineCode",{parentName:"p"},"RemoteCodeExecution"),"\nsink:"),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-python"}),"def calls_sink(arg):\n  sink(arg)\n")),Object(r.b)("p",null,"This inference results in a summary for ",Object(r.b)("inlineCode",{parentName:"p"},"calls_sink"),", which we can\nconceptually think of as an inferred model like this:"),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-python"}),"def calls_sink(arg: TaintSink[RemoteCodeExecution]): ...\n")),Object(r.b)("p",null,"Pysa's next iteration can start with that summary for ",Object(r.b)("inlineCode",{parentName:"p"},"calls_sink"),", and use it\nwhen anlyzing the code for ",Object(r.b)("inlineCode",{parentName:"p"},"wraps_sink"),":"),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-python"}),"def wraps_sink(arg):\n  calls_sink(arg)\n")),Object(r.b)("p",null,"From this code, Pysa can infer a model documenting that ",Object(r.b)("inlineCode",{parentName:"p"},"wraps_sink"),"'s ",Object(r.b)("inlineCode",{parentName:"p"},"arg"),"\nwill also end up (indirectly) reaching an ",Object(r.b)("inlineCode",{parentName:"p"},"RemoteCodeExecution")," sink:"),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-python"}),"def wraps_sink(arg: TaintSink[RemoteCodeExecution]): ...\n")),Object(r.b)("h3",{id:"taint-in-taint-out-tito-summaries"},"Taint In Taint Out (TITO) Summaries"),Object(r.b)("p",null,"Pysa summaries also track how tainted data propagates from function arguments\ninto that function's return value. This is known as ",Object(r.b)("em",{parentName:"p"},"Taint In Taint Out")," (TITO).\nWhen computing the TITO portion of summaries, Pysa does not need to start from a\nmodel at all (however, ",Object(r.b)("a",Object(a.a)({parentName:"p"},{href:"/docs/pysa-basics#taint-propagation"}),"an explicit ",Object(r.b)("inlineCode",{parentName:"a"},"TaintInTaintOut"),"\nmodel")," can be written, if desired). Pysa can\nsimply start by looking at the source code for a function like ",Object(r.b)("inlineCode",{parentName:"p"},"tito")," and\ninferring that it's ",Object(r.b)("inlineCode",{parentName:"p"},"arg")," parameter gets propagated to the return value of the\nfunction:"),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-python"}),"def tito(arg):\n  return arg\n")),Object(r.b)("p",null,"This inference results in a summary for ",Object(r.b)("inlineCode",{parentName:"p"},"tito"),", which we can conceptually think\nof as an inferred model like this:"),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-python"}),"def tito(arg: TaintInTaintOut): ...\n")),Object(r.b)("p",null,"Pysa's next iteration can start with that summary for ",Object(r.b)("inlineCode",{parentName:"p"},"tito"),", and use it\nwhen anlyzing the code for ",Object(r.b)("inlineCode",{parentName:"p"},"wraps_tito"),":"),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-python"}),"def wraps_tito(arg):\n  return tito(arg)\n")),Object(r.b)("p",null,"From this code, Pysa can infer a model documenting that ",Object(r.b)("inlineCode",{parentName:"p"},"wraps_tito"),"'s ",Object(r.b)("inlineCode",{parentName:"p"},"arg"),"\nwill also end up (indirectly) propagated to the return value of the fucntion:"),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-python"}),"def wraps_tito(arg: TaintInTaintOut): ...\n")),Object(r.b)("h2",{id:"emitting-issues"},"Emitting Issues"),Object(r.b)("p",null,"An ",Object(r.b)("em",{parentName:"p"},"issue")," indicates that Pysa has found a flow of data from a source to a sink\n(for any source-sink pair specified in a ",Object(r.b)("a",Object(a.a)({parentName:"p"},{href:"/docs/pysa-basics#rules"}),Object(r.b)("em",{parentName:"a"},"rule")),"). Issues\noccur in the function where summaries indicate data from a source is returned\nfrom one function and is then passed into another function whose argument\nreaches a sink. This means issues often unintuitively occur in a function that\nis somewhere in the middle of the flow from source to sink."),Object(r.b)("p",null,"Continuing the previous examples, Pysa can use the summaries computed for\n",Object(r.b)("inlineCode",{parentName:"p"},"wraps_source"),", ",Object(r.b)("inlineCode",{parentName:"p"},"wraps_sink"),", and ",Object(r.b)("inlineCode",{parentName:"p"},"wraps_tito")," to identify an issue in\n",Object(r.b)("inlineCode",{parentName:"p"},"find_issue"),":"),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-python"}),"def find_issue():\n  x = wraps_source() # x: TaintSource[UserControlled]\n  y = wraps_tito(x)  # y: TaintSource[UserControlled]\n  wraps_sink(y)      # Issue!\n")),Object(r.b)("p",null,"The summary for ",Object(r.b)("inlineCode",{parentName:"p"},"wraps_source")," tells Pysa the return value is tainted data of\ntype ",Object(r.b)("inlineCode",{parentName:"p"},"UserControlled"),", and thus ",Object(r.b)("inlineCode",{parentName:"p"},"x")," is marked as ",Object(r.b)("inlineCode",{parentName:"p"},"UserControlled"),". The summary\nfor ",Object(r.b)("inlineCode",{parentName:"p"},"wraps_tito")," tells Pysa that tainted data passed in through ",Object(r.b)("inlineCode",{parentName:"p"},"arg")," will be\npropagated to the return value, and thus ",Object(r.b)("inlineCode",{parentName:"p"},"y")," is marked with the same taint as\n",Object(r.b)("inlineCode",{parentName:"p"},"x")," (",Object(r.b)("inlineCode",{parentName:"p"},"UserControlled"),"). Finally, the summary of ",Object(r.b)("inlineCode",{parentName:"p"},"wraps_sink")," tells Pysa that\ndata passed into ",Object(r.b)("inlineCode",{parentName:"p"},"arg")," eventually reaches a sink of kind ",Object(r.b)("inlineCode",{parentName:"p"},"RemoteCodeExecution"),".\nAssuming we have a ",Object(r.b)("em",{parentName:"p"},"rule")," that says we want to find flows from ",Object(r.b)("inlineCode",{parentName:"p"},"UserControlled"),"\nto ",Object(r.b)("inlineCode",{parentName:"p"},"RemoteCodeExecution"),", Pysa will then emit an issue on the line where\n",Object(r.b)("inlineCode",{parentName:"p"},"wraps_sink")," is called with the ",Object(r.b)("inlineCode",{parentName:"p"},"UserControlled")," data in ",Object(r.b)("inlineCode",{parentName:"p"},"y"),"."),Object(r.b)("h2",{id:"visualizing-issues"},"Visualizing Issues"),Object(r.b)("p",null,"Visualizing the flow of data in a given issue ends up looking something like\nthis:"),Object(r.b)("img",{alt:"Combining summaries to find an issue",src:Object(o.a)("img/issue_visualization.png")}),Object(r.b)("p",null,"Overall, the traces form an inverted V, with sources and sinks connecting at the\napex. There can be multiple sources for an issue, because two different sources\ncan both end up combined into a single return value for a function. Similarly,\nthere can be multiple sinks because a single argument to a function could be\npassed into two different sinks."),Object(r.b)("p",null,"The TITO process appears as a loop in this visualization, because data passed\ninto a TITO function will always end up back in the original function via the\nreturn value of the TITO function."))}p.isMDXComponent=!0},96:function(e,n,t){"use strict";t.d(n,"a",(function(){return p})),t.d(n,"b",(function(){return d}));var a=t(0),i=t.n(a);function r(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function o(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);n&&(a=a.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,a)}return t}function s(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?o(Object(t),!0).forEach((function(n){r(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function c(e,n){if(null==e)return{};var t,a,i=function(e,n){if(null==e)return{};var t,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)t=r[a],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)t=r[a],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var l=i.a.createContext({}),u=function(e){var n=i.a.useContext(l),t=n;return e&&(t="function"==typeof e?e(n):s(s({},n),e)),t},p=function(e){var n=u(e.components);return i.a.createElement(l.Provider,{value:n},e.children)},b={inlineCode:"code",wrapper:function(e){var n=e.children;return i.a.createElement(i.a.Fragment,{},n)}},m=i.a.forwardRef((function(e,n){var t=e.components,a=e.mdxType,r=e.originalType,o=e.parentName,l=c(e,["components","mdxType","originalType","parentName"]),p=u(t),m=a,d=p["".concat(o,".").concat(m)]||p[m]||b[m]||r;return t?i.a.createElement(d,s(s({ref:n},l),{},{components:t})):i.a.createElement(d,s({ref:n},l))}));function d(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var r=t.length,o=new Array(r);o[0]=m;var s={};for(var c in n)hasOwnProperty.call(n,c)&&(s[c]=n[c]);s.originalType=e,s.mdxType="string"==typeof e?e:a,o[1]=s;for(var l=2;l<r;l++)o[l]=t[l];return i.a.createElement.apply(null,o)}return i.a.createElement.apply(null,t)}m.displayName="MDXCreateElement"}}]);