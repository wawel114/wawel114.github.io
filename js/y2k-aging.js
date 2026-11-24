/*
 * /y2k/ 展示台的「皮肤切换 + 手动做旧」控制台
 * ------------------------------------------------------------------
 * 只在 body 带 post-style-y2kfull 的页面生效，其他页面直接返回，无副作用。
 * 控制台注入到 body 根节点（而不是 .y2k-wrap 里），这样它既不被做旧滤镜
 * 糊掉，position:fixed 也不会被 filter 创建的包含块影响。
 *
 * 两套皮肤：
 *   dream  中式梦核 / 旧核（默认，怀旧档）
 *   aero   Frutiger Aero（默认「如新」，手动做旧 = 过期的未来）
 * 皮肤真值源是 html.y2k-skin-aero；页面内容里有一段先行脚本会在解析前
 * 按 localStorage 设置它，避免先闪一下旧核。本脚本负责同步按钮状态、
 * 响应点击，并在用户「从没手动调过做旧」时按皮肤自动切换默认档。
 *
 * 五个滑块写 --age-* CSS 变量，值记在 localStorage，下次打开保持；
 * 一旦用户手动调过（touched=1），切皮肤就不再改动他的做旧设置。
 */
(function () {
  'use strict';

  function init() {
    if (!document.body.classList.contains('post-style-y2kfull')) return;
    var wrap = document.querySelector('.y2k-wrap');
    if (!wrap) return;

    var KEY = 'y2k-aging-v1';
    var KEY_SKIN = 'y2k-skin';
    var KEY_TOUCHED = 'y2k-aging-touched';
    var DEFAULTS = { sepia: 38, grain: 46, fade: 34, haze: 30, scan: 32 };
    var LABELS = { sepia: '泛黄', grain: '颗粒', fade: '褪色', haze: '柔光', scan: '扫描线' };
    var PRESETS = {
      'default': DEFAULTS,
      'new': { sepia: 0, grain: 0, fade: 0, haze: 0, scan: 0 },
      'old': { sepia: 74, grain: 82, fade: 68, haze: 58, scan: 64 }
    };

    var isAero = document.documentElement.classList.contains('y2k-skin-aero');
    var touched = false;
    try { touched = localStorage.getItem(KEY_TOUCHED) === '1'; } catch (e) { /* 隐私模式忽略 */ }

    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { /* 忽略 */ }
    // 没手动调过时，按当前皮肤给默认档：旧核=怀旧，Aero=如新
    var base = touched ? (saved || PRESETS['default'])
                       : (isAero ? PRESETS['new'] : PRESETS['default']);
    var state = {};
    Object.keys(DEFAULTS).forEach(function (k) {
      state[k] = base && typeof base[k] === 'number' ? base[k] : DEFAULTS[k];
    });

    var rows = Object.keys(DEFAULTS).map(function (k) {
      return '<label>' + LABELS[k] +
        ' <input type="range" data-age="' + k + '" min="0" max="100" value="' + state[k] + '">' +
        '<output>' + state[k] + '</output></label>';
    }).join('');

    var box = document.createElement('div');
    box.className = 'y2k-aging';
    box.innerHTML =
      '<button type="button" class="y2k-aging-toggle" aria-expanded="false">⚙ 手动做旧</button>' +
      '<div class="y2k-aging-panel y2k-window" hidden>' +
        '<div class="y2k-titlebar"><span class="y2k-aging-title">做旧控制台 · 显影室</span>' +
          '<span class="y2k-btns"><i>_</i><i>×</i></span></div>' +
        '<div class="y2k-window-body">' +
          rows +
          '<div class="y2k-aging-btns">' +
            '<button type="button" data-age-preset="new">恢复如新</button>' +
            '<button type="button" data-age-preset="old">一键做旧</button>' +
            '<button type="button" data-age-preset="default">默认怀旧</button>' +
          '</div>' +
          '<p class="y2k-aging-note">滑块只对这个页面生效，设置会记在这台浏览器里。' +
            '想加照片，丢进 <code>source/images/y2k/</code>（旧核）或 ' +
            '<code>source/images/aero/</code>（Aero）再发布即可。</p>' +
        '</div>' +
      '</div>';
    document.body.appendChild(box);

    var panel = box.querySelector('.y2k-aging-panel');
    var toggle = box.querySelector('.y2k-aging-toggle');
    var panelTitle = box.querySelector('.y2k-aging-title');
    var skinBtns = document.querySelectorAll('[data-skin-btn]');

    function apply() {
      Object.keys(DEFAULTS).forEach(function (k) {
        wrap.style.setProperty('--age-' + k, (state[k] / 100).toFixed(3));
      });
      Array.prototype.forEach.call(box.querySelectorAll('input[type="range"]'), function (inp) {
        var k = inp.getAttribute('data-age');
        inp.value = state[k];
        var o = inp.parentNode.querySelector('output');
        if (o) o.textContent = state[k];
      });
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* 隐私模式下忽略 */ }
    }

    function markTouched() {
      touched = true;
      try { localStorage.setItem(KEY_TOUCHED, '1'); } catch (e) { /* 忽略 */ }
    }

    function syncSkinUI() {
      Array.prototype.forEach.call(skinBtns, function (b) {
        var on = b.getAttribute('data-skin-btn') === (isAero ? 'aero' : 'dream');
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      if (panelTitle) {
        panelTitle.textContent = isAero ? '时光机 · 把未来做旧' : '做旧控制台 · 显影室';
      }
    }

    function setSkin(name) {
      isAero = (name === 'aero');
      document.documentElement.classList.toggle('y2k-skin-aero', isAero);
      try { localStorage.setItem(KEY_SKIN, isAero ? 'aero' : 'dream'); } catch (e) { /* 忽略 */ }
      syncSkinUI();
      // 用户没手动调过时，跟着皮肤换默认档；调过就完全尊重他的设置
      if (!touched) {
        var p = isAero ? PRESETS['new'] : PRESETS['default'];
        Object.keys(DEFAULTS).forEach(function (k) { state[k] = p[k]; });
        apply();
      }
    }

    function setOpen(open) {
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    Array.prototype.forEach.call(skinBtns, function (b) {
      b.addEventListener('click', function () { setSkin(b.getAttribute('data-skin-btn')); });
    });

    box.addEventListener('input', function (e) {
      var inp = e.target;
      if (inp && inp.getAttribute && inp.getAttribute('data-age')) {
        state[inp.getAttribute('data-age')] = Number(inp.value);
        markTouched();
        apply();
      }
    });

    box.addEventListener('click', function (e) {
      var t = e.target;
      if (!t) return;
      if (t === toggle) { setOpen(panel.hidden); return; }
      if (t.tagName === 'I' && t.textContent === '×') { setOpen(false); return; }
      var preset = t.getAttribute && t.getAttribute('data-age-preset');
      if (preset && PRESETS[preset]) {
        Object.keys(DEFAULTS).forEach(function (k) { state[k] = PRESETS[preset][k]; });
        markTouched();
        apply();
      }
    });

    syncSkinUI();
    apply();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
