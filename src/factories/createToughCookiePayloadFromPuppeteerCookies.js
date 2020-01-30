// @flow

import type {
  PuppeteerCookieType,
  ToughCookiePayloadType,
} from '../types';

export default (cookies: $ReadOnlyArray<PuppeteerCookieType>): ToughCookiePayloadType => {
  return {
    cookies: cookies.map((cookie) => {
      return {
        creation: new Date().toISOString(),
        domain: cookie.domain.replace(/^\./, ''),
        expires: cookie.expires === -1 ? Infinity : new Date(cookie.expires * 1000).toISOString(),
        hostOnly: !cookie.domain.startsWith('.'),
        httpOnly: cookie.httpOnly,
        key: cookie.name,
        lastAccessed: new Date().toISOString(),
        path: cookie.path,
        secure: cookie.secure,
        value: cookie.value,
      };
    }),
    rejectPublicSuffixes: true,
    storeType: 'MemoryCookieStore',
    version: 'tough-cookie@2.0.0',
  };
};
