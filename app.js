/* Site behavior: offline support, home-screen app mode, and the install tip */
(function () {
  'use strict';

  var root = document.documentElement;

  // 1. Offline support
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }

  // 2. App mode: opened from the home screen
  var isStandalone =
    window.navigator.standalone === true ||
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  if (isStandalone) root.classList.add('standalone');

  // 3. Install tip (homepage only, never in app mode)
  var tip = document.getElementById('install-tip');
  if (!tip || isStandalone) return;

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
  }

  function hide() {
    tip.hidden = true;
    remember();
  }

  tip.querySelector('.install-close').addEventListener('click', hide);

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

  window.addEventListener('appinstalled', function () {
    tip.hidden = true;
    remember();
  });
})();
