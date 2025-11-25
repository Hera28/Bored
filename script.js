document.addEventListener('DOMContentLoaded', () => {
    const timerDisplay = document.getElementById('timerDisplay');
    const startStopBtn = document.getElementById('startStopBtn');
    const resetBtn = document.getElementById('resetBtn');
    const modeButtons = document.querySelectorAll('.mode-selector button');
    const alarmSound = document.getElementById('alarmSound');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    
    const settingsModal = document.getElementById('settingsModal');
    const settingsBtn = document.getElementById('settingsBtn');
    const closeBtn = document.querySelector('.close-btn');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const pomodoroTimeInput = document.getElementById('pomodoroTime');
    const shortBreakTimeInput = document.getElementById('shortBreakTime');
    const longBreakTimeInput = document.getElementById('longBreakTime');

    const pigTargetArea = document.getElementById('pigTargetArea');
    const gameScore = document.getElementById('gameScore');
    const cycleCounter = document.getElementById('cycleCounter'); 
    
    let initialDurations = JSON.parse(localStorage.getItem('pomodoroSettings')) || {
        pomodoro: 25,
        shortBreak: 5,
        longBreak: 15
    };
    
    let currentMode = 'pomodoro';
    let timeLeft = initialDurations[currentMode] * 60; 
    let isRunning = false;
    let timerInterval = null;
    
    let score = 0;
    let pigTimeout; 
    let gameActive = false; 
    let cyclesCompleted = parseInt(localStorage.getItem('pomodoroCycles')) || 0; 

    function formatTime(seconds) {
        const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
        const remainingSeconds = String(seconds % 60).padStart(2, '0');
        return `${minutes}:${remainingSeconds}`;
    }

    function updateDisplay() {
        timerDisplay.textContent = formatTime(timeLeft);
        document.title = `(${formatTime(timeLeft)}) 🌸 Pomodoro`;
        if (cycleCounter) {
            cycleCounter.textContent = cyclesCompleted;
        }
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
                cyclesCompleted++;
                localStorage.setItem('pomodoroCycles', cyclesCompleted);
                switchMode('shortBreak');
            } else {
                switchMode('pomodoro');
            }
            updateDisplay(); 
        }
    }

    function startTimer() {
        if (!isRunning) {
            isRunning = true;
            timerInterval = setInterval(tick, 1000); 
            updateControls();
            stopGame();
        }
    }

    function pauseTimer() {
        clearInterval(timerInterval);
        isRunning = false;
        updateControls();
        startGame();
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
        
        if (!isRunning && confirm("Reset timer juga akan mereset hitungan Siklus Pomodoro. Lanjutkan?")) {
            cyclesCompleted = 0;
            localStorage.setItem('pomodoroCycles', 0);
        }
        updateDisplay();
        startGame();
    }

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

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
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

    function createCatchablePig() {
        if (!pigTargetArea || !gameActive) return; 

        pigTargetArea.innerHTML = ''; 

        const pig = document.createElement('span');
        pig.textContent = '🐷';
        pig.classList.add('catchable-pig');

        const areaWidth = pigTargetArea.clientWidth;
        const areaHeight = pigTargetArea.clientHeight;
        
        const randomX = Math.random() * (areaWidth - 40); 
        const randomY = Math.random() * (areaHeight - 40); 
        
        pig.style.left = `${randomX}px`;
        pig.style.top = `${randomY}px`;
        
        pig.addEventListener('click', () => {
            score++;
            gameScore.textContent = score;
            pig.remove(); 
            clearTimeout(pigTimeout); 
            pigTimeout = setTimeout(spawnPig, 500); 
        });

        pigTargetArea.appendChild(pig);
    }

    function spawnPig() {
        if (gameActive) {
            createCatchablePig();
            pigTimeout = setTimeout(spawnPig, 1500); 
        }
    }
    
    function stopGame() {
        gameActive = false;
        clearTimeout(pigTimeout);
        if (pigTargetArea) {
            pigTargetArea.innerHTML = ''; 
        }
    }

    function startGame() {
        if (pigTargetArea && gameScore && !isRunning) { 
            if (!gameActive) { 
                 gameActive = true;
                 spawnPig();
            }
        }
    }
    
    startStopBtn.addEventListener('click', startTimer);
    resetBtn.addEventListener('click', resetTimer);
    
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchMode(btn.dataset.mode);
        });
    });

    updateDisplay();
    startGame(); 
});
