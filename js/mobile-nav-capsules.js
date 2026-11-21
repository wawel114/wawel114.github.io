/* ==================================================================
 * 手机端侧边栏胶囊导航（仅 ≤768px 生效，由 custom.css 控制显隐）
 *
 * 作用：把原来竖排在文章下方的「最新文章 / 分类 / 标签 / 归档 / 站点信息」
 * 抽成一行可横向滚动的胶囊条，配合 custom.css 放到置顶的个人信息区里。
 * 这样手机上个人信息在最上面、文章紧随其后，不再被一堆大卡片往下挤。
 *
 * 设计要点：
 * - 只读取现有卡片里的链接/文字，不改主题模板、不改 node_modules。
 * - 以后加分类/标签/文章，胶囊会自动跟着变，不用改代码。
 * - 生成的容器默认由 CSS 隐藏；只有手机端才显示（.mnav-capsules）。
 * - 用 DOMContentLoaded 执行；站点未开 pjax，无需监听 pjax 事件。
 * ================================================================== */
(function () {
  'use strict';

  function buildCapsules() {
    var aside = document.getElementById('aside-content');
    if (!aside) return; // 某些页面（如 404）没有侧边栏
    if (aside.querySelector('.mnav-capsules')) return; // 已生成，避免重复

    var pills = [];

    function addPill(label, href) {
      if (!label || !href) return;
      pills.push(
        '<a class="mnav-pill" href="' + href + '">' +
        '<span>' + label + '</span></a>'
      );
    }

    // 顺序：先放导航类（分类/标签/归档），最后才是文章，
    // 这样不滑动就能看到最常用的栏目入口。

    // 固定栏目入口：和电脑端横幅下方的栏目条一一对应，手机也能进这些页面
    addPill('软件', '/software/');
    addPill('随笔', '/essays/');
    addPill('阴暗角落', '/dark-corner/');
    addPill('工具箱', '/toolbox/');
    addPill('更新日志', '/changelog/');
    addPill('千禧年', '/y2k/');

    // 分类
    var cats = aside.querySelector('.card-categories');
    if (cats) {
      cats.querySelectorAll('.card-category-list-link').forEach(function (a) {
        var name = a.querySelector('.card-category-list-name');
        addPill((name ? name.textContent : a.textContent).trim(), a.getAttribute('href'));
      });
    }

    // 标签
    var tags = aside.querySelector('.card-tags');
    if (tags) {
      tags.querySelectorAll('.card-tag-cloud a').forEach(function (a) {
        addPill(a.textContent.trim(), a.getAttribute('href'));
      });
    }

    // 归档
    var arch = aside.querySelector('.card-archives');
    if (arch) {
      arch.querySelectorAll('.card-archive-list-link').forEach(function (a) {
        var date = a.querySelector('.card-archive-list-date');
        addPill((date ? date.textContent : a.textContent).trim(), a.getAttribute('href'));
      });
    }

    // 最新文章（放最后，文章列表本身就在下方，胶囊里次要）
    var recent = aside.querySelector('.card-recent-post');
    if (recent) {
      recent.querySelectorAll('.aside-list-item a.title').forEach(function (a) {
        addPill(a.textContent.trim(), a.getAttribute('href'));
      });
    }

    // 站点信息：纯文字没有链接，抽成一行只读小字
    var infoText = '';
    var webinfo = aside.querySelector('.card-webinfo');
    if (webinfo) {
      var items = [];
      webinfo.querySelectorAll('.webinfo-item').forEach(function (item) {
        var name = item.querySelector('.item-name');
        var count = item.querySelector('.item-count');
        if (!name || !count) return;
        var label = name.textContent.replace(/[:：]\s*$/, '').trim();
        var val = count.textContent.trim();
        if (val) items.push(label + ' ' + val);
      });
      infoText = items.join(' · ');
    }

    if (!pills.length && !infoText) return; // 手机上没内容可放就不生成

    var wrap = document.createElement('div');
    wrap.className = 'mnav-capsules';
    var html = '';
    if (pills.length) {
      html += '<div class="mnav-pills">' + pills.join('') + '</div>';
    }
    if (infoText) {
      html += '<div class="mnav-info">' + infoText + '</div>';
    }
    wrap.innerHTML = html;

    // 插到个人信息卡片（头像/公告）之后、sticky_layout 之前
    var anchor = aside.querySelector('.card-announcement') || aside.querySelector('.card-info');
    if (anchor && anchor.nextSibling) {
      aside.insertBefore(wrap, anchor.nextSibling);
    } else {
      aside.appendChild(wrap);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildCapsules);
  } else {
    buildCapsules();
  }
})();
