const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

const userId = tg?.initDataUnsafe?.user?.id || 'guest_user';
const userName = tg?.initDataUnsafe?.user?.first_name || 'Foydalanuvchi';

document.getElementById('userName').textContent = userName;
document.getElementById('avatarText').textContent = userName.charAt(0).toUpperCase();

let stars = parseInt(localStorage.getItem(`luckpin_stars_${userId}`)) || 50;
let inventory = JSON.parse(localStorage.getItem(`luckpin_inv_${userId}`)) || {};
let referrals = parseInt(localStorage.getItem(`luckpin_ref_${userId}`)) || 0;
let lastDaily = parseInt(localStorage.getItem(`luckpin_daily_${userId}`)) || 0;

const ITEMS = {
  bear: { name: "Oyiqcha", img: "bear.png", price: 15 },
  icecream: { name: "Muzqaymoq", img: "icecream.png", price: 25 },
  gift50: { name: "50 Yulduz", img: "gift50.png", price: 50 },
  gift100: { name: "100 Yulduz", img: "gift100.png", price: 100 }
};

function saveState() {
  localStorage.setItem(`luckpin_stars_${userId}`, stars);
  localStorage.setItem(`luckpin_inv_${userId}`, JSON.stringify(inventory));
  localStorage.setItem(`luckpin_ref_${userId}`, referrals);
  localStorage.setItem(`luckpin_daily_${userId}`, lastDaily);
  updateUI();
}

function updateUI() {
  document.getElementById('starBalance').textContent = stars;
  document.getElementById('refCount').textContent = `${referrals} ta taklif`;
  renderInventory();
  updateDailyTimer();
}

function updateDailyTimer() {
  const btn = document.getElementById('btnDailyCase');
  const now = Date.now();
  const diff = 24 * 60 * 60 * 1000 - (now - lastDaily);

  if (diff > 0) {
    btn.classList.add('btn-disabled');
    btn.disabled = true;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    btn.textContent = `${h}s ${m}d ${s}s`;
  } else {
    btn.classList.remove('btn-disabled');
    btn.disabled = false;
    btn.textContent = "Ochish (Tekin)";
  }
}
setInterval(updateDailyTimer, 1000);

function switchTab(tab, btn) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  btn.classList.add('active');
}

function openCase(type) {
  if (type === 'daily') {
    if (Date.now() - lastDaily < 24 * 60 * 60 * 1000) return;
    lastDaily = Date.now();
  } else if (type === 'rare') {
    if (stars < 50) return alert("Yulduzlar yetarli emas!");
    stars -= 50;
  } else if (type === 'epic') {
    if (stars < 100) return alert("Yulduzlar yetarli emas!");
    stars -= 100;
  }
  startRoulette(type);
}

function startRoulette(type) {
  const modal = document.getElementById('rouletteModal');
  const track = document.getElementById('rouletteTrack');
  const okBtn = document.getElementById('modalOkBtn');
  okBtn.style.display = 'none';
  modal.classList.add('active');

  const pool = ['bear', 'icecream', 'gift50', 'gift100'];
  track.innerHTML = '';
  track.style.transition = 'none';
  track.style.transform = 'translateX(0px)';

  for (let i = 0; i < 40; i++) {
    const randItem = pool[Math.floor(Math.random() * pool.length)];
    const card = document.createElement('div');
    card.className = 'roulette-card';
    card.innerHTML = `<img src="${ITEMS[randItem].img}" alt="">`;
    track.appendChild(card);
  }

  const winIndex = 32;
  const wonKey = pool[Math.floor(Math.random() * pool.length)];
  track.children[winIndex].innerHTML = `<img src="${ITEMS[wonKey].img}" alt="">`;

  setTimeout(() => {
    track.style.transition = 'transform 3.5s cubic-bezier(0.15, 0.9, 0.25, 1)';
    const offset = -(winIndex * 90) + (track.parentElement.offsetWidth / 2) - 45;
    track.style.transform = `translateX(${offset}px)`;
  }, 50);

  setTimeout(() => {
    okBtn.style.display = 'block';
    inventory[wonKey] = (inventory[wonKey] || 0) + 1;
    saveState();
  }, 3800);
}

function closeModal() {
  document.getElementById('rouletteModal').classList.remove('active');
}

function renderInventory() {
  const grid = document.getElementById('inventoryGrid');
  grid.innerHTML = '';
  for (const [key, count] of Object.entries(inventory)) {
    if (count > 0) {
      const it = ITEMS[key];
      const div = document.createElement('div');
      div.className = 'inventory-item';
      div.innerHTML = `
        <span class="qty">${count}x</span>
        <img src="${it.img}">
        <div class="name">${it.name}</div>
        <button class="sell-btn" onclick="sellItem('${key}')">${it.price} ⭐ sotish</button>
      `;
      grid.appendChild(div);
    }
  }
}

function sellItem(key) {
  if (inventory[key] > 0) {
    inventory[key]--;
    stars += ITEMS[key].price;
    saveState();
  }
}

function shareRef() {
  const link = `https://t.me/bot_nomi?start=ref_${userId}`;
  if (tg) {
    tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=Sovg'alar yutib ol!`);
  }
}

updateUI();

