document.addEventListener('DOMContentLoaded', () => {
    // === 1. Elemen DOM ===
    const timerDisplay = document.getElementById('timerDisplay');
    const startStopBtn = document.getElementById('startStopBtn');
    const resetBtn = document.getElementById('resetBtn');
    const modeButtons = document.querySelectorAll('.mode-selector button');
    const alarmSound = document.getElementById('alarmSound');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    
    // Elemen Modal
    const settingsModal = document.getElementById('settingsModal');
    const settingsBtn = document.getElementById('settingsBtn');
    const closeBtn = document.querySelector('.close-btn');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const pomodoroTimeInput = document.getElementById('pomodoroTime');
    const shortBreakTimeInput = document.getElementById('shortBreakTime');
    const longBreakTimeInput = document.getElementById('longBreakTime');

    // === 2. Konfigurasi Waktu (Ambil dari Local Storage atau Default) ===
    let initialDurations = JSON.parse(localStorage.getItem('pomodoroSettings')) || {
        pomodoro: 25,
        shortBreak: 5,
        longBreak: 15
    };
    
    // === 3. State Aplikasi ===
    let currentMode = 'pomodoro';
    let timeLeft = initialDurations[currentMode] * 60; 
    let isRunning = false;
    let timerInterval = null;

    // --- FUNGSI UTILITY (Update Display, Format Time, dll. - Tetap sama) ---
    function formatTime(seconds) {
        const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
        const remainingSeconds = String(seconds % 60).padStart(2, '0');
        return `${minutes}:${remainingSeconds}`;
    }

    function updateDisplay() {
        timerDisplay.textContent = formatTime(timeLeft);
        document.title = `(${formatTime(timeLeft)}) 🌸 Pomodoro`;
    }

    function updateControls() {
        startStopBtn.textContent = isRunning ? 'Jeda' : 'Mulai';
    }

    // --- FUNGSI KONTROL TIMER (tick, startTimer, pauseTimer - Tetap sama) ---
    function tick() {
        // ... (Logika tick) ...
        timeLeft--;
        updateDisplay();

        if (timeLeft <= 0) {
            pauseTimer();
            alarmSound.play();
            alert(`Waktu ${currentMode} Selesai! Saatnya ganti mode.`);
            
            // Logika sederhana pindah mode
            if (currentMode === 'pomodoro') {
                switchMode('shortBreak');
            } else {
                switchMode('pomodoro');
            }
        }
    }

    function startTimer() {
        if (!isRunning) {
            isRunning = true;
            timerInterval = setInterval(tick, 1000); 
            updateControls();
        }
    }

    function pauseTimer() {
        clearInterval(timerInterval);
        isRunning = false;
        updateControls();
    }

    function switchMode(newMode) {
        pauseTimer(); 
        currentMode = newMode;
        // Gunakan waktu dari setting yang terbaru
        timeLeft = initialDurations[currentMode] * 60; 

        document.querySelectorAll('.mode-selector button').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === newMode) {
                btn.classList.add('active');
            }
        });

        updateDisplay();
    }
    
    function resetTimer() {
        switchMode(currentMode); 
    }

    // === 4. FUNGSI PENGATURAN WAKTU (Settings Modal) ===
    
    // Membuka Modal
    settingsBtn.addEventListener('click', () => {
        // Isi modal dengan nilai saat ini
        pomodoroTimeInput.value = initialDurations.pomodoro;
        shortBreakTimeInput.value = initialDurations.shortBreak;
        longBreakTimeInput.value = initialDurations.longBreak;
        settingsModal.style.display = 'block';
    });

    // Menutup Modal
    closeBtn.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });

    // Menyimpan Pengaturan
    saveSettingsBtn.addEventListener('click', () => {
        const newPomodoro = parseInt(pomodoroTimeInput.value);
        const newShortBreak = parseInt(shortBreakTimeInput.value);
        const newLongBreak = parseInt(longBreakTimeInput.value);

        // Validasi sederhana
        if (newPomodoro > 0 && newShortBreak > 0 && newLongBreak > 0) {
            // Update objek durasi
            initialDurations = {
                pomodoro: newPomodoro,
                shortBreak: newShortBreak,
                longBreak: newLongBreak
            };
            
            // Simpan ke Local Storage
            localStorage.setItem('pomodoroSettings', JSON.stringify(initialDurations));

            settingsModal.style.display = 'none';
            // Setel ulang timer ke mode yang sedang berjalan dengan waktu baru
            switchMode(currentMode); 
        } else {
            alert("Waktu harus berupa angka positif.");
        }
    });

    // === 5. FUNGSI DARK MODE ===
    
    // Muat tema tersimpan atau default ke light
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggleBtn.querySelector('i').classList.replace('fa-moon', 'fa-sun'); // Ganti ikon
    }
    
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        // Simpan preferensi ke Local Storage
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            themeToggleBtn.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        } else {
            localStorage.setItem('theme', 'light');
            themeToggleBtn.querySelector('i').classList.replace('fa-sun', 'fa-moon');
        }
    });

    // === 6. Event Listeners dan Inisialisasi (Tambahan) ===
    
    startStopBtn.addEventListener('click', startTimer);
    resetBtn.addEventListener('click', resetTimer);
    
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchMode(btn.dataset.mode);
        });
    });

    // Inisialisasi awal
    updateDisplay();
});
