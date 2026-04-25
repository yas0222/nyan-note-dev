const STORAGE_KEYS = {
  cats: 'cats_mvp_data',
  logs: 'daily_logs_mvp_data'
};

/** @type {Array<any>} */
let cats = JSON.parse(localStorage.getItem(STORAGE_KEYS.cats) || '[]');
/** @type {Array<any>} */
let logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.logs) || '[]');

const tabs = Array.from(document.querySelectorAll('.tab'));
const screens = Array.from(document.querySelectorAll('.screen'));
const profileForm = document.getElementById('profile-form');
const dailyLogForm = document.getElementById('daily-log-form');
const catList = document.getElementById('cat-list');
const logList = document.getElementById('log-list');
const catSelect = document.getElementById('log-cat-select');
const regionSelect = document.getElementById('region-select');

const statEls = {
  food: document.getElementById('avg-food'),
  dry: document.getElementById('avg-dry'),
  wet: document.getElementById('avg-wet'),
  snack: document.getElementById('avg-snack'),
  poop: document.getElementById('avg-poop'),
  pee: document.getElementById('avg-pee'),
  sample: document.getElementById('sample-size')
};

document.getElementById('log-date').valueAsDate = new Date();

function persist() {
  localStorage.setItem(STORAGE_KEYS.cats, JSON.stringify(cats));
  localStorage.setItem(STORAGE_KEYS.logs, JSON.stringify(logs));
}

function showScreen(screenId) {
  tabs.forEach((tab) => {
    tab.classList.toggle('is-active', tab.dataset.screen === screenId);
  });
  screens.forEach((section) => {
    section.classList.toggle('is-active', section.id === screenId);
  });
}

tabs.forEach((tab) => tab.addEventListener('click', () => showScreen(tab.dataset.screen)));

function makeDisplayName(cat, index) {
  if (cat.visibility === 'anonymous') {
    return `にゃんこ${String.fromCharCode(65 + (index % 26))}`;
  }
  return cat.name;
}

function renderCatList() {
  catList.innerHTML = '';

  if (cats.length === 0) {
    catList.innerHTML = '<li class="muted">まだ猫プロフィールがありません。</li>';
    return;
  }

  cats.forEach((cat, index) => {
    const li = document.createElement('li');
    li.className = 'list-item';
    li.innerHTML = `
      <strong>${makeDisplayName(cat, index)}</strong>（${cat.age}歳 / ${cat.sex}）<br/>
      <span class="muted">${cat.prefecture} ${cat.city} / ${cat.visibility}</span>
    `;
    catList.appendChild(li);
  });
}

function renderCatOptions() {
  catSelect.innerHTML = '';
  if (cats.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = '先にプロフィールを登録してください';
    catSelect.appendChild(opt);
    return;
  }

  cats.forEach((cat, index) => {
    const opt = document.createElement('option');
    opt.value = cat.id;
    opt.textContent = `${makeDisplayName(cat, index)} (${cat.prefecture} ${cat.city})`;
    catSelect.appendChild(opt);
  });
}

function renderLogs() {
  logList.innerHTML = '';
  if (logs.length === 0) {
    logList.innerHTML = '<li class="muted">まだ日次記録がありません。</li>';
    return;
  }

  const sortedLogs = [...logs].sort((a, b) => (a.logDate < b.logDate ? 1 : -1));

  sortedLogs.forEach((log) => {
    const cat = cats.find((c) => c.id === log.catId);
    if (!cat) return;

    const li = document.createElement('li');
    li.className = 'list-item';
    li.innerHTML = `
      <strong>${log.logDate}</strong> - ${cat.name}<br/>
      エサ ${log.foodTotal}g（ドライ ${log.dryRatio}% / ウェット ${log.wetRatio}%）<br/>
      おやつ ${log.snack}g / うんち ${log.poopCount}回 / おしっこ ${log.peeCount}回
      ${log.memo ? `<br/><span class="muted">メモ: ${log.memo}</span>` : ''}
    `;
    logList.appendChild(li);
  });
}

function renderRegionOptions() {
  const allRegionKey = '__all__';
  const uniqueRegions = Array.from(new Set(cats.map((cat) => `${cat.prefecture}|${cat.city}`)));

  regionSelect.innerHTML = '';

  const allOpt = document.createElement('option');
  allOpt.value = allRegionKey;
  allOpt.textContent = '全国（すべて）';
  regionSelect.appendChild(allOpt);

  uniqueRegions.forEach((region) => {
    const [pref, city] = region.split('|');
    const option = document.createElement('option');
    option.value = region;
    option.textContent = `${pref} ${city}`;
    regionSelect.appendChild(option);
  });

  if (!regionSelect.value) {
    regionSelect.value = allRegionKey;
  }
}

function calculateAverage(values) {
  if (values.length === 0) return null;
  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}

function updateStats() {
  const selected = regionSelect.value || '__all__';

  const targetCatIds = cats
    .filter((cat) => {
      if (selected === '__all__') return true;
      return `${cat.prefecture}|${cat.city}` === selected;
    })
    .map((cat) => cat.id);

  const targetLogs = logs.filter((log) => targetCatIds.includes(log.catId));

  const avgFood = calculateAverage(targetLogs.map((l) => Number(l.foodTotal)));
  const avgDry = calculateAverage(targetLogs.map((l) => Number(l.dryRatio)));
  const avgWet = calculateAverage(targetLogs.map((l) => Number(l.wetRatio)));
  const avgSnack = calculateAverage(targetLogs.map((l) => Number(l.snack)));
  const avgPoop = calculateAverage(targetLogs.map((l) => Number(l.poopCount)));
  const avgPee = calculateAverage(targetLogs.map((l) => Number(l.peeCount)));

  statEls.food.textContent = avgFood == null ? '-' : `${avgFood.toFixed(1)} g`;
  statEls.dry.textContent = avgDry == null ? '-' : `${avgDry.toFixed(1)} %`;
  statEls.wet.textContent = avgWet == null ? '-' : `${avgWet.toFixed(1)} %`;
  statEls.snack.textContent = avgSnack == null ? '-' : `${avgSnack.toFixed(1)} g`;
  statEls.poop.textContent = avgPoop == null ? '-' : `${avgPoop.toFixed(1)} 回`;
  statEls.pee.textContent = avgPee == null ? '-' : `${avgPee.toFixed(1)} 回`;
  statEls.sample.textContent = `${targetLogs.length} 件`;
}

profileForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const fd = new FormData(profileForm);

  const cat = {
    id: crypto.randomUUID(),
    name: String(fd.get('name')).trim(),
    age: Number(fd.get('age')),
    sex: String(fd.get('sex')),
    prefecture: String(fd.get('prefecture')).trim(),
    city: String(fd.get('city')).trim(),
    visibility: String(fd.get('visibility')),
    photoUrl: String(fd.get('photoUrl') || '').trim()
  };

  cats.push(cat);
  persist();
  renderAll();
  profileForm.reset();
});

dailyLogForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const fd = new FormData(dailyLogForm);
  const dryRatio = Number(fd.get('dryRatio'));
  const wetRatio = Number(fd.get('wetRatio'));

  if (Math.abs(dryRatio + wetRatio - 100) > 0.5) {
    alert('カリカリ比率とウェット比率の合計を100%にしてください。');
    return;
  }

  const log = {
    id: crypto.randomUUID(),
    catId: String(fd.get('catId')),
    logDate: String(fd.get('logDate')),
    foodTotal: Number(fd.get('foodTotal')),
    dryRatio,
    wetRatio,
    snack: Number(fd.get('snack')),
    poopCount: Number(fd.get('poopCount')),
    peeCount: Number(fd.get('peeCount')),
    memo: String(fd.get('memo') || '').trim()
  };

  logs.push(log);
  persist();
  renderAll();
  dailyLogForm.reset();
  document.getElementById('log-date').valueAsDate = new Date();
});

regionSelect.addEventListener('change', updateStats);

function renderAll() {
  renderCatList();
  renderCatOptions();
  renderLogs();
  renderRegionOptions();
  updateStats();
}

renderAll();
