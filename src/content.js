(function () {
  'use strict';

  var BTN_CLASS = 'facmod-download-btn';

  function getModId(href) {
    var m = href.match(/\/mod\/([^/?]+)/);
    return m ? m[1] : null;
  }

  function createButton(modId, version) {
    var btn = document.createElement('button');
    btn.className = BTN_CLASS;
    btn.textContent = 'FacMod';
    btn.type = 'button';
    btn.style.cssText =
      'display:inline-flex;align-items:center;gap:6px;padding:4px 10px;' +
      'background:#e67e22;color:#fff;border:none;border-radius:4px;' +
      'cursor:pointer;font:inherit;font-size:13px;text-decoration:none;' +
      'margin-left:6px;white-space:nowrap;';

    var animInterval;
    var animFrames = ['', '.', '..', '...', '..', '.'];

    function startAnim() {
      var i = 0;
      btn.disabled = true;
      btn.textContent = animFrames[0];
      animInterval = setInterval(function () {
        i = (i + 1) % animFrames.length;
        btn.textContent = animFrames[i];
      }, 200);
    }

    function reset() {
      if (animInterval) { clearInterval(animInterval); animInterval = null; }
      btn.disabled = false;
      btn.textContent = 'FacMod';
      btn.style.background = '#e67e22';
    }

    btn.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      startAnim();

      var msg = { action: 'download', fileId: modId };
      if (version) { msg.version = version; }

      browser.runtime.sendMessage(msg).then(function (response) {
        reset();
      }).catch(function (err) {
        reset();
        console.error('[FacMod] Message error:', err);
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
      var downloadCell = cells[2];
      downloadCell.appendChild(createButton(modId, version));
      console.log('[FacMod] Added version row button:', modId, version);
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
      console.log('[FacMod] Button injected for:', modId);
    });
  }

  function inject() {
    injectModPage();
    injectVersionsPage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
