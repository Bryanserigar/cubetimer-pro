// CubeTimer Pro - Main JavaScript Functionality
class CubeTimer {
    constructor() {
        this.isRunning = false;
        this.isInspecting = false;
        this.startTime = null;
        this.inspectionStartTime = null;
        this.currentTime = 0;
        this.inspectionTime = 15000; // 15 seconds
        this.timerInterval = null;
        this.inspectionInterval = null;
        
        // Statistics
        this.solves = JSON.parse(localStorage.getItem('cubeTimerSolves')) || [];
        this.currentSession = [];
        
        // DOM Elements
        this.timerDisplay = document.getElementById('timer-display');
        this.timerStatus = document.getElementById('timer-status');
        this.startBtn = document.getElementById('start-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.newScrambleBtn = document.getElementById('new-scramble-btn');
        this.scrambleDisplay = document.getElementById('scramble-display');
        this.copyScrambleBtn = document.getElementById('copy-scramble');
        
        // Statistics elements
        this.sessionSolvesEl = document.getElementById('session-solves');
        this.bestTimeEl = document.getElementById('best-time');
        this.currentAo5El = document.getElementById('current-ao5');
        this.currentAo12El = document.getElementById('current-ao12');
        this.recentSolvesEl = document.getElementById('recent-solves');
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.generateNewScramble();
        this.updateStatistics();
        this.initParticles();
        this.initTypedText();
        
        // Load saved session
        if (this.solves.length > 0) {
            this.currentSession = this.solves.slice(-50); // Last 50 solves
            this.updateStatistics();
        }
    }
    
    setupEventListeners() {
        // Timer controls
        this.startBtn.addEventListener('click', () => this.toggleTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        this.newScrambleBtn.addEventListener('click', () => this.generateNewScramble());
        this.copyScrambleBtn.addEventListener('click', () => this.copyScramble());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.toggleTimer();
            } else if (e.key === 'r' || e.key === 'R') {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.resetTimer();
                }
            } else if (e.key === 'n' || e.key === 'N') {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.generateNewScramble();
                }
            }
        });
        
        // Touch support for mobile
        document.addEventListener('touchstart', (e) => {
            if (e.target.closest('.timer-display')) {
                e.preventDefault();
                this.toggleTimer();
            }
        });
    }
    
    toggleTimer() {
        if (!this.isRunning && !this.isInspecting) {
            // If timer display shows a completed time, reset before starting new solve
            if (this.timerDisplay.classList.contains('timer-complete')) {
                this.resetTimer();
            }
            this.startInspection();
        } else if (this.isInspecting) {
            this.stopInspection();
            this.startSolving();
        } else if (this.isRunning) {
            this.stopSolving();
        }
    }
    
    startInspection() {
        this.isInspecting = true;
        this.inspectionStartTime = performance.now();
        
        this.timerDisplay.className = 'timer-display timer-inspecting';
        this.timerStatus.textContent = 'Inspecting...';
        this.startBtn.textContent = 'Start Solving';
        
        // Start inspection countdown
        this.inspectionInterval = setInterval(() => {
            const elapsed = performance.now() - this.inspectionStartTime;
            const remaining = Math.max(0, this.inspectionTime - elapsed);
            
            if (remaining === 0) {
                this.stopInspection();
                this.startSolving();
            } else if (remaining <= 3000) {
                // Warning beep for last 3 seconds
                this.playBeep();
            }
        }, 100);
    }
    
    stopInspection() {
        this.isInspecting = false;
        if (this.inspectionInterval) {
            clearInterval(this.inspectionInterval);
            this.inspectionInterval = null;
        }
    }
    
    startSolving() {
        this.isRunning = true;
        this.startTime = performance.now();
        
        this.timerDisplay.className = 'timer-display timer-solving';
        this.timerStatus.textContent = 'Solving...';
        this.startBtn.textContent = 'Stop Timer';
        
        // Start timer
        this.timerInterval = setInterval(() => {
            this.currentTime = performance.now() - this.startTime;
            this.updateTimerDisplay();
        }, 10); // Update every 10ms for smooth display
    }
    
    stopSolving() {
        this.isRunning = false;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Record solve
        const solveTime = this.currentTime;
        this.recordSolve(solveTime);
        
        this.timerDisplay.className = 'timer-display timer-complete';
        this.timerStatus.textContent = `Completed: ${this.formatTime(solveTime)}`;
        this.startBtn.textContent = 'Start New Solve';
        
        // DO NOT automatically generate new scramble or reset display
        // User must manually start a new solve
    }
    
    resetTimer() {
        this.isRunning = false;
        this.isInspecting = false;
        this.currentTime = 0;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        if (this.inspectionInterval) {
            clearInterval(this.inspectionInterval);
            this.inspectionInterval = null;
        }
        
        this.resetTimerDisplay();
    }
    
    resetTimerDisplay() {
        this.timerDisplay.className = 'timer-display timer-ready';
        this.timerDisplay.textContent = '00:00.000';
        this.timerStatus.textContent = 'Ready to start';
        this.startBtn.textContent = 'Start Timer';
    }
    
    updateTimerDisplay() {
        this.timerDisplay.textContent = this.formatTime(this.currentTime);
    }
    
    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const ms = Math.floor((milliseconds % 1000) / 10);
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    }
    
    generateNewScramble() {
        const scramble = this.generateWCAScramble();
        this.scrambleDisplay.textContent = scramble;
        
        // Update scramble info
        document.getElementById('scramble-length').textContent = scramble.split(' ').length;
        document.getElementById('scramble-difficulty').textContent = this.estimateDifficulty(scramble);
        
        // Animate scramble change
        anime({
            targets: this.scrambleDisplay,
            opacity: [0, 1],
            translateY: [-10, 0],
            duration: 500,
            easing: 'easeOutQuart'
        });
    }
    
    generateWCAScramble() {
        const moves = ['U', 'D', 'R', 'L', 'F', 'B'];
        const modifiers = ['', "'", '2'];
        let scramble = [];
        let lastMove = '';
        let lastLastMove = '';
        
        // Generate 20-25 moves
        const scrambleLength = 20 + Math.floor(Math.random() * 6);
        
        for (let i = 0; i < scrambleLength; i++) {
            let move;
            do {
                move = moves[Math.floor(Math.random() * moves.length)];
            } while (
                move === lastMove || 
                (move === lastLastMove && i > 1) ||
                this.areOppositeMoves(move, lastMove)
            );
            
            const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
            scramble.push(move + modifier);
            
            lastLastMove = lastMove;
            lastMove = move;
        }
        
        return scramble.join(' ');
    }
    
    areOppositeMoves(move1, move2) {
        const opposites = {
            'U': 'D', 'D': 'U',
            'R': 'L', 'L': 'R',
            'F': 'B', 'B': 'F'
        };
        return opposites[move1] === move2;
    }
    
    estimateDifficulty(scramble) {
        const moves = scramble.split(' ').length;
        if (moves <= 18) return 'Easy';
        if (moves <= 22) return 'Medium';
        return 'Hard';
    }
    
    copyScramble() {
        navigator.clipboard.writeText(this.scrambleDisplay.textContent).then(() => {
            // Show success feedback
            const originalText = this.copyScrambleBtn.innerHTML;
            this.copyScrambleBtn.innerHTML = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>';
            
            setTimeout(() => {
                this.copyScrambleBtn.innerHTML = originalText;
            }, 1000);
        });
    }
    
    recordSolve(time) {
        const solve = {
            time: time,
            scramble: this.scrambleDisplay.textContent,
            date: new Date().toISOString(),
            dnf: false
        };
        
        this.currentSession.push(solve);
        this.solves.push(solve);
        
        // Keep only last 1000 solves
        if (this.solves.length > 1000) {
            this.solves = this.solves.slice(-1000);
        }
        
        // Save to localStorage
        localStorage.setItem('cubeTimerSolves', JSON.stringify(this.solves));
        
        this.updateStatistics();
    }
    
    updateStatistics() {
        const sessionSolves = this.currentSession.length;
        this.sessionSolvesEl.textContent = sessionSolves;
        
        if (sessionSolves > 0) {
            // Best time
            const bestTime = Math.min(...this.currentSession.map(s => s.time));
            this.bestTimeEl.textContent = this.formatTime(bestTime);
            
            // Current ao5
            if (sessionSolves >= 5) {
                const last5 = this.currentSession.slice(-5);
                const avg5 = last5.reduce((sum, s) => sum + s.time, 0) / 5;
                this.currentAo5El.textContent = this.formatTime(avg5);
            }
            
            // Current ao12
            if (sessionSolves >= 12) {
                const last12 = this.currentSession.slice(-12);
                const avg12 = last12.reduce((sum, s) => sum + s.time, 0) / 12;
                this.currentAo12El.textContent = this.formatTime(avg12);
            }
            
            // Update recent solves
            this.updateRecentSolves();
        }
    }
    
    updateRecentSolves() {
        const recentSolves = this.currentSession.slice(-5).reverse();
        
        if (recentSolves.length === 0) {
            this.recentSolvesEl.innerHTML = '<div class="flex justify-between items-center py-2 px-4 bg-gray-800 bg-opacity-50 rounded-lg"><span class="text-gray-400">No solves yet</span><span class="text-gray-500">--:--.---</span></div>';
            return;
        }
        
        this.recentSolvesEl.innerHTML = recentSolves.map((solve, index) => `
            <div class="flex justify-between items-center py-2 px-4 bg-gray-800 bg-opacity-50 rounded-lg">
                <span class="text-gray-300">Solve ${this.currentSession.length - recentSolves.length + index + 1}</span>
                <span class="text-cyan-400 font-mono">${this.formatTime(solve.time)}</span>
            </div>
        `).join('');
    }
    
    playBeep() {
        // Create audio context for beep sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            // Fallback for browsers without Web Audio API
            console.log('Audio not supported');
        }
    }
    
    initParticles() {
        // P5.js particle system
        new p5((p) => {
            let particles = [];
            
            p.setup = () => {
                const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
                canvas.id('p5-canvas');
                canvas.position(0, 0);
                canvas.style('z-index', '-1');
                canvas.style('position', 'fixed');
                
                // Create particles
                for (let i = 0; i < 50; i++) {
                    particles.push({
                        x: p.random(p.width),
                        y: p.random(p.height),
                        vx: p.random(-0.5, 0.5),
                        vy: p.random(-0.5, 0.5),
                        size: p.random(2, 6),
                        color: p.random(['#00d4ff', '#00ff88', '#ffa500', '#ff6b6b'])
                    });
                }
            };
            
            p.draw = () => {
                p.clear();
                
                // Update and draw particles
                particles.forEach(particle => {
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    
                    // Wrap around edges
                    if (particle.x < 0) particle.x = p.width;
                    if (particle.x > p.width) particle.x = 0;
                    if (particle.y < 0) particle.y = p.height;
                    if (particle.y > p.height) particle.y = 0;
                    
                    // Draw particle
                    p.fill(particle.color + '40');
                    p.noStroke();
                    p.circle(particle.x, particle.y, particle.size);
                });
            };
            
            p.windowResized = () => {
                p.resizeCanvas(p.windowWidth, p.windowHeight);
            };
        });
    }
    
    initTypedText() {
        new Typed('#typed-text', {
            strings: [
                'CubeTimer Pro',
                'Speedcubing Excellence',
                'Precision Timing',
                'WCA Compliant'
            ],
            typeSpeed: 80,
            backSpeed: 60,
            backDelay: 2000,
            loop: true,
            showCursor: true,
            cursorChar: '|'
        });
    }
}

// Initialize the timer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CubeTimer();
});

// Add some additional utility functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-600' : 
        type === 'error' ? 'bg-red-600' : 
        'bg-blue-600'
    } text-white`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    anime({
        targets: notification,
        translateX: [300, 0],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuart'
    });
    
    // Remove after 3 seconds
    setTimeout(() => {
        anime({
            targets: notification,
            translateX: [0, 300],
            opacity: [1, 0],
            duration: 300,
            easing: 'easeInQuart',
            complete: () => {
                document.body.removeChild(notification);
            }
        });
    }, 3000);
}

// Add smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading animation for page transitions
window.addEventListener('beforeunload', () => {
    document.body.style.opacity = '0';
});