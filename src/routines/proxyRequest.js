// @flow

import type {
  Request,
} from 'puppeteer';
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
  createToughCookiePayloadFromPuppeteerCookies,
} from '../factories';
import type {
  ProxyRequestConfigurationType,
} from '../types';
import Logger from '../Logger';
import getAllCookies from './getAllCookies';

const log = Logger.child({
  namespace: 'proxyRequest',
});

const defaultChromeHeaders = {
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
  'accept-encoding': 'gzip, deflate, br',
  'accept-language': 'en',
};

/**
 * @see https://github.com/puppeteer/puppeteer/issues/5364
 */
const appendDefaultChromeHeaders = (request: Request) => {
  let nextHeaders = {
    ...request.headers(),
    ...defaultChromeHeaders,
    host: new URL(request.url()).hostname,
  };

  if (request.isNavigationRequest()) {
    nextHeaders = {
      ...nextHeaders,
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'none',
      'sec-fetch-user': '?1',
    };
  } else {
    nextHeaders = {
      ...nextHeaders,
      'sec-fetch-mode': 'no-cors',
      'sec-fetch-site': 'same-origin',
    };
  }

  return nextHeaders;
};

const proxyRequest = async (proxyRequestConfiguration: ProxyRequestConfigurationType): Promise<void> => {
  const {
    page,
    proxyUrl,
    request,
  } = proxyRequestConfiguration;

  const headers = appendDefaultChromeHeaders(request);

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
  } else if (proxyUrl && request.url().toLowerCase().startsWith('https://')) {
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
      followRedirect: false,
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

  await request.respond({
    body: response.body,
    headers: response.headers,
    status: response.statusCode,
  });
};

export default async (proxyRequestConfiguration: ProxyRequestConfigurationType) => {
  try {
    await proxyRequest(proxyRequestConfiguration);
  } catch (error) {
    log.error({
      error: serializeError(error),
    }, 'could not proxy request due to an error');

    proxyRequestConfiguration.request.abort();
  }
};
