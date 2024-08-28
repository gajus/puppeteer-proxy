// @flow

import type {Page} from 'puppeteer';

/**
 * @see https://stackoverflow.com/a/59604510/368691
 */
export default (page: Page) => {
  const client = typeof page._client === 'function' ? page._client() : page._client;

  return client.send('Network.getAllCookies');
};
