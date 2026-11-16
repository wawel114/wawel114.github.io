/* ==================================================================
 * 手机端：整张文章卡片可点击（仅 ≤768px 生效）
 *
 * 背景：文章卡片里只有标题 <a class="article-title"> 是链接，手机上
 * 点摘要、日期、卡片空白处都没反应。这里给整张卡片绑定点击，点任意处
 * 跳到该文章的链接。
 *
 * 设计要点：
 * - 只对手机视口生效（matchMedia ≤768px），电脑端保持主题原样。
 * - 卡片内真正的链接（标题、分类、标签等）不拦截，交给浏览器默认行为，
 *   避免「点分类」被误跳到文章。
 * - 用事件委托绑在 #recent-posts 容器上，文章列表刷新/无限滚动新增卡片
 *   也能覆盖，不用逐张绑定。
 * - 不选中文本时不干扰复制：若用户拖动选中了文字，不触发跳转。
 * - 站点未开 pjax，DOMContentLoaded 执行即可。
 * ================================================================== */
(function () {
  'use strict';

  var MOBILE = '(max-width: 768px)';

  function init() {
    var container = document.getElementById('recent-posts');
    if (!container) return;

    container.addEventListener('click', function (e) {
      if (!window.matchMedia(MOBILE).matches) return; // 仅手机端

      // 若用户选中了文字，视为复制操作，不跳转
      var sel = window.getSelection();
      if (sel && String(sel).trim()) return;

      // 找到被点的卡片
      var card = e.target.closest('.recent-post-item');
      if (!card) return;

      // 点到卡片内的真实链接/按钮时，保留其默认行为
      if (e.target.closest('a, button')) return;

      // 取该卡片的文章链接
      var title = card.querySelector('.article-title');
      if (!title) return;
      var href = title.getAttribute('href');
      if (!href) return;

      window.location.href = href;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
