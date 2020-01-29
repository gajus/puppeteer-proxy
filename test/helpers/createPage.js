// @flow

import puppeteer from 'puppeteer';
import type {
  Page,
} from 'puppeteer';

type RoutineType = (page: Page) => Promise<void>;

export default async (routine: RoutineType): Promise<void> => {
  const browser = await puppeteer.launch({
    args: [],
    headless: true,
    ignoreHTTPSErrors: true,
  });

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const terminate = async () => {
    await browser.close();
  };

  let page;

  try {
    page = await browser.newPage();

    await page.setDefaultNavigationTimeout(5 * 1000);
    await page.setDefaultTimeout(5 * 1000);
  } catch (error) {
    await terminate();

    throw error;
  }

  let result;
  let routineError;

  try {
    result = await routine(page);
  } catch (error) {
    routineError = error;
  }

  await terminate();

  if (routineError) {
    throw routineError;
  }

  return result;
};
