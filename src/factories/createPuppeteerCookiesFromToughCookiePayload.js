// @flow

import type {
  PuppeteerCookieType,
  ToughCookiePayloadType,
} from '../types';

export default (cookieJar: ToughCookiePayloadType): $ReadOnlyArray<PuppeteerCookieType> => {
  return cookieJar.cookies.map((cookie) => {
    return {
      domain: cookie.domain,
      expires: cookie.expires ? new Date(cookie.expires).getTime() / 1000 : Date.now() / 1000 + 60 * 60,
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
