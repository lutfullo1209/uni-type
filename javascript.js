// Easy word list for simple typing practice
const vocabularyPool = [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us", "home", "food", "tree", "book", "cat", "dog", "sun", "rain", "wind", "play", "school", "happy", "small", "big", "light", "dark", "house", "bird", "blue", "green", "red", "yellow", "water", "music", "friend", "family", "smile", "hello", "world", "story", "paper", "pencil", "chair", "table", "phone", "game", "night", "star", "moon", "road", "walk", "talk", "read", "write", "watch", "sleep", "eat", "drink", "laugh", "learn", "plant", "bread", "shirt", "shoe", "grass", "park", "river", "cloud", "jump", "run", "fast", "slow", "warm", "cold", "safe", "clean", "kind", "love", "dream", "quiet", "little", "young", "old", "strong", "soft", "sharp", "happy"
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
const spaceStars = Array.from({ length: 90 }, () => ({
    x: Math.random() * gameCanvas.width,
    y: Math.random() * gameCanvas.height,
    radius: Math.random() * 1.3 + 0.3,
    alpha: Math.random() * 0.5 + 0.18
}));
let memorySpaceState = {};

function openArcade(gameType) {
    clearInterval(countdownTimer);
    testRunning = false;
    
    document.getElementById("typing-app").style.display = "none";
    document.getElementById("results-screen").style.display = "none";
    const stage = document.getElementById("arcade-theater");
    stage.style.display = "flex";
    gameCanvas.focus();
    
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
        document.getElementById("game-title").textContent = "Space Defense";
        document.getElementById("game-instructions").textContent = "Type the whole word on a ship to stop it before it reaches your base.";
        spawnZTypeWave(true);
    } else if (type === 'blitz') {
        document.getElementById("game-title").textContent = "Letter Blitz";
        document.getElementById("game-instructions").textContent = "Letters are falling fast! Press the matching key as soon as you see it.";
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
const spaceGradient = canvasCtx.createLinearGradient(0, 0, 0, gameCanvas.height);
spaceGradient.addColorStop(0, "#101f30");
spaceGradient.addColorStop(1, "#080e17");
canvasCtx.fillStyle = spaceGradient;
canvasCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
canvasCtx.strokeStyle = "rgba(147, 178, 207, 0.055)";
canvasCtx.lineWidth = 1;
for (let x = 0; x < gameCanvas.width; x += 48) {
    canvasCtx.beginPath();
    canvasCtx.moveTo(x, 0);
    canvasCtx.lineTo(x, gameCanvas.height);
    canvasCtx.stroke();
}
for (let y = 0; y < gameCanvas.height; y += 48) {
    canvasCtx.beginPath();
    canvasCtx.moveTo(0, y);
    canvasCtx.lineTo(gameCanvas.width, y);
    canvasCtx.stroke();
}
spaceStars.forEach(star => {
    canvasCtx.fillStyle = `rgba(211, 228, 244, ${star.alpha})`;
    canvasCtx.beginPath();
    canvasCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    canvasCtx.fill();
});
if (currentArcadeEngineType === 'ztype') {
const planetGradient = canvasCtx.createRadialGradient(
    gameCanvas.width / 2 - 40, gameCanvas.height - 35, 12,
    gameCanvas.width / 2, gameCanvas.height + 92, 230
);
planetGradient.addColorStop(0, "#42617a");
planetGradient.addColorStop(1, "#172d43");
canvasCtx.fillStyle = planetGradient;
canvasCtx.beginPath();
canvasCtx.arc(gameCanvas.width / 2, gameCanvas.height + 92, 230, Math.PI, 0);
canvasCtx.fill();
canvasCtx.strokeStyle = "rgba(127, 191, 224, 0.72)";
canvasCtx.shadowColor = "rgba(94, 194, 231, 0.65)";
canvasCtx.shadowBlur = 18;
canvasCtx.lineWidth = 2;
canvasCtx.beginPath();
canvasCtx.arc(gameCanvas.width / 2, gameCanvas.height + 92, 230, Math.PI, 0);
canvasCtx.stroke();
canvasCtx.shadowBlur = 0;
canvasCtx.fillStyle = "rgba(231, 241, 248, 0.86)";
canvasCtx.font = "600 11px 'Segoe UI', sans-serif";
canvasCtx.textAlign = "center";
canvasCtx.fillText("SPACE DEFENSE", gameCanvas.width / 2, gameCanvas.height - 18);
for (let i = memorySpaceState.entities.length - 1; i >= 0; i--) {
let host = memorySpaceState.entities[i];
host.y += host.speed;
const isTargeted = host.remaining.length < host.text.length;
canvasCtx.font = "600 16px 'Segoe UI', sans-serif";
canvasCtx.textAlign = "left";
const labelWidth = canvasCtx.measureText(host.text).width + 28;
const labelX = Math.min(host.x, gameCanvas.width - labelWidth - 12);
const labelY = host.y - 24;
canvasCtx.fillStyle = isTargeted ? "rgba(228, 189, 99, 0.18)" : "rgba(9, 17, 27, 0.82)";
canvasCtx.strokeStyle = isTargeted ? "rgba(228, 189, 99, 0.72)" : "rgba(157, 183, 207, 0.28)";
canvasCtx.lineWidth = 1;
canvasCtx.beginPath();
canvasCtx.roundRect(labelX, labelY, labelWidth, 34, 9);
canvasCtx.fill();
canvasCtx.stroke();
canvasCtx.fillStyle = "#d7e0e9";
canvasCtx.fillText(host.text, labelX + 14, host.y - 2);
canvasCtx.fillStyle = "#f0cb71";
canvasCtx.fillText(host.text.substring(0, host.text.length - host.remaining.length), labelX + 14, host.y - 2);
let distanceX = host.x - (gameCanvas.width / 2);
let distanceY = host.y - gameCanvas.height;
if (Math.sqrt(distanceX * distanceX + distanceY * distanceY) < 100 || host.y > gameCanvas.height - 20) {
canvasCtx.fillStyle = "rgba(4, 9, 15, 0.76)";
canvasCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
canvasCtx.fillStyle = "#f1b5b8";
canvasCtx.font = "600 28px 'Segoe UI', sans-serif";
canvasCtx.textAlign = "center";
canvasCtx.fillText("BASE HIT", gameCanvas.width / 2, gameCanvas.height / 2);
canvasCtx.fillStyle = "rgba(232, 237, 242, 0.72)";
canvasCtx.font = "15px 'Segoe UI', sans-serif";
canvasCtx.fillText("Exit and play again", gameCanvas.width / 2, gameCanvas.height / 2 + 30);
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
canvasCtx.fillStyle = "#f0cb71";
canvasCtx.font = "600 28px 'Segoe UI', sans-serif";
canvasCtx.textAlign = "center";
canvasCtx.fillText(targetNode.char, targetNode.x, targetNode.y);
if (targetNode.y > gameCanvas.height) {
canvasCtx.fillStyle = "rgba(4, 9, 15, 0.76)";
canvasCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
canvasCtx.fillStyle = "#f1b5b8";
canvasCtx.font = "600 28px 'Segoe UI', sans-serif";
canvasCtx.fillText("MISSED!", gameCanvas.width / 2, gameCanvas.height / 2);
canvasCtx.fillStyle = "rgba(232, 237, 242, 0.72)";
canvasCtx.font = "15px 'Segoe UI', sans-serif";
canvasCtx.fillText("Exit and try again", gameCanvas.width / 2, gameCanvas.height / 2 + 30);
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
if (e.key === 'Tab' && target === hiddenInputField && !currentArcadeEngineType) {
e.preventDefault();
initTypingTest();
return;
}

if (target instanceof HTMLElement
&& (target.matches('input, textarea, select') || target.isContentEditable)) {
return;
}

if (currentArcadeEngineType) {
if (e.key.length === 1) {
    e.preventDefault();
}
handleArcadeInputs(e);
} else {
focusTyping();
}
}
window.addEventListener('keydown', handleGlobalKeydown);
window.addEventListener('load', initTypingTest);