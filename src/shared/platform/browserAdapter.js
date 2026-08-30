const rawBrowserAPI = globalThis.browser ?? globalThis.chrome;
const usesChromeCallbacks = !globalThis.browser && Boolean(globalThis.chrome);

function assertBrowserAPI() {
  if (!rawBrowserAPI) {
    throw new Error('No se encontro una API de extension compatible.');
  }
}

function chromeLastError() {
  const message = rawBrowserAPI?.runtime?.lastError?.message;
  return message ? new Error(message) : null;
}

function errorPayload(error) {
  return { error: error?.message ?? String(error) };
}

function callAPI(namespace, method, ...args) {
  assertBrowserAPI();

  const target = rawBrowserAPI[namespace];
  const fn = target?.[method];

  if (typeof fn !== 'function') {
    return Promise.reject(new Error(`API no disponible: ${namespace}.${method}`));
  }

  return new Promise((resolve, reject) => {
    if (!usesChromeCallbacks) {
      resolve(fn.apply(target, args));
      return;
    }

    fn.apply(target, [
      ...args,
      (result) => {
        const error = chromeLastError();

        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      },
    ]);
  });
}

export function addRuntimeMessageListener(handler) {
  assertBrowserAPI();

  rawBrowserAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
    let response;

    try {
      response = handler(message, sender);
    } catch (error) {
      const payload = errorPayload(error);

      if (usesChromeCallbacks) {
        sendResponse(payload);
        return false;
      }

      return payload;
    }

    if (!response || typeof response.then !== 'function') {
      return response;
    }

    if (!usesChromeCallbacks) {
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
  storage: {
    local: {
      get: (...args) => callAPI('storage', 'local', 'get', ...args),
      set: (...args) => callAPI('storage', 'local', 'set', ...args),
      remove: (...args) => callAPI('storage', 'local', 'remove', ...args),
    },
  },
};
