function getRawAPI() {
  return globalThis.browser ?? globalThis.chrome;
}

function usesChromeCallbacks() {
  return !globalThis.browser && Boolean(globalThis.chrome);
}

const CALLBACK_METHODS = {
  tabs: new Set([
    'query',
    'sendMessage',
  ]),
  scripting: new Set([
    'executeScript',
  ]),
  runtime: new Set([
    'openOptionsPage',
  ]),
  storage: new Set([
    'get',
    'set',
    'remove',
    'clear',
  ]),
};

function expectsCallback(namespace, method) {
  return (
    usesChromeCallbacks() &&
    CALLBACK_METHODS[namespace]?.has(method)
  );
}

function assertBrowserAPI() {
  if (!getRawAPI()) {
    throw new Error('No se encontró una API de extensión compatible.');
  }
}

function chromeLastError() {
  const message = getRawAPI()?.runtime?.lastError?.message;
  return message ? new Error(message) : null;
}

function errorPayload(error) {
  return { error: error?.message ?? String(error) };
}
function storageCall(method, ...args) {
  assertBrowserAPI();
  const target = getRawAPI().storage.local;

  return performCall(
    target,
    method,
    args,
    `storage.local.${method}`,
    expectsCallback('storage', method),
  );
}

function callAPI(namespace, method, ...args) {
  assertBrowserAPI();

  const target = getRawAPI()[namespace];

  return performCall(
    target,
    method,
    args,
    `${namespace}.${method}`,
    expectsCallback(namespace, method),
  );
}

function performCall(target, method, args, context, shouldUseCallback) {
  const fn = target?.[method];

  if (typeof fn !== 'function') {
    return Promise.reject(new Error(`API no disponible: ${context}`));
  }

  return shouldUseCallback
    ? performCallbackCall(fn, target, args)
    : performPromiseCall(fn, target, args);
}

function performCallbackCall(fn, target, args) {
  return new Promise((resolve, reject) => {
    fn.apply(target, [
      ...args,
      (callbackResult) => {
        const error = chromeLastError();
        if (error) {
          reject(error);
        } else {
          resolve(callbackResult);
        }
      },
    ]);
  });
}

function performPromiseCall(fn, target, args) {
  try {
    const result = fn.apply(target, args);
    return result && typeof result.then === 'function'
      ? result
      : Promise.resolve(result);
  } catch (err) {
    return Promise.reject(err);
  }
}


export function addRuntimeMessageListener(handler) {
  assertBrowserAPI();

  getRawAPI().runtime.onMessage.addListener((message, sender, sendResponse) => {
    let response;

    try {
      response = handler(message, sender);
    } catch (error) {
      const payload = errorPayload(error);

      if (usesChromeCallbacks()) {
        sendResponse(payload);
        return false;
      }

      return payload;
    }

    if (!response || typeof response.then !== 'function') {
      return response;
    }

    if (!usesChromeCallbacks()) {
      return response;
    }

    response
      .then(sendResponse)
      .catch(error => sendResponse(errorPayload(error)));

    return true;
  });
}

export const browserAPI = {
  tabs: {
    query: (...args) => callAPI('tabs', 'query', ...args),
    sendMessage: (...args) => callAPI('tabs', 'sendMessage', ...args),
  },
  scripting: {
    executeScript: (...args) => callAPI('scripting', 'executeScript', ...args),
  },
  runtime: {
    openOptionsPage: (...args) => callAPI('runtime', 'openOptionsPage', ...args),
    getManifest: () => {
      assertBrowserAPI();
      return getRawAPI().runtime.getManifest();
    },
  },
  storage: {
    get: (...args) => storageCall('get', ...args),
    set: (...args) => storageCall('set', ...args),
    remove: (...args) => storageCall('remove', ...args),
    clear: (...args) => storageCall('clear', ...args),
  },
};
