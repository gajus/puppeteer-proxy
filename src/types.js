// @flow

/* eslint-disable import/exports-last */

import type {
  Page,
  Request,
} from 'puppeteer';

export type PageProxyConfigurationType = {|
  +page: Page,
  +proxyUrl: string,
|};

export type PageProxyType = {|
  +proxyRequest: (request: Request) => Promise<void>,
|};

/**
 * These are cookies obtained using `page.cookies()` method.
 *
 * @see https://pptr.dev/#?product=Puppeteer&version=v2.0.0&show=api-pagecookiesurls
 */
export type PuppeteerCookieType = {|
  +domain: string,
  +expires: number,
  +httpOnly: boolean,
  +name: string,
  +path: string,
  +sameSite: 'Strict' | 'Lax' | 'Extended' | 'None',
  +secure: boolean,
  +session: boolean,
  +size: number,
  +value: string,
|};

type ToughCookieCookiePayloadType = {|
  +creation: string,
  +domain: string,
  +expires: number | string,
  +hostOnly: boolean,
  +httpOnly: boolean,
  +key: string,
  +lastAccessed: string,
  +path: string,
  +secure: boolean,
  +value: string,
|};

/**
 * Serialized instance of a `tough-cookie` `CookieJar`.
 *
 * @see https://www.npmjs.com/package/tough-cookie#tojson
 */
export type ToughCookiePayloadType = {|
  +cookies: $ReadOnlyArray<ToughCookieCookiePayloadType>,
  +rejectPublicSuffixes: boolean,
  +storeType: 'MemoryCookieStore',
  +version: string,
|};

