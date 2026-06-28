// 画面B: 設定項目チェックリストの描画ロジック

(function () {
  const VALID_LEVELS = ['high', 'medium', 'low', 'custom'];

  const params = new URLSearchParams(window.location.search);
  let level = params.get('level');
  if (!VALID_LEVELS.includes(level)) {
    level = 'custom';
  }

  // セキュリティレベルのボタンから来た場合は、そのレベルの既定値でチェック状態を上書きする。
  // カスタマイズボタンから来た場合は、既存のチェック状態をそのまま使う。
  if (level !== 'custom') {
    applyPreset(level);
  }

  document.getElementById('level-title').textContent = SECURITY_LEVEL_LABELS[level];

  const main = document.getElementById('checklist-main');
  const state = loadChecklistState();

  CATEGORY_ORDER.forEach((categoryKey) => {
    const items = CHECKLIST_ITEMS.filter((item) => item.category === categoryKey);
    if (items.length === 0) {
      return;
    }

    const section = document.createElement('section');
    section.className = 'category-section';

    const heading = document.createElement('h2');
    heading.className = 'category-heading';
    heading.textContent = CATEGORY_LABELS[categoryKey];
    section.appendChild(heading);

    const list = document.createElement('ul');
    list.className = 'item-list';

    items.forEach((item) => {
      list.appendChild(buildItemRow(item, level, state));
    });

    section.appendChild(list);
    main.appendChild(section);
  });

  function buildItemRow(item, level, state) {
    const li = document.createElement('li');
    li.className = 'item-row';

    const checkboxLabel = document.createElement('label');
    checkboxLabel.className = 'item-checkbox-label';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!state[item.id];
    checkbox.addEventListener('change', () => {
      setItemState(item.id, checkbox.checked);
      updateProgress();
    });

    const titleSpan = document.createElement('span');
    titleSpan.className = 'item-title';
    titleSpan.textContent = item.title;

    checkboxLabel.appendChild(checkbox);
    checkboxLabel.appendChild(titleSpan);

    const detailLink = document.createElement('a');
    detailLink.className = 'item-detail-link';
    detailLink.href = `detail.html?item=${encodeURIComponent(item.id)}&level=${encodeURIComponent(level)}`;
    detailLink.textContent = '手順を見る ›';

    li.appendChild(checkboxLabel);
    li.appendChild(detailLink);
    return li;
  }

  function updateProgress() {
    const { done, total } = getChecklistProgress();
    document.getElementById('progress-text').textContent = `${done} / ${total} 項目が完了`;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    document.getElementById('progress-fill').style.width = `${pct}%`;
  }

  updateProgress();
})();
