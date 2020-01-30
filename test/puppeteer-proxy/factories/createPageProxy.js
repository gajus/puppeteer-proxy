// @flow

import test from 'ava';
import sinon from 'sinon';
import getPort from 'get-port';
import createPageProxy from '../../../src/factories/createPageProxy';
import createHttpProxyServer from '../../helpers/createHttpProxyServer';
import createHttpServer from '../../helpers/createHttpServer';
import createPage from '../../helpers/createPage';

const proxyRequest = (page, pageProxy) => {
  page.on('request', async (request) => {
    try {
      await pageProxy.proxyRequest(request);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('proxy request error', error);

      request.abort();
    }
  });
};

test('makes a HTTP request (without proxy)', async (t) => {
  t.plan(2);

  const requestHandler = sinon.stub().callsFake((incomingRequest, outgoingRequest) => {
    outgoingRequest.end('foo');
  });

  const httpServer = await createHttpServer(requestHandler);

  await createPage(async (page) => {
    const response = await page.goto(httpServer.url);

    t.is(await response.text(), 'foo');
  });

  t.true(requestHandler.called);
});

test('proxies a GET request', async (t) => {
  t.plan(2);

  const requestHandler = sinon.stub().callsFake((incomingRequest, outgoingRequest) => {
    outgoingRequest.end('foo');
  });

  const httpServer = await createHttpServer(requestHandler);

  const httpProxyServer = await createHttpProxyServer();

  await createPage(async (page) => {
    const pageProxy = createPageProxy({
      page,
      proxyUrl: httpProxyServer.url,
    });

    await page.setRequestInterception(true);

    proxyRequest(page, pageProxy);

    const response = await page.goto(httpServer.url);

    t.is((await response.headers())['x-foo'], 'bar');
  });

  t.true(requestHandler.called);
});

test('handles HTTP errors (unreachable server)', async (t) => {
  t.plan(2);

  await createPage(async (page) => {
    const pageProxy = createPageProxy({
      page,
      proxyUrl: 'http://127.0.0.1:' + await getPort(),
    });

    await page.setRequestInterception(true);

    proxyRequest(page, pageProxy);

    const error = await t.throwsAsync(page.goto('http://127.0.0.1'));

    t.is(error.message, 'net::ERR_FAILED at http://127.0.0.1');
  });
});

test('sets cookies for the succeeding proxy requests', async (t) => {
  t.plan(4);

  const requestHandler = sinon.stub()
    .onCall(0)
    .callsFake((incomingRequest, outgoingRequest) => {
      outgoingRequest.setHeader('set-cookie', 'foo=bar');
      outgoingRequest.end('foo');
    })
    .onCall(1)
    .callsFake((incomingRequest, outgoingRequest) => {
      t.is(incomingRequest.headers.cookie, 'foo=bar');

      outgoingRequest.end('bar');
    });

  const httpServer = await createHttpServer(requestHandler);

  const httpProxyServer = await createHttpProxyServer();

  await createPage(async (page) => {
    const pageProxy = createPageProxy({
      page,
      proxyUrl: httpProxyServer.url,
    });

    await page.setRequestInterception(true);

    proxyRequest(page, pageProxy);

    t.deepEqual(await page.cookies(), []);

    await page.goto(httpServer.url);

    t.deepEqual(await page.cookies(), [
      {
        domain: 'localhost',
        expires: -1,
        httpOnly: false,
        name: 'foo',
        path: '/',
        secure: false,
        session: true,
        size: 6,
        value: 'bar',
      },
    ]);

    await page.goto(httpServer.url);
  });

  t.is(requestHandler.callCount, 2);
});

test('inherits cookies from Page object', async (t) => {
  t.plan(2);

  const requestHandler = sinon
    .stub()
    .callsFake((incomingRequest, outgoingRequest) => {
      t.is(incomingRequest.headers.cookie, 'foo=bar');

      outgoingRequest.end('foo');
    });

  const httpServer = await createHttpServer(requestHandler);

  const httpProxyServer = await createHttpProxyServer();

  await createPage(async (page) => {
    await page.setCookie({
      domain: 'localhost',
      name: 'foo',
      value: 'bar',
    });

    const pageProxy = createPageProxy({
      page,
      proxyUrl: httpProxyServer.url,
    });

    await page.setRequestInterception(true);

    proxyRequest(page, pageProxy);

    await page.goto(httpServer.url);
  });

  t.is(requestHandler.callCount, 1);
});
