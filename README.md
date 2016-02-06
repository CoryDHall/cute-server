Cute-Server
============

Simple static web server forked from __[local-server](https://github.com/buunguyen/local-server)__ by __[Buu Nguyen](https://github.com/buunguyen)__

### Install
```
npm install cute-server -g
```

### CLI Usage

```
qtserver -p [port] -r [root folder] -f [fallback path if not found]
```


| Arguments (all are optional) |   |
| :------------- | :------------- |
| `-p, --port: [Number]` | port number, default to 8000 |
| `-r, --root: [String]` | root folder, default to working directory |
| `-f, --fallback: [String]` | fallback path when page not found, default to not falling back and send 404 |
| `-F, --fallback-to-root` | set the fallback path to the root folder, overrides `-f, --fallback` |
| `-x, --redirect:` | when page not found issue a redirect response (__off__ by default) |

For example
```
qtserver -p 9999 -r ./ -F
=>
  ————————————————————————————————————————————————————————————
  Server running at http://localhost:9999/
    root: ./
    fallback: ./
  ————————————————————————————————————————————————————————————


```
### Module Usage

```JavaScript
const cute = require('cute-server')

let qt = cute.server({port: 9999})

qt.start() //=> 9999
```
```
———>    Cute Server running at:	http://localhost:8000/
———>                      root:	/Users/cdphall/Work/_web_dev/projects/sand
———>                  fallback:	NONE
```

To terminate the server:
```JavaScript
cute.kill(9999)
```
or
```JavaScript
qt.end()
```
