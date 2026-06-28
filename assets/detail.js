// 画面C: 設定変更手順の描画ロジック

(function () {
  const VALID_LEVELS = ['high', 'medium', 'low', 'custom'];

  const params = new URLSearchParams(window.location.search);
  const itemId = params.get('item');
  let level = params.get('level');
  if (!VALID_LEVELS.includes(level)) {
    level = 'custom';
  }

  document.getElementById('back-link').href = `checklist.html?level=${encodeURIComponent(level)}`;

  const item = CHECKLIST_ITEMS.find((candidate) => candidate.id === itemId);

  if (!item) {
    document.getElementById('item-title').textContent = '項目が見つかりません';
    document.getElementById('item-summary').textContent = 'チェックリストへ戻ってやり直してください。';
    document.getElementById('step-list').style.display = 'none';
    document.querySelector('.complete-toggle').style.display = 'none';
    return;
  }

  document.getElementById('item-title').textContent = item.title;
  document.getElementById('item-summary').textContent = item.summary;

  const stepList = document.getElementById('step-list');
  item.steps.forEach((step) => {
    const li = document.createElement('li');
    li.textContent = step;
    stepList.appendChild(li);
  });

  const completeCheckbox = document.getElementById('complete-checkbox');
  completeCheckbox.checked = getItemState(item.id);
  completeCheckbox.addEventListener('change', () => {
    setItemState(item.id, completeCheckbox.checked);
  });
})();
