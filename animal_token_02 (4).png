(function () {
  if (window.__RecoveryAdvisorLoaded) return;
  window.__RecoveryAdvisorLoaded = true;

  var script = document.currentScript;
  var src = script && script.getAttribute("data-src") ? script.getAttribute("data-src") : "/chatbot/embed";

  var container = document.createElement("div");
  container.setAttribute("id", "recovery-advisor-container");
  container.style.position = "fixed";
  container.style.right = "20px";
  container.style.bottom = "20px";
  container.style.zIndex = "2147483647";
  container.style.width = "420px";
  container.style.maxWidth = "calc(100vw - 24px)";
  container.style.height = "680px";
  container.style.maxHeight = "calc(100vh - 24px)";
  container.style.border = "0";

  var iframe = document.createElement("iframe");
  iframe.src = src;
  iframe.title = "Recovery Advisor";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "0";
  iframe.style.borderRadius = "24px";
  iframe.style.boxShadow = "0 24px 80px rgba(15, 23, 42, 0.18)";
  iframe.setAttribute("allow", "clipboard-write");

  container.appendChild(iframe);
  document.body.appendChild(container);
})();
