document.addEventListener('DOMContentLoaded', () => {
    // === 1. Elemen DOM ===
    const timerDisplay = document.getElementById('timerDisplay');
    const startStopBtn = document.getElementById('startStopBtn');
    const resetBtn = document.getElementById('resetBtn');
    const modeButtons = document.querySelectorAll('.mode-selector button');
    const alarmSound = document.getElementById('alarmSound');

    // === 2. Konfigurasi Waktu (didefinisikan dalam menit) ===
    const initialDurations = {
        pomodoro: 25,
        shortBreak: 5,
        longBreak: 15
    };

    let currentMode = 'pomodoro';
    let timeLeft = initialDurations[currentMode] * 60; // Waktu dalam detik
    let isRunning = false;
    let timerInterval = null;

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

    function tick() {
        timeLeft--;
        updateDisplay();

        if (timeLeft <= 0) {
            pauseTimer();
            alarmSound.play();
            alert(`Waktu ${currentMode} Selesai! Saatnya ganti mode.`);
            
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
            timerInterval = setInterval(tick, 1000); // Panggil tick setiap 1 detik
            updateControls();
        }
    }

    function pauseTimer() {
        clearInterval(timerInterval);
        isRunning = false;
        updateControls();
    }

    /**
     * Mengatur ulang timer ke waktu default mode saat ini
     */
    function resetTimer() {
        pauseTimer();
        timeLeft = initialDurations[currentMode] * 60;
        updateDisplay();
    }

    function switchMode(newMode) {
        pauseTimer(); 

        currentMode = newMode;
        timeLeft = initialDurations[currentMode] * 60;

        // Update 
        modeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === newMode) {
                btn.classList.add('active');
            }
        });

        updateDisplay();
    }

    // Event listner
    
    // Tombol Mulai/Jeda
    startStopBtn.addEventListener('click', () => {
        isRunning ? pauseTimer() : startTimer();
    });
    
    // Tombol Reset
    resetBtn.addEventListener('click', resetTimer);

    // Tombol Mode (Pomodoro, Break Pendek/Panjang)
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchMode(btn.dataset.mode);
        });
    });

    updateDisplay(); 
});
