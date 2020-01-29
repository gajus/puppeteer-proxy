// @flow

import got from 'got';
import {
  CookieJar,
} from 'tough-cookie';
import type {
  Request,
} from 'puppeteer';
import HttpProxyAgent from 'http-proxy-agent';
import HttpsProxyAgent from 'https-proxy-agent';
import {
  parseString,
} from 'set-cookie-parser';
import type {
  PageProxyConfigurationType,
  PageProxyType,
} from '../types';
import Logger from '../Logger';

const log = Logger.child({
  namespace: 'createPageProxy',
});

export default (configuration: PageProxyConfigurationType): PageProxyType => {
  const page = configuration.page;
  const proxyUrl = configuration.proxyUrl;

  const cookieJar = new CookieJar();

  const proxyRequest = async (request: Request) => {
    log.debug({
      body: request.postData(),
      headers: request.headers(),
      method: request.method(),
      url: request.url(),
    }, 'making a request using HTTP proxy');

    const AgentConstructor = proxyUrl.toLowerCase().startsWith('https://') ? HttpsProxyAgent : HttpProxyAgent;

    const agent = new AgentConstructor(proxyUrl);

    const response = await got(request.url(), {
      agent,
      body: request.postData(),
      cookieJar,
      headers: request.headers(),
      method: request.method(),
    });

    const setCookieHeaders = response.headers['set-cookie'] || [];

    for (const setCookieHeader of setCookieHeaders) {
      const cookie = parseString(setCookieHeader);

      await page.setCookie({
        domain: cookie.domain || new URL(response.url).hostname,
        expires: cookie.expires && cookie.expires.toString(),
        httpOnly: cookie.httpOnly,
        name: cookie.name,
        path: cookie.path,
        secure: cookie.secure,
        value: cookie.value,
      });
    }

    await request.respond({
      body: response.body,
      headers: response.headers,
      status: response.statusCode,
    });
  };

  return {
    proxyRequest,
  };
};
