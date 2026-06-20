(function () {
  "use strict";

  var BTN_CLASS = "facmod-download-btn";

  function getModId(href) {
    var m = href.match(/\/mod\/([^/?]+)/);
    return m ? m[1] : null;
  }

  function createButton(modId) {
    var btn = document.createElement("a");
    btn.className = BTN_CLASS;
    btn.textContent = "Download via FacMod";
    btn.href =
      "https://re146.dev/factorio/mods/en#https://mods.factorio.com/mod/" +
      encodeURIComponent(modId);
    btn.target = "_blank";
    btn.style.cssText =
      "display:inline-flex;align-items:center;gap:6px;padding:8px 16px;" +
      "background:#e67e22;color:#fff;border:none;border-radius:4px;" +
      "cursor:pointer;font:inherit;font-size:14px;text-decoration:none;";
    return btn;
  }

  function inject() {
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
      container.appendChild(createButton(modId));
      console.log("[FacMod] Button injected for:", modId);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();
