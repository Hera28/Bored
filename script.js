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

    // Elemen Game
    const pigTargetArea = document.getElementById('pigTargetArea');
    const gameScore = document.getElementById('gameScore');
    
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
    
    // State Game
    let score = 0;
    let pigTimeout; // Menggunakan Timeout untuk mengatur munculnya babi
    let gameActive = false; // Permainan hanya aktif setelah inisialisasi

    // --- FUNGSI UTILITY ---
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

    // --- FUNGSI KONTROL TIMER ---
    function tick() {
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
    settingsBtn.addEventListener('click', () => {
        pomodoroTimeInput.value = initialDurations.pomodoro;
        shortBreakTimeInput.value = initialDurations.shortBreak;
        longBreakTimeInput.value = initialDurations.longBreak;
        settingsModal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });

    saveSettingsBtn.addEventListener('click', () => {
        const newPomodoro = parseInt(pomodoroTimeInput.value);
        const newShortBreak = parseInt(shortBreakTimeInput.value);
        const newLongBreak = parseInt(longBreakTimeInput.value);

        if (newPomodoro > 0 && newShortBreak > 0 && newLongBreak > 0) {
            initialDurations = {
                pomodoro: newPomodoro,
                shortBreak: newShortBreak,
                longBreak: newLongBreak
            };
            
            localStorage.setItem('pomodoroSettings', JSON.stringify(initialDurations));

            settingsModal.style.display = 'none';
            switchMode(currentMode); 
        } else {
            alert("Waktu harus berupa angka positif.");
        }
    });

    // === 5. FUNGSI DARK MODE ===
    
    // Muat tema tersimpan atau default ke light
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        // Pastikan ikon awal fa-sun (matahari) jika defaultnya dark (agar bisa diganti ke bulan)
        themeToggleBtn.querySelector('i').classList.replace('fa-sun', 'fa-moon'); 
    }
    
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            themeToggleBtn.querySelector('i').classList.replace('fa-sun', 'fa-moon');
        } else {
            localStorage.setItem('theme', 'light');
            themeToggleBtn.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        }
    });

    // === 6. LOGIKA PERMAINAN (CATCH THE PIG) ===

    function createCatchablePig() {
        if (!pigTargetArea) return; 

        // Hapus babi lama
        pigTargetArea.innerHTML = ''; 

        const pig = document.createElement('span');
        pig.textContent = '🐷';
        pig.classList.add('catchable-pig');

        // Kalkulasi posisi acak dalam area target
        const areaWidth = pigTargetArea.clientWidth;
        const areaHeight = pigTargetArea.clientHeight;
        
        // Asumsi ukuran babi sekitar 30px, jadi kurangi dari batas area
        const randomX = Math.random() * (areaWidth - 40); 
        const randomY = Math.random() * (areaHeight - 40); 
        
        pig.style.left = `${randomX}px`;
        pig.style.top = `${randomY}px`;
        
        // Event Klik Babi (Berhasil Ditangkap)
        pig.addEventListener('click', () => {
            score++;
            gameScore.textContent = score;
            pig.remove(); 
            clearTimeout(pigTimeout); // Hentikan timer hilangnya babi
            pigTimeout = setTimeout(spawnPig, 500); // Babi baru muncul lebih cepat
        });

        pigTargetArea.appendChild(pig);
    }

    function spawnPig() {
        // Hanya spawn jika game area ada
        if (gameActive) {
            createCatchablePig();
            // Atur agar babi hilang jika tidak diklik dalam 1.5 detik
            pigTimeout = setTimeout(spawnPig, 1500); 
        }
    }

    function startGame() {
        if (pigTargetArea && gameScore) { // Pastikan elemen game ada
            gameActive = true;
            score = 0;
            gameScore.textContent = score;
            spawnPig();
        }
    }

    // === 7. Event Listeners dan Inisialisasi ===
    
    startStopBtn.addEventListener('click', startTimer);
    resetBtn.addEventListener('click', resetTimer);
    
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchMode(btn.dataset.mode);
        });
    });

    // Inisialisasi Awal
    updateDisplay();
    startGame(); // Mulai permainan segera setelah aplikasi dimuat
});
