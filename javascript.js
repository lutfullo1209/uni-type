// Massive Lexicon Dataset
const vocabularyPool = [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us", "frequency", "quantum", "keyboard", "velocity", "terminal", "matrix", "monitor", "javascript", "compiler", "algorithm", "bandwidth", "database", "encryption", "firewall", "protocol", "hardware", "software", "network", "cybersecurity", "variable", "function", "interface", "synchronous", "asynchronous", "iteration", "recursion", "efficiency", "optimization", "parameter"
];

// System Configuration States
let targetDuration = 15;
let countdownTimer = null;
let clockRemaining = 15;
let testRunning = false;
let activeWordIdx = 0;
let activeCharIdx = 0;
let strokeCount = 0;
let accuracyErrors = 0;

// Visual nodes anchors
const wordContainer = document.getElementById("word-box");
const hiddenInputField = document.getElementById("hidden-input");
const timerLiveNode = document.getElementById("live-timer");
const caretIndicator = document.getElementById("caret");

/* --- MAIN TYPING TEST ARCHITECTURE --- */
function initTypingTest() {
    clearInterval(countdownTimer);
    testRunning = false;
    activeWordIdx = 0;
    activeCharIdx = 0;
    strokeCount = 0;
    accuracyErrors = 0;
    clockRemaining = targetDuration;
    
    timerLiveNode.textContent = clockRemaining + "s";
    hiddenInputField.value = "";
    
    // Randomize text stream
    wordContainer.querySelectorAll('.word').forEach(n => n.remove());
    const shuffledPool = [...vocabularyPool].sort(() => 0.5 - Math.random());
    
    shuffledPool.slice(0, 60).forEach(wordString => {
        const wordDiv = document.createElement('div');
        wordDiv.className = 'word';
        wordString.split('').forEach(char => {
            const span = document.createElement('span');
            span.className = 'letter';
            span.textContent = char;
            wordDiv.appendChild(span);
        });
        wordContainer.appendChild(wordDiv);
    });

    setTimeout(repositionCaret, 10);
    focusTyping();
}

function focusTyping() {
    if(document.getElementById('arcade-theater').style.display !== 'flex') {
        hiddenInputField.focus();
    }
}

hiddenInputField.addEventListener('input', (e) => {
    const currentInputValue = hiddenInputField.value;
    const wordElements = wordContainer.querySelectorAll('.word');
    
    if (!testRunning && currentInputValue.length > 0) {
        startMainClock();
    }

    const nativeTargetWord = wordElements[activeWordIdx];
    if (!nativeTargetWord) return;
    
    const nativeTargetLetters = nativeTargetWord.querySelectorAll('.letter');
    strokeCount++;

    if (currentInputValue.endsWith(' ')) {
        if (currentInputValue.trim() !== nativeTargetWord.textContent) {
            accuracyErrors += (nativeTargetLetters.length - activeCharIdx);
        }
        
        nativeTargetWord.classList.remove('active');
        activeWordIdx++;
        activeCharIdx = 0;
        hiddenInputField.value = "";
        repositionCaret();
        return;
    }

    activeCharIdx = currentInputValue.length;

    nativeTargetLetters.forEach((letterSpan, idx) => {
        if (idx < currentInputValue.length) {
            if (currentInputValue[idx] === letterSpan.textContent) {
                letterSpan.className = 'letter correct';
            } else {
                if (!letterSpan.classList.contains('incorrect')) accuracyErrors++;
                letterSpan.className = 'letter incorrect';
            }
        } else {
            letterSpan.className = 'letter';
        }
    });

    if(currentInputValue.length > nativeTargetLetters.length) {
        accuracyErrors++;
    }

    repositionCaret();
});

function repositionCaret() {
    const operationalWords = wordContainer.querySelectorAll('.word');
    const targetWord = operationalWords[activeWordIdx];
    if (!targetWord) return;

    const targets = targetWord.querySelectorAll('.letter');
    const containerRect = wordContainer.getBoundingClientRect();
    const previousLetter = activeCharIdx > 0
        ? targets[Math.min(activeCharIdx - 1, targets.length - 1)]
        : null;
    const caretAnchor = previousLetter || targetWord;
    const anchorRect = caretAnchor.getBoundingClientRect();
    const computedLeft = (previousLetter ? anchorRect.right : anchorRect.left)
        - containerRect.left + wordContainer.scrollLeft - wordContainer.clientLeft;
    const computedTop = anchorRect.top - containerRect.top
        + wordContainer.scrollTop - wordContainer.clientTop;

    caretIndicator.style.left = `${computedLeft}px`;
    caretIndicator.style.top = `${computedTop + 4}px`;
    
    if(computedTop > 40) {
        wordContainer.scrollTop = computedTop - 10;
    } else {
        wordContainer.scrollTop = 0;
    }
}

function startMainClock() {
    testRunning = true;
    countdownTimer = setInterval(() => {
        clockRemaining--;
        timerLiveNode.textContent = clockRemaining + "s";
        if (clockRemaining <= 0) {
            haltAndDisplayMetrics();
        }
    }, 1000);
}

function haltAndDisplayMetrics() {
    clearInterval(countdownTimer);
    testRunning = false;
    document.getElementById("typing-app").style.display = "none";
    
    const standardWordsCount = (strokeCount / 5);
    const calculatedMinutes = (targetDuration / 60);
    const rawWpm = Math.round(standardWordsCount / calculatedMinutes);
    const verifiedAccuracy = Math.max(0, Math.round(((strokeCount - accuracyErrors) / strokeCount) * 100));

    document.getElementById("res-wpm").textContent = isNaN(rawWpm) || !isFinite(rawWpm) ? 0 : rawWpm;
    document.getElementById("res-acc").textContent = isNaN(verifiedAccuracy) ? 100 : verifiedAccuracy;
    document.getElementById("results-screen").style.display = "flex";
}

function closeResults() {
    document.getElementById("results-screen").style.display = "none";
    document.getElementById("typing-app").style.display = "flex";
    initTypingTest();
}

// Time Configurations Setup
document.getElementById("timer-config").addEventListener('click', (e) => {
    if (e.target.classList.contains('timer-option') && !testRunning) {
        document.querySelectorAll('.timer-option').forEach(n => n.classList.remove('active'));
        e.target.classList.add('active');
        targetDuration = parseInt(e.target.getAttribute('data-time'));
        initTypingTest();
    }
});

/* --- UI MANIPULATION --- */
document.getElementById("setting-theme").addEventListener('change', (e) => {
    document.documentElement.setAttribute('data-theme', e.target.value);
});
document.getElementById("setting-font").addEventListener('change', (e) => {
    document.documentElement.style.setProperty('--font-family', e.target.value);
    setTimeout(repositionCaret, 20);
});
document.getElementById("setting-size").addEventListener('input', (e) => {
    const fontSize = Number(e.target.value);
    const size = `${fontSize}px`;
    document.documentElement.style.setProperty('--font-size', size);
    document.documentElement.style.setProperty(
        '--typing-width',
        `${Math.min(96, Math.max(76, 80 + (fontSize - 24) * 0.5))}%`
    );
    const visibleLines = 2 + Math.max(0, (fontSize - 24) / 12);
    document.documentElement.style.setProperty(
        '--typing-box-height',
        `${fontSize * 1.6 * visibleLines}px`
    );
    document.getElementById("setting-size-value").textContent = size;
    e.target.setAttribute("aria-valuetext", `${fontSize} pixels`);
    setTimeout(repositionCaret, 20);
});

/* --- PROFILE IDENTITY CONTROLLERS --- */
function toggleModal(displayFlag) {
    document.getElementById("profile-modal").style.display = displayFlag ? "flex" : "none";
    document.getElementById("overlay").style.display = displayFlag ? "block" : "none";
}

function saveProfile() {
    const nameInput = document.getElementById("input-profile-name").value.trim();
    if(nameInput) {
        document.getElementById("profile-name-display").textContent = nameInput;
    }
    
    const avatarFile = document.getElementById("input-profile-img").files[0];
    if (avatarFile) {
        const fileReader = new FileReader();
        fileReader.onload = function(e) {
            document.getElementById("profile-avatar").src = e.target.result;
        }
        fileReader.readAsDataURL(avatarFile);
    }
    toggleModal(false);
}

/* --- MINI-GAMES MOTOR (ARCADE ENGINE) --- */
let continuousArcadeLoop = null;
let currentArcadeEngineType = null; 
const gameCanvas = document.getElementById("game-canvas");
const canvasCtx = gameCanvas.getContext("2d");
let memorySpaceState = {};

function openArcade(gameType) {
    window.removeEventListener('keydown', handleGlobalKeydown);
    clearInterval(countdownTimer);
    testRunning = false;
    
    document.getElementById("typing-app").style.display = "none";
    document.getElementById("results-screen").style.display = "none";
    const stage = document.getElementById("arcade-theater");
    stage.style.display = "flex";
    
    currentArcadeEngineType = gameType;
    initializeGameSimulation(gameType);
}

// Fixed closing window handler to completely clear canvas and loops
function closeArcade() {
    cancelAnimationFrame(continuousArcadeLoop);
    document.getElementById("arcade-theater").style.display = "none";
    document.getElementById("typing-app").style.display = "flex";
    currentArcadeEngineType = null;
    
    window.addEventListener('keydown', handleGlobalKeydown);
    initTypingTest();
}

function initializeGameSimulation(type) {
    memorySpaceState = { score: 0, entities: [], currentInputStr: "", timestamp: 0 };
    document.getElementById("game-score-board").textContent = "Score: 0";

    if (type === 'ztype') {
        document.getElementById("game-title").textContent = "Orbit Defense (ZType Remake)";
document.getElementById("game-instructions").textContent = "Type the full word assigned to an alien craft to lock on and blast it before they breach your shield wall.";
spawnZTypeWave(true);
} else if (type === 'blitz') {
document.getElementById("game-title").textContent = "Letter Blitz";
document.getElementById("game-instructions").textContent = "Single letters are raining down fast! Tap the matching keyboard key instantly to intercept them.";
}
executeRenderTick();
}
function spawnZTypeWave(forceSpawn = false) {
if (currentArcadeEngineType !== 'ztype') return;
if (forceSpawn || memorySpaceState.entities.length < 3) {
const selectionWord = vocabularyPool[Math.floor(Math.random() * vocabularyPool.length)];
memorySpaceState.entities.push({
text: selectionWord,
remaining: selectionWord,
x: Math.random() * (gameCanvas.width - 150) + 50,
y: -20,
speed: 0.6 + (Math.random() * 0.7)
});
}
setTimeout(() => spawnZTypeWave(), 2500);
}
function executeRenderTick() {
if (!currentArcadeEngineType) return;
canvasCtx.fillStyle = "#050505";
canvasCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
if (currentArcadeEngineType === 'ztype') {
canvasCtx.strokeStyle = "rgba(226, 183, 20, 0.4)";
canvasCtx.lineWidth = 2;
canvasCtx.beginPath();
canvasCtx.arc(gameCanvas.width / 2, gameCanvas.height + 50, 120, Math.PI, 0);
canvasCtx.stroke();
for (let i = memorySpaceState.entities.length - 1; i >= 0; i--) {
let host = memorySpaceState.entities[i];
host.y += host.speed;
canvasCtx.font = "18px 'Courier New'";
canvasCtx.fillStyle = "#646669";
canvasCtx.fillText(host.text, host.x, host.y);
canvasCtx.fillStyle = "#e2b714";
canvasCtx.fillText(host.text.substring(0, host.text.length - host.remaining.length), host.x, host.y);
let distanceX = host.x - (gameCanvas.width / 2);
let distanceY = host.y - gameCanvas.height;
if (Math.sqrt(distanceX * distanceX + distanceY * distanceY) < 100 || host.y > gameCanvas.height - 20) {
canvasCtx.fillStyle = "#ca4754";
canvasCtx.font = "30px Arial";
canvasCtx.fillText("SHIELD COLLAPSE - GAME OVER", 180, 250);
return;
}
}
}
else if (currentArcadeEngineType === 'blitz') {
memorySpaceState.timestamp++;
if (memorySpaceState.timestamp % 45 === 0) {
const uniqueChar = String.fromCharCode(65 + Math.floor(Math.random() * 26)).toLowerCase();
memorySpaceState.entities.push({
char: uniqueChar,
x: Math.random() * (gameCanvas.width - 40) + 20,
y: 0,
speed: 1.5 + (Math.random() * 2)
});
}
for (let i = memorySpaceState.entities.length - 1; i >= 0; i--) {
let targetNode = memorySpaceState.entities[i];
targetNode.y += targetNode.speed;
canvasCtx.fillStyle = "#00f5d4";
canvasCtx.font = "bold 28px sans-serif";
canvasCtx.fillText(targetNode.char, targetNode.x, targetNode.y);
if (targetNode.y > gameCanvas.height) {
canvasCtx.fillStyle = "#ca4754";
canvasCtx.font = "30px Arial";
canvasCtx.fillText("CRITICAL MISS - GAME OVER", 200, 250);
return;
}
}
}
continuousArcadeLoop = requestAnimationFrame(executeRenderTick);
}
function handleArcadeInputs(e) {
if (!currentArcadeEngineType) return;
const inputKeyChar = e.key.toLowerCase();
if (currentArcadeEngineType === 'ztype') {
let targetedObject = memorySpaceState.entities.find(h => h.remaining.length < h.text.length && h.remaining.length > 0);
if (!targetedObject) {
targetedObject = memorySpaceState.entities.find(h => h.remaining.startsWith(inputKeyChar));
}
if (targetedObject && targetedObject.remaining.startsWith(inputKeyChar)) {
targetedObject.remaining = targetedObject.remaining.substring(1);
canvasCtx.strokeStyle = "#00f5d4";
canvasCtx.lineWidth = 4;
canvasCtx.beginPath();
canvasCtx.moveTo(gameCanvas.width / 2, gameCanvas.height - 10);
canvasCtx.lineTo(targetedObject.x + 15, targetedObject.y);
canvasCtx.stroke();
if (targetedObject.remaining.length === 0) {
memorySpaceState.entities = memorySpaceState.entities.filter(h => h !== targetedObject);
memorySpaceState.score += 100;
document.getElementById("game-score-board").textContent = "Score: " + memorySpaceState.score;
}
}
}
else if (currentArcadeEngineType === 'blitz') {
let matchingNodeIdx = memorySpaceState.entities.findIndex(item => item.char === inputKeyChar);
if (matchingNodeIdx !== -1) {
memorySpaceState.entities.splice(matchingNodeIdx, 1);
memorySpaceState.score += 25;
document.getElementById("game-score-board").textContent = "Score: " + memorySpaceState.score;
}
}
}
function handleGlobalKeydown(e) {
const target = e.target;
if (target instanceof HTMLElement
&& (target.matches('input, textarea, select, button') || target.isContentEditable)) {
return;
}

if (currentArcadeEngineType) {
handleArcadeInputs(e);
} else {
focusTyping();
}
}
window.addEventListener('keydown', handleGlobalKeydown);
window.addEventListener('load', initTypingTest);