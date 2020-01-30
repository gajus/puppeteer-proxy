// @flow

import got from 'got';
import {
  CookieJar,
} from 'tough-cookie';
import {
  serializeError,
} from 'serialize-error';
import HttpProxyAgent from 'http-proxy-agent';
import HttpsProxyAgent from 'https-proxy-agent';
import {
  getAllCookies,
} from '../routines';
import type {
  HeadersType,
  PageProxyConfigurationType,
  PageProxyType,
} from '../types';
import Logger from '../Logger';
import createToughCookiePayloadFromPuppeteerCookies from './createToughCookiePayloadFromPuppeteerCookies';
import createPuppeteerCookiesFromToughCookiePayload from './createPuppeteerCookiesFromToughCookiePayload';

const log = Logger.child({
  namespace: 'createPageProxy',
});

const defaultChromeHeaders = {
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
  'accept-encoding': 'gzip, deflate',
  'accept-language': 'en',
  'cache-control': 'no-cache',
  connection: 'keep-alive',
  dnt: '1',
  pragma: 'no-cache',
};

/**
 * @see https://github.com/puppeteer/puppeteer/issues/5364
 */
const appendDefaultChromeHeaders = (requestHeaders: HeadersType, requestUrl: string) => {
  return {
    ...requestHeaders,
    ...defaultChromeHeaders,
    host: new URL(requestUrl).hostname,
  };
};

export default (pageProxyConfiguration: PageProxyConfigurationType): PageProxyType => {
  const page = pageProxyConfiguration.page;

  const proxyRequest = async (proxyRequestConfiguration) => {
    const {
      proxyUrl,
      request,
    } = proxyRequestConfiguration;

    const headers = appendDefaultChromeHeaders(
      request.headers(),
      request.url(),
    );

    log.debug({
      body: request.postData(),
      headers,
      method: request.method(),
      url: request.url(),
    }, 'making a request using HTTP proxy');

    const cookieJar = CookieJar.deserializeSync(
      createToughCookiePayloadFromPuppeteerCookies(
        (await getAllCookies(page)).cookies,
      ),
    );

    let agent;

    if (proxyRequestConfiguration.agent) {
      agent = proxyRequestConfiguration.agent;
    } else if (proxyUrl && proxyUrl.toLowerCase().startsWith('https://')) {
      agent = new HttpsProxyAgent(proxyUrl);
    } else if (proxyUrl) {
      agent = new HttpProxyAgent(proxyUrl);
    }

    let response;

    try {
      response = await got(request.url(), {
        agent,
        body: request.postData(),
        cookieJar,
        headers,
        method: request.method(),
        responseType: 'buffer',
        retry: 0,
        throwHttpErrors: false,
      });
    } catch (error) {
      log.error({
        error: serializeError(error),
      }, 'could not complete HTTP request due to an error');

      request.abort();

      return;
    }

    if (!response) {
      throw new Error('response object is not present.');
    }

    await page.setCookie(
      ...createPuppeteerCookiesFromToughCookiePayload(cookieJar.serializeSync()),
    );

    await request.respond({
      body: response.body,
      headers: response.headers,
      status: response.statusCode,
    });
  };

  return {
    proxyRequest: async (configuration) => {
      try {
        await proxyRequest(configuration);
      } catch (error) {
        log.error({
          error: serializeError(error),
        }, 'could not proxy request due to an error');

        configuration.request.abort();
      }
    },
  };
};
