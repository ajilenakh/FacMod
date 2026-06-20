(function () {
  "use strict";

  var BTN_CLASS = "facmod-download-btn";

  function getModId(href) {
    var m = href.match(/\/mod\/([^/?]+)/);
    return m ? m[1] : null;
  }

  function createButton(href) {
    var btn = document.createElement("a");
    btn.className = BTN_CLASS;
    btn.textContent = "FacMod";
    btn.href = href;
    btn.target = "_blank";
    btn.style.cssText =
      "display:inline-flex;align-items:center;gap:6px;padding:4px 10px;" +
      "background:#e67e22;color:#fff;border:none;border-radius:4px;" +
      "cursor:pointer;font:inherit;font-size:13px;text-decoration:none;" +
      "margin-left:6px;white-space:nowrap;";
    return btn;
  }

  function injectDownloadPage() {
    var modId = getModId(window.location.pathname);
    if (!modId) return;

    var rows = document.querySelectorAll(".mod-page-downloads-table tbody tr");
    rows.forEach(function (row) {
      if (row.querySelector("." + BTN_CLASS)) return;

      var cells = row.querySelectorAll("td");
      if (cells.length < 3) return;

      var version = cells[0].textContent.trim();
      if (!version) return;

      var downloadCell = cells[2];
      var link =
        "https://mods-storage.re146.dev/" +
        encodeURIComponent(modId) +
        "/" +
        encodeURIComponent(version) +
        ".zip";
      downloadCell.appendChild(createButton(link));
      console.log("[FacMod] Added button:", modId, version);
    });
  }

  function injectModPage() {
    var containers = document.querySelectorAll(".mod-download-button");
    containers.forEach(function (container) {
      if (container.querySelector("." + BTN_CLASS)) return;

      var link = container.querySelector('a[href*="/mod/"]');
      if (!link) return;

      var modId = getModId(link.getAttribute("href"));
      if (!modId) return;

      container.style.display = "flex";
      container.style.alignItems = "center";
      container.style.gap = "8px";
      container.appendChild(
        createButton(
          "https://re146.dev/factorio/mods/en#https://mods.factorio.com/mod/" +
            encodeURIComponent(modId),
        ),
      );
      console.log("[FacMod] Button injected for:", modId);
    });
  }

  function inject() {
    injectModPage();
    injectDownloadPage();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();
