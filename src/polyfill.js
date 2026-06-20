(function (global) {
  if (typeof browser !== 'undefined') return;

  var promisify = function (fn) {
    return function () {
      var args = Array.prototype.slice.call(arguments);
      return new Promise(function (resolve, reject) {
        args.push(function () {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(arguments.length <= 1 ? arguments[0] : Array.prototype.slice.call(arguments));
          }
        });
        fn.apply(null, args);
      });
    };
  };

  global.browser = {
    runtime: {
      sendMessage: promisify(chrome.runtime.sendMessage.bind(chrome.runtime)),
      onMessage: chrome.runtime.onMessage,
      onConnect: chrome.runtime.onConnect,
      connect: function (info) { return chrome.runtime.connect(info); },
      id: chrome.runtime.id,
      getManifest: function () { return chrome.runtime.getManifest(); },
      getURL: function (path) { return chrome.runtime.getURL(path); }
    },
    storage: {
      local: {
        get: promisify(chrome.storage.local.get.bind(chrome.storage.local)),
        set: promisify(chrome.storage.local.set.bind(chrome.storage.local)),
        remove: promisify(chrome.storage.local.remove.bind(chrome.storage.local)),
        clear: promisify(chrome.storage.local.clear.bind(chrome.storage.local))
      },
      sync: {
        get: promisify(chrome.storage.sync.get.bind(chrome.storage.sync)),
        set: promisify(chrome.storage.sync.set.bind(chrome.storage.sync)),
        remove: promisify(chrome.storage.sync.remove.bind(chrome.storage.sync))
      }
    },
    downloads: {
      download: promisify(chrome.downloads.download.bind(chrome.downloads)),
      onChanged: chrome.downloads.onChanged
    },
    tabs: {
      query: promisify(chrome.tabs.query.bind(chrome.tabs)),
      create: promisify(chrome.tabs.create.bind(chrome.tabs)),
      update: promisify(chrome.tabs.update.bind(chrome.tabs))
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
