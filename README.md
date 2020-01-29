<a name="puppeteer-proxy"></a>
# puppeteer-proxy 🎎

[![Travis build status](http://img.shields.io/travis/gajus/puppeteer-proxy/master.svg?style=flat-square)](https://travis-ci.org/gajus/puppeteer-proxy)
[![Coveralls](https://img.shields.io/coveralls/gajus/puppeteer-proxy.svg?style=flat-square)](https://coveralls.io/github/gajus/puppeteer-proxy)
[![NPM version](http://img.shields.io/npm/v/puppeteer-proxy.svg?style=flat-square)](https://www.npmjs.org/package/puppeteer-proxy)
[![Canonical Code Style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)
[![Twitter Follow](https://img.shields.io/twitter/follow/kuizinas.svg?style=social&label=Follow)](https://twitter.com/kuizinas)

Proxies [Puppeteer](https://github.com/puppeteer/puppeteer) Page requests.

<a name="puppeteer-proxy-implementation"></a>
## Implementation

puppeteer-proxy intercepts requests after it receives the request metadata from Puppeteer. puppeteer-proxy uses Node.js to make the HTTP requests. The response is then returned to the browser. When using puppeteer-proxy, browser never makes outbound HTTP requests.

<a name="puppeteer-proxy-api"></a>
## API

```js
import type {
  Page,
  Request,
} from 'puppeteer';
import {
  createPageProxy,
} from 'puppeteer-proxy';

/**
 * @property page Instance of Puppeteer Page.
 * @property proxyUrl Proxy URL.
 */
type PageProxyConfigurationType = {|
  +page: Page,
  +proxyUrl: string,
|};

type PageProxyType = {|
  +proxyRequest: (request: Request) => Promise<void>,
|};

createPageProxy(configuration: PageProxyConfigurationType): PageProxyType;

```

<a name="puppeteer-proxy-usage"></a>
## Usage

```js
import puppeteer from 'puppeteer';
import {
  createPageProxy,
} from 'puppeteer-proxy';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const pageProxy = createPageProxy({
    page,
    proxyUrl: 'http://127.0.0.1:3000',
  });

  await page.setRequestInterception(true);

  page.once('request', async (request) => {
    await pageProxy.proxyRequest(request);
  });

  await page.goto('https://example.com');
})();

```
