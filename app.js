/* Site behavior: offline support, home-screen app mode, print button, the scroll-loaded map, the category bar, and the install tip */
(function () {
  'use strict';

  var root = document.documentElement;

  // 1. Offline support. The pages' Content-Security-Policy requires Trusted
  // Types, so in browsers that support them the worker's address has to come
  // from this policy, which only ever allows /sw.js. If the policy can't be
  // created, skip offline support so the rest of this file still runs.
  if ('serviceWorker' in navigator) {
    var swUrl = '/sw.js';
    if (window.trustedTypes && window.trustedTypes.createPolicy) {
      try {
        swUrl = window.trustedTypes.createPolicy('marvins-sw', {
          createScriptURL: function (url) {
            if (url === '/sw.js') return url;
            throw new TypeError('Only /sw.js can be registered');
          }
        }).createScriptURL('/sw.js');
      } catch (e) {
        swUrl = null;
      }
    }
    if (swUrl) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register(swUrl).catch(function () {});
      });
    }
  }

  // 2. App mode: opened from the home screen
  var isStandalone =
    window.navigator.standalone === true ||
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  if (isStandalone) root.classList.add('standalone');

  // 3. Print button (homepage only)
  var printBtn = document.querySelector('.print-btn');
  if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

  // 4. Map: the Google Maps embed loads just before the Location section scrolls
  // into view, so visitors who never get that far load nothing from Google
  var mapFrame = document.querySelector('.map-frame');
  if (mapFrame) {
    var loadMap = function () {
      if (navigator.onLine === false) {
        mapFrame.querySelector('.map-status').textContent = 'The map needs an internet connection';
        window.addEventListener('online', loadMap, { once: true });
        return;
      }
      var frame = document.createElement('iframe');
      frame.src = mapFrame.getAttribute('data-map-src');
      frame.title = "Map to Marvin's at 202 S College Ave";
      frame.setAttribute('allowfullscreen', '');
      // Set before the frame is added, since it starts loading then. The
      // sandbox lets the map run as Google's own site and open Google Maps in a
      // new tab, and nothing else: no forms, downloads, dialogs, or taking over
      // this page. (Without allow-same-origin, Google's map code throws errors.)
      // credentialless (Chromium browsers on computers and Android; Firefox and
      // Safari ignore it, as does every iPhone/iPad browser, since they all use
      // Safari's engine) loads the map without the visitor's Google cookies
      // and throws away what it saves on leaving.
      frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox');
      frame.setAttribute('credentialless', '');
      mapFrame.replaceWith(frame);
    };

    if ('IntersectionObserver' in window) {
      var mapObserver = new IntersectionObserver(function (entries) {
        if (!entries.some(function (e) { return e.isIntersecting; })) return;
        mapObserver.disconnect();
        loadMap();
      }, { rootMargin: '300px' });
      mapObserver.observe(mapFrame);
    } else {
      loadMap();
    }
  }

  // 5. Category bar (homepage only): on narrow screens the bar scrolls
  // sideways, and browsers don't scroll it for a link that's only partly in
  // view, so its edge and focus outline stay cut off. When a link gets focus,
  // scroll the bar just enough to show all of it. This moves the list itself
  // (not scrollIntoView), so the page never scrolls up or down, and it jumps
  // straight there with no animation.
  var catList = document.querySelector('.cat-nav ul');
  if (catList) {
    catList.addEventListener('focusin', function (e) {
      if (e.target.tagName !== 'A') return;
      var bar = catList.getBoundingClientRect();
      var link = e.target.getBoundingClientRect();
      if (link.left < bar.left) catList.scrollLeft -= Math.ceil(bar.left - link.left);
      else if (link.right > bar.right) catList.scrollLeft += Math.ceil(link.right - bar.right);
    });
  }

  // 6. Install tip (homepage only, never in app mode)
  var tip = document.getElementById('install-tip');
  if (!tip || isStandalone) return;

  // When the tip appears, a hidden status line (role="status") gets one short
  // sentence for screen readers, matching the tip's version. Keyboard focus
  // stays where it is. The line is emptied whenever the tip is hidden.
  var tipStatus = document.getElementById('install-tip-status');
  var ANNOUNCE = {
    'ios-safari': "Tip: you can add Marvin's to your home screen from Safari's Share menu.",
    'ios-chrome': "Tip: you can add Marvin's to your home screen with the Share button in Chrome's address bar.",
    'ios-other': "Tip: you can add Marvin's to your home screen from your browser's Share menu.",
    'android': "Tip: you can install Marvin's on your home screen with the Install button at the bottom of the screen."
  };

  var KEY = 'marvins-install-tip-dismissed';
  var SNOOZE_DAYS = 30;

  function dismissedRecently() {
    try {
      var t = Number(localStorage.getItem(KEY));
      return t && (Date.now() - t) < SNOOZE_DAYS * 864e5;
    } catch (e) { return false; }
  }

  function remember() {
    try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {}
  }

  function show(mode) {
    if (dismissedRecently()) return;
    tip.setAttribute('data-mode', mode);
    tip.hidden = false;
    if (tipStatus) tipStatus.textContent = ANNOUNCE[mode] || '';
  }

  function hide() {
    tip.hidden = true;
    if (tipStatus) tipStatus.textContent = '';
    remember();
  }

  tip.querySelector('.install-close').addEventListener('click', hide);
  // Escape closes the tip like its x button (same 30-day snooze), but only
  // while it's showing
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !tip.hidden) hide();
  });

  // iPhone / iPad: Safari never offers to install, so explain the Share menu
  var ua = navigator.userAgent;
  var isIOS = /iPhone|iPad|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS) {
    // In-app browsers (Facebook, Instagram, etc.) can't add sites to the home screen
    if (/FBAN|FBAV|Instagram|Snapchat|LinkedInApp|Line\/|Twitter|TikTok/i.test(ua)) return;
    var mode = /CriOS/.test(ua) ? 'ios-chrome'
      : /FxiOS|EdgiOS|OPiOS|DuckDuckGo|GSA\//.test(ua) ? 'ios-other'
      : 'ios-safari';
    setTimeout(function () { show(mode); }, 2500);
    return;
  }

  // Android: the browser can install directly from a button.
  // (Desktop Chrome offers this too, but the tip is meant for phones.)
  if (!/Android/i.test(ua)) return;
  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    show('android');
  });

  tip.querySelector('.install-btn').addEventListener('click', function () {
    if (!deferred) return;
    deferred.prompt();
    deferred.userChoice.then(function () { deferred = null; hide(); });
  });

  window.addEventListener('appinstalled', hide);
})();
