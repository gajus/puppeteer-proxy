// @flow

/* eslint-disable import/exports-last */

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

export interface ProxyUrl {
  http?: string,
  https?: string,
}

export type HeadersType = {
  +[key: string]: string,
  ...
};

/**
 * @property agent HTTP(s) agent to use when making the request.
 * @property page Instance of Puppeteer Page.
 * @property proxyUrl HTTP proxy URL. A different proxy can be set for each request.
 * @property request Instance of Puppeteer Request.
 */
export type ProxyRequestConfigurationType = {|
  +agent?: HttpAgent | HttpsAgent,
  +page: Page,
  +proxyUrl?: ProxyUrl | string,
  +request: Request,
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

export type ToughCookiePayloadType = {|
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
