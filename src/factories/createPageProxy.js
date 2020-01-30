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
  PageProxyConfigurationType,
  PageProxyType,
} from '../types';
import Logger from '../Logger';
import createToughCookiePayloadFromPuppeteerCookies from './createToughCookiePayloadFromPuppeteerCookies';
import createPuppeteerCookiesFromToughCookiePayload from './createPuppeteerCookiesFromToughCookiePayload';

const log = Logger.child({
  namespace: 'createPageProxy',
});

export default (pageProxyConfiguration: PageProxyConfigurationType): PageProxyType => {
  const page = pageProxyConfiguration.page;

  const proxyRequest = async (proxyRequestConfiguration) => {
    const {
      proxyUrl,
      request,
    } = proxyRequestConfiguration;

    log.debug({
      body: request.postData(),
      headers: request.headers(),
      method: request.method(),
      url: request.url(),
    }, 'making a request using HTTP proxy');

    const cookieJar = CookieJar.deserializeSync(
      createToughCookiePayloadFromPuppeteerCookies(
        (await getAllCookies(page)).cookies,
      ),
    );

    const AgentConstructor = proxyUrl.toLowerCase().startsWith('https://') ? HttpsProxyAgent : HttpProxyAgent;

    const agent = new AgentConstructor(proxyUrl);

    let response;

    try {
      console.log('>>>', request.url(), {
        // agent,
        body: request.postData(),
        cookieJar,
        headers: request.headers(),
        method: request.method(),
        retry: 0,
        throwHttpErrors: false,
      });

      response = await got(request.url(), {
        // agent,
        body: request.postData(),
        cookieJar,
        headers: request.headers(),
        method: request.method(),
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
