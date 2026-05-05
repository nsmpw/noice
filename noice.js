const cursor = document.getElementById('custom-cursor');

document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
  cursor.style.visibility = 'visible';
});

const audio = document.getElementById('global-audio');
let activeBtn = null;
let activeDbRow = null;
let activePhoto = null;
let activeImg = null;

window.audioScrollLocked = false;

function lockScroll() {
  window.audioScrollLocked = true;
  ['col-db', 'col-info'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.overflowY = 'hidden';
  });
}

function unlockScroll() {
  window.audioScrollLocked = false;
  window.scrollPaused = false;
  window.selectionLocked = false;
  cursor.textContent = '◉';
  cursor.style.color = document.body.classList.contains("dark-mode") ? "#fff" : "#000";
  ['col-db', 'col-info'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.overflowY = 'auto';
  });
}

function clearPlayingState() {
  if (activeDbRow) { activeDbRow.classList.remove('playing'); activeDbRow = null; }
  if (activeImg) { activeImg.style.filter = 'grayscale(100%)'; activeImg = null; }
  if (activePhoto) { if (typeof stopNoise === 'function') stopNoise(activePhoto); activePhoto = null; }
  if (activeBtn) { activeBtn.textContent = 'Listen'; activeBtn.classList.remove('playing'); activeBtn = null; }
}

/* ─── Play / pause audio ─────────────────────────────────── */
function playAudio(src, btn) {
  // Pause if same button
  if (activeBtn === btn && !audio.paused) {
    audio.pause();
    btn.textContent = 'Listen';
    btn.classList.remove('playing');
    cursor.textContent = '◉';
    cursor.style.color = document.body.classList.contains("dark-mode") ? "#fff" : "#000";
    if (activeImg) activeImg.style.filter = 'grayscale(100%)';
    if (typeof stopNoise === 'function') stopNoise(activePhoto);
    // orange stays on dB row when paused — do NOT remove activeDbRow.playing
    return;
  }

  // Clear previous playing state if switching to another recording
  if (activeBtn && activeBtn !== btn) {
    clearPlayingState();
  }

  const infoRow = btn.closest('.info-row');
  const recordingId = infoRow ? infoRow.dataset.id : null;
  activeDbRow = recordingId ? document.querySelector(`.db-row[data-id="${recordingId}"]`) : null;
  activePhoto = infoRow ? infoRow.querySelector('.card-photo') : null;
  activeImg = activePhoto ? activePhoto.querySelector('img') : null;
  activeBtn = btn;

  audio.src = src;
  audio.play();
  btn.textContent = 'Pause';
  btn.classList.add('playing');
  cursor.textContent = '■';
  cursor.style.color = document.body.classList.contains("dark-mode") ? "#fff" : "#000";

  if (activeDbRow) activeDbRow.classList.add('playing');
  if (activeImg) activeImg.style.filter = 'grayscale(0%)';
  if (typeof startNoise === 'function') startNoise(activePhoto);

  // Scroll both columns to align this recording
  if (recordingId && typeof selectRow === 'function') selectRow(recordingId);

  audio.onended = () => {
    cursor.textContent = '◉';
    cursor.style.color = document.body.classList.contains("dark-mode") ? "#fff" : "#000";
    clearPlayingState();
  };
}