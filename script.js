// DARK/LIGHT MODE TOGGLE
const themeToggleBtn = document.getElementById('theme-toggle');
themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  // Optionally save preference
  localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
});

// Load theme preference
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
}

// PRESET BUTTONS
const preset10mBtn = document.getElementById('preset-10m');
const preset1hBtn = document.getElementById('preset-1h');
const presetCustomBtn = document.getElementById('preset-custom');
const datetimeInput = document.getElementById('datetime-input');
const addTimerBtn = document.getElementById('add-timer-btn');
const timersList = document.getElementById('timers-list');

preset10mBtn.onclick = () => addPresetTimer(10 * 60 * 1000);
preset1hBtn.onclick = () => addPresetTimer(60 * 60 * 1000);
presetCustomBtn.onclick = () => {
  datetimeInput.style.display = '';
  addTimerBtn.style.display = '';
};

addTimerBtn.onclick = () => {
  const datetime = datetimeInput.value;
  if (!datetime) return;
  const endTime = new Date(datetime).getTime();
  const now = Date.now();
  if (endTime <= now) {
    alert('Please select a future date and time.');
    return;
  }
  addTimer(endTime - now);
  datetimeInput.value = '';
  datetimeInput.style.display = 'none';
  addTimerBtn.style.display = 'none';
};

function addPresetTimer(duration) {
  addTimer(duration);
}

let timers = [];
let audio = new Audio('alarm-327234.mp3');

// TIMER CARD
function formatTime(ms) {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
}

function createTimerCard(timer) {
  const card = document.createElement('div');
  card.className = 'timer-card mb-3';

  // Progress bar
  const progressDiv = document.createElement('div');
  progressDiv.className = 'progress';
  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar';
  progressBar.style.width = '0%';
  progressDiv.appendChild(progressBar);

  // Timer text
  const timerText = document.createElement('div');
  timerText.className = 'timer-text';
  timerText.textContent = formatTime(timer.remaining);

  // Controls
  const controlsDiv = document.createElement('div');
  controlsDiv.className = 'timer-controls mt-2';

  const startBtn = document.createElement('button');
  startBtn.className = 'btn btn-success btn-sm me-1';
  startBtn.textContent = 'Start';

  const pauseBtn = document.createElement('button');
  pauseBtn.className = 'btn btn-secondary btn-sm me-1';
  pauseBtn.textContent = 'Pause';

  const resumeBtn = document.createElement('button');
  resumeBtn.className = 'btn btn-info btn-sm me-1';
  resumeBtn.textContent = 'Resume';

  const resetBtn = document.createElement('button');
  resetBtn.className = 'btn btn-outline-secondary btn-sm me-1';
  resetBtn.textContent = 'Reset';

  const removeBtn = document.createElement('button');
  removeBtn.className = 'btn btn-danger btn-sm';
  removeBtn.textContent = 'Remove';

  controlsDiv.append(startBtn, pauseBtn, resumeBtn, resetBtn, removeBtn);

  card.append(progressDiv, timerText, controlsDiv);

  // Button actions
  startBtn.onclick = () => {
    timer.running = true;
    timer.paused = false;
    timer.endTime = Date.now() + timer.remaining;
    updateControls();
  };
  pauseBtn.onclick = () => {
    timer.running = false;
    timer.paused = true;
    timer.remaining = timer.endTime - Date.now();
    updateControls();
  };
  resumeBtn.onclick = () => {
    timer.running = true;
    timer.paused = false;
    timer.endTime = Date.now() + timer.remaining;
    updateControls();
  };
  resetBtn.onclick = () => {
    timer.running = false;
    timer.paused = false;
    timer.remaining = timer.duration;
    timerText.textContent = formatTime(timer.remaining);
    progressBar.style.width = '0%';
    updateControls();
  };
  removeBtn.onclick = () => {
    timers = timers.filter(t => t !== timer);
    renderTimers();
  };

  function updateControls() {
    startBtn.style.display = timer.running || timer.paused ? 'none' : '';
    pauseBtn.style.display = timer.running ? '' : 'none';
    resumeBtn.style.display = timer.paused ? '' : 'none';
    resetBtn.style.display = timer.running || timer.paused ? '' : 'none';
  }
  updateControls();

  // Attach references for updating
  timer._elements = { timerText, progressBar, card, updateControls };

  return card;
}

function renderTimers() {
  timersList.innerHTML = '';
  timers.forEach(timer => {
    timersList.appendChild(createTimerCard(timer));
  });
}

function updateTimers() {
  const now = Date.now();
  timers.forEach(timer => {
    if (timer.running) {
      timer.remaining = timer.endTime - now;
      if (timer.remaining <= 0) {
        timer.remaining = 0;
        timer.running = false;
        timer.paused = false;
        timer._elements.updateControls();
        timer._elements.timerText.textContent = "00:00:00";
        timer._elements.progressBar.style.width = '100%';
        // Notification
        if (window.Notification && Notification.permission === "granted") {
          new Notification("Timer Finished!");
        } else if (window.Notification && Notification.permission !== "denied") {
          Notification.requestPermission().then(permission => {
            if (permission === "granted") new Notification("Timer Finished!");
          });
        }
        audio.play();
        alert("Timer Finished!");
      } else {
        timer._elements.timerText.textContent = formatTime(timer.remaining);
        const percent = 100 - Math.floor((timer.remaining / timer.duration) * 100);
        timer._elements.progressBar.style.width = percent + '%';
      }
    }
  });
}

setInterval(updateTimers, 500);

function addTimer(duration) {
  const timer = {
    duration,
    remaining: duration,
    endTime: Date.now() + duration,
    running: false,
    paused: false,
    _elements: {}
  };
  timers.push(timer);
  renderTimers();
}

// Request notification permission on load
if (window.Notification && Notification.permission !== "granted") {
  Notification.requestPermission();
}

// UI Customization
const colorTheme = document.getElementById('color-theme');
const fontStyle = document.getElementById('font-style');
const backgroundStyle = document.getElementById('background-style');

function updateTheme() {
  document.body.classList.remove('theme-blue', 'theme-green', 'theme-red');
  if (colorTheme.value !== 'default') {
    document.body.classList.add('theme-' + colorTheme.value);
  }
}
function updateFont() {
  document.body.classList.remove('font-poppins', 'font-dancing', 'font-arial', 'font-courier');
  if (fontStyle.value === 'Poppins') document.body.classList.add('font-poppins');
  if (fontStyle.value === 'Dancing Script') document.body.classList.add('font-dancing');
  if (fontStyle.value === 'Arial') document.body.classList.add('font-arial');
  if (fontStyle.value === 'Courier New') document.body.classList.add('font-courier');
}
function updateBackground() {
  document.body.classList.remove('bg-gradient', 'bg-solid', 'bg-image');
  document.body.classList.add('bg-' + backgroundStyle.value);
}

// Initial load
updateTheme();
updateFont();
updateBackground();

// Event listeners
colorTheme.addEventListener('change', updateTheme);
fontStyle.addEventListener('change', updateFont);
backgroundStyle.addEventListener('change', updateBackground);