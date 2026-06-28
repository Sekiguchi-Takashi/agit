// チェック状態の永続化(localStorage)

const CHECKLIST_STORAGE_KEY = 'win11KittingChecklistState';

function loadChecklistState() {
  try {
    const raw = localStorage.getItem(CHECKLIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveChecklistState(state) {
  localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(state));
}

function getItemState(itemId) {
  const state = loadChecklistState();
  return !!state[itemId];
}

function setItemState(itemId, checked) {
  const state = loadChecklistState();
  state[itemId] = checked;
  saveChecklistState(state);
}

// 選択したセキュリティレベルの既定値で、全項目のチェック状態を上書きする
function applyPreset(level) {
  const state = loadChecklistState();
  CHECKLIST_ITEMS.forEach((item) => {
    state[item.id] = !!item.levels[level];
  });
  saveChecklistState(state);
}

function getChecklistProgress() {
  const state = loadChecklistState();
  const total = CHECKLIST_ITEMS.length;
  const done = CHECKLIST_ITEMS.filter((item) => state[item.id]).length;
  return { done, total };
}
