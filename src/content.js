(function () {
  'use strict';

  var BTN_CLASS = 'facmod-download-btn';

  try {
    var s = document.createElement('style');
    s.textContent =
      '.' + BTN_CLASS + '{' +
        'display:inline-flex;align-items:center;gap:6px;' +
        'padding:7px 15px;margin-left:6px;' +
        'background:linear-gradient(180deg,#e67e22 0%,#d35400 100%);' +
        'color:#fff;border:none;border-radius:3px;' +
        'cursor:pointer;font:inherit;font-size:13px;' +
        'text-decoration:none;white-space:nowrap;' +
        'line-height:normal;box-shadow:inset 0 1px 0 rgba(255,255,255,0.2);' +
        'transition:background 0.15s;' +
      '}' +
      '.' + BTN_CLASS + ':hover{' +
        'background:linear-gradient(180deg,#f39c12 0%,#e67e22 100%);' +
      '}' +
      '.' + BTN_CLASS + ':active{' +
        'background:linear-gradient(180deg,#d35400 0%,#c0392b 100%);' +
        'box-shadow:inset 0 2px 4px rgba(0,0,0,0.2);' +
      '}' +
      '.' + BTN_CLASS + ':disabled{' +
        'opacity:0.7;cursor:default;' +
      '}';
    document.head.appendChild(s);
  } catch (_) {}

  function getModId(href) {
    var m = href.match(/\/mod\/([^/?]+)/);
    return m ? m[1] : null;
  }

  function sendDownload(modId, version) {
    var msg = { action: 'download', fileId: modId };
    if (version) { msg.version = version; }
    return browser.runtime.sendMessage(msg);
  }

  function createButton(modId, version) {
    var btn = document.createElement('button');
    btn.className = BTN_CLASS;
    btn.type = 'button';

    var icon = document.createElement('i');
    icon.className = 'fa fa-download';
    icon.setAttribute('aria-hidden', 'true');
    btn.appendChild(icon);
    btn.appendChild(document.createTextNode(' FacMod'));

    var animInterval;
    var animFrames = ['', '.', '..', '...', '..', '.'];

    function startAnim() {
      btn.disabled = true;
      var i = 0;
      while (btn.firstChild) { btn.removeChild(btn.firstChild); }
      btn.appendChild(document.createTextNode(animFrames[0]));
      animInterval = setInterval(function () {
        i = (i + 1) % animFrames.length;
        while (btn.firstChild) { btn.removeChild(btn.firstChild); }
        btn.appendChild(document.createTextNode(animFrames[i]));
      }, 200);
    }

    function reset() {
      if (animInterval) { clearInterval(animInterval); animInterval = null; }
      btn.disabled = false;
      while (btn.firstChild) { btn.removeChild(btn.firstChild); }
      var ic = document.createElement('i');
      ic.className = 'fa fa-download';
      ic.setAttribute('aria-hidden', 'true');
      btn.appendChild(ic);
      btn.appendChild(document.createTextNode(' FacMod'));
    }

    btn.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      startAnim();

      sendDownload(modId, version).then(function () {
        reset();
      }).catch(function (err) {
        reset();
        console.error('[FacMod] Error:', err);
      });
    });

    return btn;
  }

  function injectVersionsPage() {
    var modId = getModId(window.location.pathname);
    if (!modId) return;

    var rows = document.querySelectorAll('.mod-page-downloads-table tbody tr');
    rows.forEach(function (row) {
      if (row.querySelector('.' + BTN_CLASS)) return;

      var cells = row.querySelectorAll('td');
      if (cells.length < 3) return;

      var version = cells[0].textContent.trim();
      cells[2].appendChild(createButton(modId, version));
    });
  }

  function injectModPage() {
    var containers = document.querySelectorAll('.mod-download-button');
    containers.forEach(function (container) {
      if (container.querySelector('.' + BTN_CLASS)) return;

      var link = container.querySelector('a[href*="/mod/"]');
      if (!link) return;

      var modId = getModId(link.getAttribute('href'));
      if (!modId) return;

      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.gap = '8px';
      container.appendChild(createButton(modId));
    });
  }

  function inject() {
    try {
      injectModPage();
      injectVersionsPage();
    } catch (e) {
      console.error('[FacMod] Inject error:', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

  document.addEventListener('htmx:afterSettle', inject);
})();
