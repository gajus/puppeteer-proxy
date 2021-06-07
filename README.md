# puppeteer-proxy 🎎

[![Travis build status](http://img.shields.io/travis/gajus/puppeteer-proxy/master.svg?style=flat-square)](https://travis-ci.org/gajus/puppeteer-proxy)
[![Coveralls](https://img.shields.io/coveralls/gajus/puppeteer-proxy.svg?style=flat-square)](https://coveralls.io/github/gajus/puppeteer-proxy)
[![NPM version](http://img.shields.io/npm/v/puppeteer-proxy.svg?style=flat-square)](https://www.npmjs.org/package/puppeteer-proxy)
[![Canonical Code Style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)
[![Twitter Follow](https://img.shields.io/twitter/follow/kuizinas.svg?style=social&label=Follow)](https://twitter.com/kuizinas)

Proxies [Puppeteer](https://github.com/puppeteer/puppeteer) Page requests.

* Allows to change proxy per Page and per Request.
* Allows to authenticate using http://username:password@proxy schema.
* Handles cookies.
* Handles binary files.
* Supports custom [HTTP(S) agents](https://nodejs.org/api/http.html#http_class_http_agent).

## Motivation

This package addresses several issues with Puppeteer:

* It allows to set a proxy per Page and per Request ([#678](https://github.com/puppeteer/puppeteer/issues/678))
* It allows to authenticate against proxy when making HTTPS requests ([#3253](https://github.com/puppeteer/puppeteer/issues/3253))

The side-benefit of this [implementation](#implementation) is that it allows to route all traffic through Node.js, i.e. you can use externally hosted Chrome instance (such as [Browserless.io](https://www.browserless.io/)) to render DOM & evaluate JavaScript, and route all HTTP traffic through your Node.js instance.

The downside of this implementation is that it will introduce additional latency, i.e. requests will take longer to execute as request/ response will need to be always exchanged between Puppeteer and Node.js.

## Implementation

puppeteer-proxy intercepts requests after it receives the request metadata from Puppeteer. puppeteer-proxy uses Node.js to make the HTTP requests. The response is then returned to the browser. When using puppeteer-proxy, browser never makes outbound HTTP requests.

## Setup

You must call [`page.setRequestInterception(true)`](https://pptr.dev/#?product=Puppeteer&version=v2.1.0&show=api-pagesetrequestinterceptionvalue) before using `pageProxy.proxyRequest`.

## API

```js
import {
  Agent as HttpAgent,
} from 'http';
import {
  Agent as HttpsAgent,
} from 'https';
import type {
  Page,
  Request,
} from 'puppeteer';
import {
  proxyRequest,
} from 'puppeteer-proxy';

/**
 * @property agent HTTP(s) agent to use when making the request.
 * @property page Instance of Puppeteer Page.
 * @property proxyUrl HTTP proxy URL. A different proxy can be set for each request.
 * @property request Instance of Puppeteer Request.
 */
type ProxyRequestConfigurationType = {|
  +agent?: HttpAgent | HttpsAgent,
  +page: Page,
  +proxyUrl?: string | { http: string, https: string },
  +request: Request,
|};

proxyRequest(configuration: ProxyRequestConfigurationType): PageProxyType;

```

## Usage

### Making a GET request using proxy

```js
import puppeteer from 'puppeteer';
import {
  proxyRequest,
} from 'puppeteer-proxy';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setRequestInterception(true);

  page.on('request', async (request) => {
    await proxyRequest({
      page,
      proxyUrl: 'http://127.0.0.1:3000',
      request,
    });
  });

  await page.goto('http://gajus.com');
})();

```
