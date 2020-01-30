// @flow

import type {
  PuppeteerCookieType,
  ToughCookiePayloadType,
} from '../types';

export default (cookieJar: ToughCookiePayloadType): $ReadOnlyArray<PuppeteerCookieType> => {
  return cookieJar.cookies.map((cookie) => {
    return {
      domain: cookie.domain,
      expires: cookie.expires ? Math.round(new Date(cookie.expires).getTime() / 1000) : -1,
      httpOnly: cookie.httpOnly,
      name: cookie.key,
      path: cookie.path,
      sameSite: 'Lax',
      secure: cookie.secure,
      session: false,
      size: cookie.value.length,
      value: cookie.value,
    };
  });
};
