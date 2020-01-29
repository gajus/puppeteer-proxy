// @flow

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
