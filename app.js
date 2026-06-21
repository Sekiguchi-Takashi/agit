const STORAGE_KEY = 'lifeTimelineData';
let currentYearViewing = null;

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getCurrentYear() {
  return new Date().getFullYear();
}

function initYears(birthYear) {
  const data = loadData() || {};
  data.birthYear = birthYear;
  data.initialized = true;
  data.years = data.years || {};
  const currentYear = getCurrentYear();
  for (let y = birthYear; y <= currentYear; y++) {
    if (!data.years[y]) {
      data.years[y] = { career: '', comment: '' };
    }
  }
  saveData(data);
  return data;
}

function showPage(id) {
  document.querySelectorAll('.page').forEach((el) => el.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function route() {
  const hash = location.hash || '#top';
  const data = loadData();

  if (hash === '#career') {
    if (!data || !data.initialized) {
      location.hash = '#top';
      return;
    }
    renderCareerPage(data);
    showPage('page-career');
  } else if (hash.indexOf('#year-') === 0) {
    const year = hash.slice('#year-'.length);
    if (!data || !data.initialized || !data.years[year]) {
      location.hash = '#career';
      return;
    }
    renderYearPage(data, year);
    showPage('page-year');
  } else {
    prefillTopPage(data);
    showPage('page-top');
  }
}

function prefillTopPage(data) {
  const input = document.getElementById('birth-year-input');
  if (data && data.birthYear) {
    input.value = data.birthYear;
  }
}

function onExecute() {
  const input = document.getElementById('birth-year-input');
  const messageEl = document.getElementById('top-message');
  const currentYear = getCurrentYear();
  const year = parseInt(input.value, 10);

  if (!input.value.trim() || isNaN(year) || year < 1900 || year > currentYear) {
    messageEl.textContent = `生まれた年を1900〜${currentYear}の範囲で正しく入力してください。`;
    return;
  }

  messageEl.textContent = '';
  const data = loadData();
  if (!data || !data.initialized) {
    initYears(year);
  }
  location.hash = '#career';
}

function renderCareerPage(data) {
  const listEl = document.getElementById('career-list');
  listEl.innerHTML = '';

  const years = Object.keys(data.years).map(Number).sort((a, b) => a - b);
  years.forEach((year) => {
    const row = document.createElement('div');
    row.className = 'career-row';

    const yearLabel = document.createElement('div');
    yearLabel.className = 'career-year-label';
    yearLabel.textContent = `${year}年`;

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn btn-edit';
    editBtn.textContent = '編集';
    editBtn.addEventListener('click', () => {
      location.hash = `#year-${year}`;
    });

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'career-input';
    input.placeholder = '学歴・社歴';
    input.value = data.years[year].career || '';
    input.dataset.year = String(year);

    row.appendChild(yearLabel);
    row.appendChild(input);
    row.appendChild(editBtn);
    listEl.appendChild(row);
  });
}

function onCareerSave() {
  const data = loadData();
  if (!data) return;

  document.querySelectorAll('.career-input').forEach((input) => {
    const year = input.dataset.year;
    if (data.years[year]) {
      data.years[year].career = input.value;
    }
  });

  saveData(data);
  flashStatus('career-save-status', '保存しました');
}

function renderYearPage(data, year) {
  currentYearViewing = year;
  const yearData = data.years[year];

  document.getElementById('year-label').textContent = `${year}年`;
  document.getElementById('year-career-display').textContent = yearData.career || '';

  const commentEl = document.getElementById('year-comment');
  commentEl.value = yearData.comment || '';
  autoResizeTextarea(commentEl);
}

function onYearSave() {
  if (!currentYearViewing) return;
  const data = loadData();
  if (!data || !data.years[currentYearViewing]) return;

  const commentEl = document.getElementById('year-comment');
  data.years[currentYearViewing].comment = commentEl.value;
  saveData(data);
  flashStatus('year-save-status', '保存しました');
}

function autoResizeTextarea(el) {
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}

function flashStatus(elId, message) {
  const el = document.getElementById(elId);
  el.textContent = message;
  clearTimeout(el._timer);
  el._timer = setTimeout(() => {
    el.textContent = '';
  }, 2000);
}

window.addEventListener('hashchange', route);

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('execute-btn').addEventListener('click', onExecute);
  document.getElementById('career-save-btn').addEventListener('click', onCareerSave);
  document.getElementById('year-save-btn').addEventListener('click', onYearSave);
  document.getElementById('year-back-btn').addEventListener('click', () => {
    location.hash = '#career';
  });
  document.getElementById('year-comment').addEventListener('input', (e) => {
    autoResizeTextarea(e.target);
  });

  route();
});
