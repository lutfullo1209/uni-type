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
    const fontFamily = e.target.value;
    document.documentElement.style.setProperty('--font-family', fontFamily);
    document.documentElement.style.setProperty(
        '--typing-font-weight',
        fontFamily.includes('Segoe UI') ? '600' : '400'
    );
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
const arcadeAnimationStart = performance.now();

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
        document.getElementById("game-instructions").textContent = "Type the letter in the box. A new letter will appear.";
        memorySpaceState.entities.push(createBlitzLetter());
    }
    executeRenderTick();
}

function createBlitzLetter(previousChar = "") {
    let char = String.fromCharCode(97 + Math.floor(Math.random() * 26));
    while (char === previousChar) {
        char = String.fromCharCode(97 + Math.floor(Math.random() * 26));
    }
    return { char };
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
const typedLength = host.text.length - host.remaining.length;
const textStartX = labelX + 14;
const textBaseline = host.y - 2;
const typedText = host.text.substring(0, typedLength);
canvasCtx.fillStyle = "#f0cb71";
canvasCtx.fillText(typedText, textStartX, textBaseline);
let nextLetterX = textStartX + canvasCtx.measureText(typedText).width;

if (isTargeted && host.remaining.length > 0) {
    const currentLetter = host.remaining[0];
    const currentLetterWidth = canvasCtx.measureText(currentLetter).width;
    const pulse = 0.5 + (Math.sin((performance.now() - arcadeAnimationStart) / 150) + 1) * 0.25;
    const highlightWidth = Math.max(20, currentLetterWidth + 12);
    const highlightX = nextLetterX + currentLetterWidth / 2 - highlightWidth / 2;
    const highlightY = textBaseline - 19;

    canvasCtx.save();
    canvasCtx.shadowColor = "#00f5d4";
    canvasCtx.shadowBlur = 12 + pulse * 14;
    canvasCtx.fillStyle = `rgba(0, 245, 212, ${0.62 + pulse * 0.25})`;
    canvasCtx.beginPath();
    canvasCtx.roundRect(highlightX, highlightY, highlightWidth, 24, 5);
    canvasCtx.fill();
    canvasCtx.restore();

    canvasCtx.fillStyle = "#07131b";
    canvasCtx.fillText(currentLetter, nextLetterX, textBaseline);
    canvasCtx.fillStyle = `rgba(112, 255, 240, ${0.65 + pulse * 0.35})`;
    canvasCtx.fillRect(
        highlightX + (highlightWidth - 12) / 2,
        highlightY + 26 + Math.sin((performance.now() - arcadeAnimationStart) / 150) * 2,
        12,
        3
    );
    nextLetterX += currentLetterWidth;
}

canvasCtx.fillStyle = "#d7e0e9";
canvasCtx.fillText(host.text.substring(typedLength + (isTargeted ? 1 : 0)), nextLetterX, textBaseline);
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
const slotX = gameCanvas.width / 2 - 54;
const slotY = gameCanvas.height / 2 - 64;
canvasCtx.fillStyle = "rgba(9, 17, 27, 0.82)";
canvasCtx.strokeStyle = "rgba(0, 245, 212, 0.75)";
canvasCtx.lineWidth = 2;
canvasCtx.beginPath();
canvasCtx.roundRect(slotX, slotY, 108, 128, 16);
canvasCtx.fill();
canvasCtx.stroke();

canvasCtx.fillStyle = "rgba(112, 255, 240, 0.65)";
canvasCtx.font = "600 13px 'Segoe UI', sans-serif";
canvasCtx.textAlign = "center";
canvasCtx.fillText("TYPE THIS", gameCanvas.width / 2, slotY + 24);

const targetNode = memorySpaceState.entities[0];
if (targetNode) {
    const pulse = 0.65 + (Math.sin((performance.now() - arcadeAnimationStart) / 180) + 1) * 0.15;
    canvasCtx.save();
    canvasCtx.shadowColor = "#00f5d4";
    canvasCtx.shadowBlur = 10 + pulse * 12;
    canvasCtx.fillStyle = `rgba(0, 245, 212, ${pulse})`;
    canvasCtx.font = "700 64px 'Segoe UI', sans-serif";
    canvasCtx.fillText(targetNode.char, gameCanvas.width / 2, slotY + 94);
    canvasCtx.restore();
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
memorySpaceState.entities[matchingNodeIdx] = createBlitzLetter(
    memorySpaceState.entities[matchingNodeIdx].char
);
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

let racePeer = null;
let raceConnection = null;
let raceProgressTimer = null;
let activeRace = null;

const raceOverlay = document.getElementById("race-overlay");
const raceStatus = document.getElementById("race-status");
const raceLobby = document.getElementById("race-lobby");
const raceMatch = document.getElementById("race-match");
const raceTypingInput = document.getElementById("race-typing-input");

function getRacePlayerName() {
    const nameField = document.getElementById("race-player-name");
    const name = nameField.value.trim()
        || document.getElementById("profile-name-display").textContent.trim()
        || "Guest";
    if (name.length > 24) {
        throw new Error("Your name must be 24 characters or fewer.");
    }
    return name;
}

function showRaceMatch() {
    raceLobby.hidden = true;
    raceMatch.hidden = false;
    raceTypingInput.value = "";
    raceTypingInput.disabled = true;
    renderRaceRoom();
}

function resetRaceConnection() {
    clearTimeout(raceProgressTimer);
    if (raceConnection) {
        raceConnection.close();
        raceConnection = null;
    }
    if (racePeer) {
        racePeer.destroy();
        racePeer = null;
    }
}

function setRaceError(message) {
    raceStatus.textContent = message;
    document.getElementById("race-match-status").textContent = message;
}

function handleRacePeerError(error) {
    const message = error && error.message ? error.message : "Unknown PeerJS error";
    setRaceError(`PeerJS connection error: ${message}`);
    if (!raceLobby.hidden) {
        activeRace = null;
        resetRaceConnection();
        document.getElementById("race-create-button").disabled = false;
        document.getElementById("race-join-button").disabled = false;
    }
}

function openRaceLobby() {
    if (currentArcadeEngineType) closeArcade();
    clearInterval(countdownTimer);
    testRunning = false;
    document.getElementById("race-create-button").disabled = false;
    document.getElementById("race-join-button").disabled = false;
    document.getElementById("typing-app").style.display = "none";
    document.getElementById("results-screen").style.display = "none";
    raceOverlay.style.display = "flex";
    raceOverlay.setAttribute("aria-hidden", "false");
    raceLobby.hidden = false;
    raceMatch.hidden = true;
    raceStatus.textContent = "Create a room and share its code, or enter another player's code.";
    document.getElementById("race-player-name").value =
        document.getElementById("profile-name-display").textContent.trim();
}

function closeRaceLobby() {
    activeRace = null;
    resetRaceConnection();
    document.getElementById("race-create-button").disabled = false;
    document.getElementById("race-join-button").disabled = false;
    raceOverlay.style.display = "none";
    raceOverlay.setAttribute("aria-hidden", "true");
    document.getElementById("typing-app").style.display = "flex";
    initTypingTest();
}

function createRacePrompt() {
    const words = [...vocabularyPool].sort(() => Math.random() - 0.5).slice(0, 18);
    return words.join(" ");
}

function createRaceRoom() {
    const createButton = document.getElementById("race-create-button");
    createButton.disabled = true;
    try {
        const hostName = getRacePlayerName();
        if (!window.Peer) {
            throw new Error("Could not load PeerJS. Check your internet connection and reload.");
        }
        resetRaceConnection();
        activeRace = {
            player: "host",
            hostName,
            guestName: null,
            prompt: createRacePrompt(),
            hostProgress: 0,
            guestProgress: 0,
            status: "waiting",
            winner: null,
            inputValue: ""
        };
        raceStatus.textContent = "Connecting to the PeerJS signaling service...";
        racePeer = new Peer();
        racePeer.on("open", (peerId) => {
            if (!activeRace || activeRace.player !== "host") return;
            activeRace.code = peerId;
            document.getElementById("race-room-label").textContent = `Room ${peerId}`;
            document.getElementById("race-match-status").textContent =
                "Waiting for a player. Share this room code to start.";
            showRaceMatch();
            raceStatus.textContent = "Share the room code with the other player.";
        });
        racePeer.on("connection", (connection) => {
            if (!activeRace || activeRace.player !== "host" || raceConnection) {
                connection.close();
                return;
            }
            raceConnection = connection;
            attachRaceConnection(connection);
        });
        racePeer.on("error", (error) => {
            handleRacePeerError(error);
        });
    } catch (error) {
        raceStatus.textContent = `Could not create room: ${error.message}`;
        createButton.disabled = false;
    }
}

function joinRaceRoom() {
    const joinButton = document.getElementById("race-join-button");
    try {
        const roomCode = document.getElementById("race-room-code-input").value.trim();
        if (!roomCode) throw new Error("Enter the host's room code.");
        const guestName = getRacePlayerName();
        if (!window.Peer) {
            throw new Error("Could not load PeerJS. Check your internet connection and reload.");
        }
        resetRaceConnection();
        activeRace = { player: "guest", guestName, inputValue: "" };
        joinButton.disabled = true;
        raceStatus.textContent = "Connecting to the host...";
        racePeer = new Peer();
        racePeer.on("open", () => {
            if (!activeRace || activeRace.player !== "guest") return;
            raceConnection = racePeer.connect(roomCode, { reliable: true });
            attachRaceConnection(raceConnection);
        });
        racePeer.on("error", (error) => {
            handleRacePeerError(error);
        });
    } catch (error) {
        raceStatus.textContent = `Could not join room: ${error.message}`;
        joinButton.disabled = false;
    }
}

function attachRaceConnection(connection) {
    connection.on("open", () => {
        if (!activeRace) return;
        if (activeRace.player === "guest") {
            connection.send({ type: "join", name: activeRace.guestName });
            document.getElementById("race-room-label").textContent = `Room ${connection.peer}`;
            document.getElementById("race-match-status").textContent = "Connected. Waiting for the host...";
            showRaceMatch();
        }
    });
    connection.on("data", (message) => handleRaceMessage(message));
    connection.on("close", () => {
        if (!activeRace) return;
        setRaceError("The other player disconnected.");
        raceTypingInput.disabled = true;
    });
    connection.on("error", (error) => {
        setRaceError(`Race connection error: ${error.message}`);
    });
}

function sendRaceMessage(message) {
    if (raceConnection && raceConnection.open) {
        raceConnection.send(message);
    }
}

function handleRaceMessage(message) {
    if (!activeRace || !message || typeof message !== "object") return;
    if (activeRace.player === "host" && message.type === "join") {
        if (activeRace.status !== "waiting" || typeof message.name !== "string") return;
        const guestName = message.name.trim().slice(0, 24) || "Guest";
        activeRace.guestName = guestName;
        activeRace.status = "racing";
        sendRaceMessage({ type: "state", race: getRaceSnapshot() });
        renderRaceRoom();
        return;
    }
    if (activeRace.player === "host" && message.type === "progress") {
        applyRaceProgress("guest", message.progress);
        broadcastRaceState();
        renderRaceRoom();
        return;
    }
    if (activeRace.player === "guest" && message.type === "state") {
        const race = message.race;
        if (!race || typeof race.prompt !== "string" || race.prompt.length > 500) return;
        activeRace.code = race.code;
        activeRace.hostName = race.hostName;
        activeRace.guestName = race.guestName;
        activeRace.prompt = race.prompt;
        activeRace.hostProgress = race.hostProgress;
        activeRace.guestProgress = race.guestProgress;
        activeRace.status = race.status;
        activeRace.winner = race.winner;
        renderRaceRoom();
        return;
    }
    if (activeRace.player === "guest" && message.type === "progress") {
        applyRaceProgress("host", message.progress);
        renderRaceRoom();
    }
}

function getRaceSnapshot() {
    return {
        code: activeRace.code,
        hostName: activeRace.hostName,
        guestName: activeRace.guestName,
        prompt: activeRace.prompt,
        hostProgress: activeRace.hostProgress,
        guestProgress: activeRace.guestProgress,
        status: activeRace.status,
        winner: activeRace.winner
    };
}

function applyRaceProgress(player, progress) {
    if (!Number.isInteger(progress) || progress < 0 || progress > activeRace.prompt.length) return;
    if (player === "host") activeRace.hostProgress = progress;
    else activeRace.guestProgress = progress;
    if (progress === activeRace.prompt.length && activeRace.status === "racing") {
        activeRace.status = "finished";
        activeRace.winner = player === "host" ? activeRace.hostName : activeRace.guestName;
    }
}

function broadcastRaceState() {
    sendRaceMessage({ type: "state", race: getRaceSnapshot() });
}

function renderRaceRoom() {
    if (!activeRace || !activeRace.prompt) return;
    raceTypingInput.maxLength = activeRace.prompt.length;
    document.getElementById("race-prompt").textContent = activeRace.prompt;
    document.getElementById("race-host-name").textContent = activeRace.hostName || "Host";
    document.getElementById("race-guest-name").textContent = activeRace.guestName || "Waiting for player...";
    document.getElementById("race-room-label").textContent = `Room ${activeRace.code || ""}`;

    const promptLength = activeRace.prompt.length;
    const hostPercent = promptLength ? Math.round(activeRace.hostProgress / promptLength * 100) : 0;
    const guestPercent = promptLength ? Math.round(activeRace.guestProgress / promptLength * 100) : 0;
    document.getElementById("race-host-progress").style.width = `${hostPercent}%`;
    document.getElementById("race-guest-progress").style.width = `${guestPercent}%`;
    document.getElementById("race-host-percent").textContent = `${hostPercent}%`;
    document.getElementById("race-guest-percent").textContent = `${guestPercent}%`;

    if (activeRace.status === "waiting") {
        document.getElementById("race-match-status").textContent =
            "Waiting for another player. Share your room code to start.";
        raceTypingInput.disabled = true;
    } else if (activeRace.status === "racing") {
        document.getElementById("race-match-status").textContent = "Race on! Type the text as fast as you can.";
        raceTypingInput.disabled = false;
        if (document.activeElement !== raceTypingInput) raceTypingInput.focus();
        raceStatus.textContent = "";
    } else {
        document.getElementById("race-match-status").textContent =
            `${activeRace.winner || "A player"} won the race!`;
        raceTypingInput.disabled = true;
        raceStatus.textContent = "Race finished.";
    }
}

function copyRaceRoomCode() {
    if (!activeRace || !activeRace.code) return;
    if (!navigator.clipboard) {
        raceStatus.textContent = `Room code: ${activeRace.code}`;
        return;
    }
    navigator.clipboard.writeText(activeRace.code)
        .then(() => { raceStatus.textContent = `Copied room code ${activeRace.code}.`; })
        .catch((error) => { raceStatus.textContent = `Could not copy the room code: ${error.message}`; });
}

function leaveRaceRoom() {
    activeRace = null;
    resetRaceConnection();
    raceMatch.hidden = true;
    raceLobby.hidden = false;
    document.getElementById("race-create-button").disabled = false;
    document.getElementById("race-join-button").disabled = false;
    raceStatus.textContent = "Create a room and share its code, or enter another player's code.";
}

raceTypingInput.addEventListener("input", () => {
    if (!activeRace || activeRace.status !== "racing") return;
    const prompt = activeRace.prompt;
    const entered = raceTypingInput.value.slice(0, prompt.length);
    if (raceTypingInput.value !== entered) raceTypingInput.value = entered;
    activeRace.inputValue = entered;

    let correctProgress = 0;
    while (correctProgress < entered.length
        && entered[correctProgress] === prompt[correctProgress]) {
        correctProgress++;
    }

    clearTimeout(raceProgressTimer);
    raceProgressTimer = setTimeout(() => {
        if (!activeRace) return;
        if (activeRace.player === "host") {
            applyRaceProgress("host", correctProgress);
            broadcastRaceState();
            renderRaceRoom();
        } else {
            sendRaceMessage({ type: "progress", progress: correctProgress });
        }
    }, 120);
});

document.getElementById("race-room-code-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") joinRaceRoom();
});

window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && raceOverlay.style.display === "flex") {
        closeRaceLobby();
    }
});