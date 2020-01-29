// @flow

import {
  promisify,
} from 'util';
import {
  ProxyServer,
} from 'anyproxy';
import getPort from 'get-port';

export default async () => {
  const port = await getPort();

  const httpProxyServer = new ProxyServer({
    dangerouslyIgnoreUnauthorized: true,
    forceProxyHttps: true,
    port,
    rule: {
      beforeSendResponse: (request, response) => {
        return {
          ...response,
          response: {
            ...response.response,
            header: {
              ...response.response.header,
              'x-foo': 'bar',
            },
          },
        };
      },
    },
    silent: false,
  });

  const controller = {
    stop: () => {
      return promisify(httpProxyServer.close.bind(httpProxyServer))();
    },
    url: 'http://127.0.0.1:' + port,
  };

  const result = new Promise((resolve, reject) => {
    httpProxyServer.on('ready', () => {
      resolve(controller);
    });

    httpProxyServer.on('error', (error) => {
      reject(error);
    });
  });

  httpProxyServer.start();

  return result;
};
