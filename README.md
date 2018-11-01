# electron-dtls-client

This is a fork from [Alcazone](https://github.com/AlCalzone/node-dtls-client)
It was made to work with electron

[![node](https://img.shields.io/node/v/electron-dtls-client.svg) ![npm](https://img.shields.io/npm/v/electron-dtls-client.svg)](https://www.npmjs.com/package/electron-dtls-client)

[![Build Status](https://img.shields.io/circleci/project/github/AhadCove/electron-dtls-client.svg)](https://circleci.com/gh/AhadCove/electron-dtls-client)
[![Coverage Status](https://img.shields.io/coveralls/github/AhadCove/electron-dtls-client.svg)](https://coveralls.io/github/AhadCove/electron-dtls-client)

USE AT YOUR OWN RISK!

[DTLS](https://en.wikipedia.org/wiki/Datagram_Transport_Layer_Security) protocol implementation for Node.js written in TypeScript. 
This library provides the missing native DTLS support for Node.js client-side applications. It contains no server-side implementation.

Although great care has been taken to properly implement the required encryption and validation, 
there's no explicit protection against TLS attacks. Thus it is not advised to use it for security-critical applications. 
This libary's main goal is to allow using protocols that *require* DTLS.

## Usage

### Establish a secure connection:
```js
var dtls = require("electron-dtls-client");

const socket = dtls
	// create a socket and initialize the secure connection
	.createSocket(options /* DtlsOptions */)
	// subscribe events
	.on("connected", () => {/* start sending data */})
	.on("error", (e /* Error */) => { })
	.on("message", (msg /* Buffer */) => { })
	.on("close", () => { })
	;
```

The `DtlsOptions` object looks as follows:
```js
{
	type: "udp4",
	address: "ip or host",
	port: 5684,
	psk: { "psk_hint": "PSK" },
	timeout: 1000, // in ms, optional, minimum 100, default 1000
	ciphers: [ /* ... */ ] // optional array of (D)TLS cipher suites, e.g. ["TLS_PSK_WITH_AES_128_CCM"]
}
```

The `ciphers` property allows specifying which cipher suites should be advertised as supported. If this property is not provided, all supported ciphers are used by default. Use this if you want to force specific cipher suites for the communication.  
The currently supported cipher suites are limited to those with PSK key exchange:

* `"TLS_PSK_WITH_3DES_EDE_CBC_SHA"`
* `"TLS_PSK_WITH_AES_128_CBC_SHA"`
* `"TLS_PSK_WITH_AES_256_CBC_SHA"`
* `"TLS_PSK_WITH_AES_128_CBC_SHA256"`
* `"TLS_PSK_WITH_AES_256_CBC_SHA384"`
* `"TLS_PSK_WITH_AES_128_GCM_SHA256"`
* `"TLS_PSK_WITH_AES_256_GCM_SHA384"`
* `"TLS_PSK_WITH_AES_128_CCM_8"`
* `"TLS_PSK_WITH_AES_256_CCM_8"`

**PRs for other key exchange methods are welcome!**

### Send some data (after the `connected` event was received):
```js
socket.send(data /* Buffer */, [callback]);
```

The events are defined as follows:
- `connected`: A secure connection has been established. Start sending data in the callback
- `error`: An error has happened. This usually means the handshake was not successful
- `message`: The socket received some data.
- `close`: The connection was closed successfully.

**PRs adding support for these are welcome!**

## License
The MIT License (MIT)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
