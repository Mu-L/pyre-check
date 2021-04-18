(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{74:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return o})),n.d(t,"metadata",(function(){return c})),n.d(t,"rightToc",(function(){return p})),n.d(t,"default",(function(){return b}));var a=n(3),r=n(7),i=(n(0),n(97)),o={id:"installation",title:"Installation",sidebar_label:"Installation"},c={unversionedId:"installation",id:"installation",isDocsHomePage:!1,title:"Installation",description:"We recommend that you use our binary distribution through pypi inside of a virtual environment, which supports both MacOs and Linux. On Windows we have successfully gotten pyre to work through WSL, but do not officially support it.",source:"@site/docs/installation.md",slug:"/installation",permalink:"/docs/installation",editUrl:"https://github.com/facebook/pyre-check/tree/master/documentation/website/docs/installation.md",version:"current",sidebar_label:"Installation",sidebar:"pyre",previous:{title:"Getting Started",permalink:"/docs/getting-started"},next:{title:"Configuration",permalink:"/docs/configuration"}},p=[{value:"Binary Distribution",id:"binary-distribution",children:[]},{value:"IDE Integration",id:"ide-integration",children:[]},{value:"Building from Source",id:"building-from-source",children:[{value:"Requirements",id:"requirements",children:[]},{value:"Building OCaml changes",id:"building-ocaml-changes",children:[]},{value:"Testing changes to the Python Client",id:"testing-changes-to-the-python-client",children:[]}]},{value:"Building from Docker",id:"building-from-docker",children:[]},{value:"Windows Subsystem for Linux (WSL) Install",id:"windows-subsystem-for-linux-wsl-install",children:[]}],l={rightToc:p};function b(e){var t=e.components,n=Object(r.a)(e,["components"]);return Object(i.b)("wrapper",Object(a.a)({},l,n,{components:t,mdxType:"MDXLayout"}),Object(i.b)("p",null,"We recommend that you use our binary distribution through ",Object(i.b)("a",Object(a.a)({parentName:"p"},{href:"https://pypi.org/"}),"pypi")," inside of a virtual environment, which supports both ",Object(i.b)("em",{parentName:"p"},"MacOs")," and ",Object(i.b)("em",{parentName:"p"},"Linux"),". On ",Object(i.b)("em",{parentName:"p"},"Windows")," we have successfully gotten ",Object(i.b)("inlineCode",{parentName:"p"},"pyre")," to work through ",Object(i.b)("a",Object(a.a)({parentName:"p"},{href:"https://en.wikipedia.org/wiki/Windows_Subsystem_for_Linux"}),"WSL"),", but do not officially support it."),Object(i.b)("h2",{id:"binary-distribution"},"Binary Distribution"),Object(i.b)("p",null,"You can get Pyre through ",Object(i.b)("a",Object(a.a)({parentName:"p"},{href:"https://pypi.org/"}),"pypi")," by running:"),Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-bash"}),"$ (venv) $ pip install pyre-check\n")),Object(i.b)("p",null,"See our ",Object(i.b)("a",Object(a.a)({parentName:"p"},{href:"getting-started"}),"Getting Started")," section for a more detailed example, including setup for a virtual environment."),Object(i.b)("h2",{id:"ide-integration"},"IDE Integration"),Object(i.b)("p",null,"Pyre supports the ",Object(i.b)("a",Object(a.a)({parentName:"p"},{href:"https://en.wikipedia.org/wiki/Language_Server_Protocol"}),"Language Server Protocol"),". We provide an ",Object(i.b)("a",Object(a.a)({parentName:"p"},{href:"https://marketplace.visualstudio.com/items?itemName=fb-pyre-check.pyre-vscode"}),"extension for ",Object(i.b)("em",{parentName:"a"},"VSCode"))," that will automatically try to connect to a running server. You can also directly interact with the LSP by piping the appropriate ",Object(i.b)("inlineCode",{parentName:"p"},"JSON")," into ",Object(i.b)("inlineCode",{parentName:"p"},"pyre persistent"),"."),Object(i.b)("h2",{id:"building-from-source"},"Building from Source"),Object(i.b)("p",null,"These instructions are known to work on ",Object(i.b)("em",{parentName:"p"},"Mac OS X")," (tested on ",Object(i.b)("em",{parentName:"p"},"High\nSierra")," through ",Object(i.b)("em",{parentName:"p"},"OSX 10.13")," - even though binaries are compatible with versions\nas old as ",Object(i.b)("em",{parentName:"p"},"10.11"),") and ",Object(i.b)("em",{parentName:"p"},"Linux")," (tested on ",Object(i.b)("em",{parentName:"p"},"Ubuntu 16.04 LTS")," and ",Object(i.b)("em",{parentName:"p"},"CentOS 7"),")."),Object(i.b)("h3",{id:"requirements"},"Requirements"),Object(i.b)("p",null,"In addition to ",Object(i.b)("a",Object(a.a)({parentName:"p"},{href:"getting-started#requirements"}),"Python and watchman"),", we need a working ",Object(i.b)("em",{parentName:"p"},"OCaml")," compiler. We use\n",Object(i.b)("a",Object(a.a)({parentName:"p"},{href:"https://opam.ocaml.org/"}),"Opam")," to manage our compiler and libraries. You can get Opam via various\npackage management systems. Please follow their instructions for your particular operating system."),Object(i.b)("p",null,"Once you have Opam on your system, switch to a current compiler with"),Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-bash"}),"$ opam switch 4.10.2\n")),Object(i.b)("p",null,"This will compile the compiler from scratch and is likely going to take some time on your system."),Object(i.b)("h3",{id:"building-ocaml-changes"},"Building OCaml changes"),Object(i.b)("p",null,"With a working OCaml, you can clone the source from ",Object(i.b)("a",Object(a.a)({parentName:"p"},{href:"https://github.com/facebook/pyre-check"}),"GitHub")," with"),Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-bash"}),"$ git clone https://github.com/facebook/pyre-check\n")),Object(i.b)("p",null,"You can complete the setup of your development environment with"),Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-bash"}),"$ cd pyre-check\n$ ./scripts/setup.sh --local\n")),Object(i.b)("p",null,"This will generate a ",Object(i.b)("inlineCode",{parentName:"p"},"Makefile")," in the ",Object(i.b)("inlineCode",{parentName:"p"},"source")," directory. You can subsequently build and test\n",Object(i.b)("inlineCode",{parentName:"p"},"pyre")," with"),Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-bash"}),"$ make\n$ make test\n")),Object(i.b)("h3",{id:"testing-changes-to-the-python-client"},"Testing changes to the Python Client"),Object(i.b)("p",null,"In a virtualenv, install dependencies with ",Object(i.b)("inlineCode",{parentName:"p"},"requirements.txt")," and run python tests to make sure everything is set up correctly"),Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-bash"}),"$ cd /path/to/pyre-check\n$ pip install -r requirements.txt\n$ ./scripts/run-python-tests.sh\n")),Object(i.b)("p",null,"When installing and running ",Object(i.b)("inlineCode",{parentName:"p"},"pyre")," from PyPi, the entry point to the executable is actually ",Object(i.b)("inlineCode",{parentName:"p"},"client/pyre.py"),". To be able to run this file from anywhere, add the ",Object(i.b)("inlineCode",{parentName:"p"},"pyre-check")," directory to ",Object(i.b)("inlineCode",{parentName:"p"},"PYTHONPATH")," and subsequently assign ",Object(i.b)("inlineCode",{parentName:"p"},"pyre")," and an alias for ",Object(i.b)("inlineCode",{parentName:"p"},"client.pyre"),". For the ",Object(i.b)("inlineCode",{parentName:"p"},"pyre")," command to correctly point to the compiled binary, also set the environment variable ",Object(i.b)("inlineCode",{parentName:"p"},"PYRE_BINARY")," to ",Object(i.b)("inlineCode",{parentName:"p"},"source/build/default/main.exe"),"."),Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-bash"}),'$ echo "alias pyre=\'PYTHONPATH=\\"/path/to/pyre-check:\\$PYTHONPATH\\" python -m client.pyre\'" >> ~/.bashrc\n$ echo "export PYRE_BINARY=/path/to/pyre-check/source/_build/default/main.exe" >> ~/.bashrc\n$ source ~/.bashrc\n')),Object(i.b)("p",null,"You should be able to open a new shell and run ",Object(i.b)("inlineCode",{parentName:"p"},"pyre -h")," now, confirming ",Object(i.b)("inlineCode",{parentName:"p"},"pyre")," was set-up correctly. Any changes made to the Pyre Python client code should be immediately observable the next time you invoke ",Object(i.b)("inlineCode",{parentName:"p"},"pyre")),Object(i.b)("h4",{id:"testing-changes-for-plugin-development"},"Testing changes for Plugin Development"),Object(i.b)("p",null,"VSCode will not pick up your shell aliases, so the alias step in the previous section will not work if you're doing VSCode Plugin development. To get around this, instead of creating an alias, we can create an executable script called ",Object(i.b)("inlineCode",{parentName:"p"},"pyre")," and place it in a directory in our ",Object(i.b)("inlineCode",{parentName:"p"},"PATH"),":"),Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-bash"}),'#!/bin/bash\nPYTHONPATH="/path/to/pyre-check:$PYTHONPATH" python -m client.pyre "$@"\n')),Object(i.b)("p",null,"Add the ",Object(i.b)("inlineCode",{parentName:"p"},"pyre-check/scripts")," directory to ",Object(i.b)("inlineCode",{parentName:"p"},"PATH")," (assuming you placed the above script in that directory) and then use the command ",Object(i.b)("inlineCode",{parentName:"p"},"pyre")," to launch the client like before"),Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-bash"}),"$ echo 'PATH=\"/path/to/pyre-check/scripts:$PATH\"' >> ~/.bashrc\n$ source ~/.bashrc\n")),Object(i.b)("h2",{id:"building-from-docker"},"Building from Docker"),Object(i.b)("p",null,"If you're having issues setting up or your OS is not yet supported, you can also use a Docker image. It runs ",Object(i.b)("a",Object(a.a)({parentName:"p"},{href:"https://www.debian.org/"}),"Debian GNU/Linux 10 (buster)")," and builds pyre-check from source."),Object(i.b)("p",null,"Before starting, ensure that ",Object(i.b)("a",Object(a.a)({parentName:"p"},{href:"https://docs.docker.com/get-docker/"}),"Docker")," is installed on your computer."),Object(i.b)("ol",null,Object(i.b)("li",{parentName:"ol"},Object(i.b)("p",{parentName:"li"},"Clone the pyre-check repository and navigate to the root directory."),Object(i.b)("pre",{parentName:"li"},Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-bash"}),"git clone https://github.com/facebook/pyre-check.git\ncd pyre-check\n"))),Object(i.b)("li",{parentName:"ol"},Object(i.b)("p",{parentName:"li"},"Build the Docker image with the tag ",Object(i.b)("inlineCode",{parentName:"p"},"pyre-check")," (or another tag if you wish)"),Object(i.b)("pre",{parentName:"li"},Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-bash"}),"docker build -t pyre-docker .\n"))),Object(i.b)("li",{parentName:"ol"},Object(i.b)("p",{parentName:"li"},"Run the new image in a new container ",Object(i.b)("inlineCode",{parentName:"p"},"pyre-container")," (or another name if you wish)"),Object(i.b)("pre",{parentName:"li"},Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-bash"}),"docker run \\\n--name pyre-container \\\n-v /path/to/your/directory:/src \\\n-t -i \\\npyre-check\n")),Object(i.b)("p",{parentName:"li"},Object(i.b)("em",{parentName:"p"},"Note: Launching the container will build and run all tests."))),Object(i.b)("li",{parentName:"ol"},Object(i.b)("p",{parentName:"li"},"Inside the container, run any Pyre command now with ",Object(i.b)("inlineCode",{parentName:"p"},"pyre"),"!"),Object(i.b)("p",{parentName:"li"},Object(i.b)("em",{parentName:"p"},"Note: When initializing Pyre with ",Object(i.b)("inlineCode",{parentName:"em"},"pyre init"),", you may have to enter the following paths for the binary and typeshed:")),Object(i.b)("pre",{parentName:"li"},Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-bash"}),"\u019b No `pyre.bin` found, enter the path manually: /home/opam/pyre-check/source/_build/default/main.exe\n\u019b Unable to locate typeshed, please enter its root: /home/opam/pyre-check/stubs/typeshed/typeshed-master\n")))),Object(i.b)("p",null,Object(i.b)("strong",{parentName:"p"},"For contributors:")," Inside the Docker container, the added pyre-check directory is only editable by the root user. To contribute to Pyre, make edits in your local filesystem and rebuild the Docker by running Step 2, then running a new Docker container in Steps 3-4."),Object(i.b)("h2",{id:"windows-subsystem-for-linux-wsl-install"},"Windows Subsystem for Linux (WSL) Install"),Object(i.b)("p",null,"On ",Object(i.b)("em",{parentName:"p"},"x86_64")," Windows ",Object(i.b)("inlineCode",{parentName:"p"},"pyre")," can run via ",Object(i.b)("em",{parentName:"p"},"Linux")," using ",Object(i.b)("a",Object(a.a)({parentName:"p"},{href:"https://en.wikipedia.org/wiki/Windows_Subsystem_for_Linux"}),"WSL"),".\nA brief summary to get this running on ",Object(i.b)("em",{parentName:"p"},"Ubuntu")," please follow:"),Object(i.b)("ul",null,Object(i.b)("li",{parentName:"ul"},Object(i.b)("a",Object(a.a)({parentName:"li"},{href:"https://docs.microsoft.com/en-us/windows/wsl/install-win10"}),"Install WSL")," ",Object(i.b)("em",{parentName:"li"},"(external Microsoft Documentation)")),Object(i.b)("li",{parentName:"ul"},"Once you have a login to your Linux of choice:",Object(i.b)("ul",{parentName:"li"},Object(i.b)("li",{parentName:"ul"},"Optionally: Install build environment (some dependencies of ",Object(i.b)("inlineCode",{parentName:"li"},"pyre")," might need to be built)"),Object(i.b)("li",{parentName:"ul"},"Use ",Object(i.b)("inlineCode",{parentName:"li"},"pip")," as described above or via a ",Object(i.b)("a",Object(a.a)({parentName:"li"},{href:"https://docs.python.org/3/tutorial/venv.html"}),"Python Virtual Environment")))),Object(i.b)("li",{parentName:"ul"},"Here is an example using ",Object(i.b)("a",Object(a.a)({parentName:"li"},{href:"https://www.ubuntu.com/"}),"Ubuntu")," with a ",Object(i.b)("a",Object(a.a)({parentName:"li"},{href:"https://docs.python.org/3/tutorial/venv.html"}),"venv"),":")),Object(i.b)("pre",null,Object(i.b)("code",Object(a.a)({parentName:"pre"},{className:"language-bash"}),"$ sudo apt install python3-venv build-essential python3-dev libpython3-dev\n$ python3 -m venv /tmp/tp\n$ /tmp/tp/bin/pip install --upgrade pip setuptools wheel\n$ /tmp/tp/bin/pip install pyre-check\n$ source /tmp/tp/bin/activate\n$ cd /mnt/c/path/to/repo\n$ pyre --source-directory . check\n\n$ (tp) cooper@TESTFAC-1FMHLI2:/mnt/c/path/to/repo$ pyre --source-directory . check\n \u019b Setting up a `.pyre_configuration` with `pyre init` may reduce overhead.\n \u019b No type errors found\n")))}b.isMDXComponent=!0},97:function(e,t,n){"use strict";n.d(t,"a",(function(){return s})),n.d(t,"b",(function(){return d}));var a=n(0),r=n.n(a);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function c(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var l=r.a.createContext({}),b=function(e){var t=r.a.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):c(c({},t),e)),n},s=function(e){var t=b(e.components);return r.a.createElement(l.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return r.a.createElement(r.a.Fragment,{},t)}},m=r.a.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,o=e.parentName,l=p(e,["components","mdxType","originalType","parentName"]),s=b(n),m=a,d=s["".concat(o,".").concat(m)]||s[m]||u[m]||i;return n?r.a.createElement(d,c(c({ref:t},l),{},{components:n})):r.a.createElement(d,c({ref:t},l))}));function d(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,o=new Array(i);o[0]=m;var c={};for(var p in t)hasOwnProperty.call(t,p)&&(c[p]=t[p]);c.originalType=e,c.mdxType="string"==typeof e?e:a,o[1]=c;for(var l=2;l<i;l++)o[l]=n[l];return r.a.createElement.apply(null,o)}return r.a.createElement.apply(null,n)}m.displayName="MDXCreateElement"}}]);