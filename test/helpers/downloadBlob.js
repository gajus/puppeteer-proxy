// @flow

import type {
  Page,
} from 'puppeteer';

export default async (page: Page, url: string): Promise<Buffer> => {
  // eslint-disable-next-line no-shadow
  const data = await page.evaluate(async (url) => {
    const response = await window.fetch(url);

    const blob = await response.blob();
    const fileReader = new FileReader();

    return new Promise((resolve) => {
      fileReader.addEventListener('loadend', () => {
        resolve(fileReader.result);
      });
      fileReader.readAsDataURL(blob);
    });
  }, url);

  return Buffer.from(data.split(',')[1], 'base64');
};
