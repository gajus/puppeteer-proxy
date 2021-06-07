// @flow

import type {Page} from 'puppeteer';

/**
 * @see https://stackoverflow.com/a/59604510/368691
 */
export default (page: Page) => {
  return page._client.send('Network.getAllCookies');
};
