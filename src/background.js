if (typeof browser === 'undefined') {
  (function (global) {
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
        }
      },
      downloads: {
        download: promisify(chrome.downloads.download.bind(chrome.downloads)),
        onChanged: chrome.downloads.onChanged
      }
    };
  })(typeof window !== 'undefined' ? window : globalThis);
}

var API_BASE = 'https://mods.factorio.com';
var CDN_BASE = 'https://mods-storage.re146.dev';

browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  switch (message.action) {
    case 'download':
      handleDownload(message, sender)
        .then(sendResponse)
        .catch(function (err) {
          sendResponse({ success: false, error: err.message || 'Unknown error' });
        });
      return true;

    case 'getStatus':
      getStatus()
        .then(sendResponse)
        .catch(function (err) {
          sendResponse({ success: false, error: err.message });
        });
      return true;

    default:
      sendResponse({ success: false, error: 'Unknown action: ' + message.action });
  }
});

async function handleDownload(message, sender) {
  var fileId = message.fileId;
  if (!fileId) {
    throw new Error('Missing fileId');
  }

  var version = await getLatestVersion(fileId);
  if (!version) {
    throw new Error('Could not determine latest version for ' + fileId);
  }

  var downloadUrl = CDN_BASE + '/' + encodeURIComponent(fileId) + '/' + encodeURIComponent(version) + '.zip';

  var downloadId = await browser.downloads.download({
    url: downloadUrl,
    conflictAction: 'uniquify'
  });

  console.log('[FacMod] Download started:', { fileId: fileId, version: version, downloadId: downloadId });

  return {
    success: true,
    downloadUrl: downloadUrl,
    fileId: fileId,
    version: version,
    downloadId: downloadId
  };
}

async function getLatestVersion(modName) {
  var url = API_BASE + '/api/mods/' + encodeURIComponent(modName);
  var response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch mod info: ' + response.status);
  }

  var data = await response.json();
  if (!data.releases || data.releases.length === 0) {
    throw new Error('No releases found for ' + modName);
  }

  var releases = data.releases.slice();
  releases.sort(function (a, b) {
    var pa = a.version.split('.').map(Number);
    var pb = b.version.split('.').map(Number);
    for (var i = 0; i < Math.max(pa.length, pb.length); i++) {
      var na = pa[i] || 0;
      var nb = pb[i] || 0;
      if (na !== nb) return na - nb;
    }
    return 0;
  });

  return releases[releases.length - 1].version;
}

async function getStatus() {
  var data = await browser.storage.local.get(['accessToken']);
  return {
    success: true,
    installed: true,
    version: browser.runtime.getManifest().version,
    authenticated: !!data.accessToken
  };
}

browser.runtime.onInstalled.addListener(function (details) {
  console.log('[FacMod] Installed:', details.reason, details.previousVersion);
  browser.storage.local.set({
    installedAt: Date.now(),
    version: browser.runtime.getManifest().version
  });
});
