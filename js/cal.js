const display = document.getElementById('display');
const calculationHistory = [];
let activePanel = null;
let speechRecognition = null;

    // Add ripple effect to all buttons on click
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function (e) {
            const circle = document.createElement('span');
            const diameter = Math.max(this.clientWidth, this.clientHeight);
            const radius = diameter / 2;

            const rect = this.getBoundingClientRect();
            circle.style.width = circle.style.height = `${diameter}px`;
            circle.style.left = `${e.clientX - rect.left - radius}px`;
            circle.style.top = `${e.clientY - rect.top - radius}px`;
            circle.classList.add('ripple');

            const ripple = this.getElementsByClassName('ripple')[0];
            if (ripple) {
                ripple.remove();
            }

            this.appendChild(circle);
        });
    });

    function appendValue(val) {
        display.value += val;
    }

    function clearDisplay() {
        display.value = '';
    }

    function deleteLast() {
        display.value = display.value.slice(0, -1);
    }

    function calculate() {
        try {
            if (display.value) {
                const expression = display.value;
                display.value = String(eval(expression));
                if (display.value !== 'NaN' && display.value !== 'Infinity') {
                    calculationHistory.unshift({ expression, result: display.value });
                    calculationHistory.splice(20);
                }
                renderHistory();
                triggerPulse();
            }
        } catch (e) {
            display.value = 'Error';
            triggerPulse();
        }
    }

    function triggerPulse() {
        display.classList.remove('pulse');
        void display.offsetWidth; // Trigger reflow for re-animation
        display.classList.add('pulse');
    }
    // Physical Keyboard Listener with Visual Button Feedback
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && activePanel) {
        closeDateCalculator();
        return;
    }
    const key = event.key;
    let buttonSelector = null;

    // Handle Number keys (0-9) and Decimal point
    if ((key >= '0' && key <= '9') || key === '.') {
        appendValue(key);
        buttonSelector = `button[onclick="appendValue('${key}')"]`;
    }
    // Handle standard operators
    else if (key === '+' || key === '-' || key === '*' || key === '/') {
        appendValue(key);
        buttonSelector = `button[onclick="appendValue('${key}')"]`;
    }
    // Handle exponentiation key (Caret '^')
    else if (key === '^') {
        appendValue('**');
        buttonSelector = `button[onclick="appendValue('**')"]`;
    }
    // Handle Percentage
    else if (key === '%') {
        calculatePercentage();
        buttonSelector = `button[onclick="calculatePercentage()"]`;
    }
    // Handle Equals / Enter
    else if (key === 'Enter' || key === '=') {
        event.preventDefault(); // Prevents triggering default button re-presses
        calculate();
        buttonSelector = `button[onclick="calculate()"]`;
    }
    // Handle Backspace (Delete last digit)
    else if (key === 'Backspace') {
        deleteLast();
        buttonSelector = `button[onclick="deleteLast()"]`;
    }
    // Handle Escape or 'c' / 'C' (Clear display)
    else if (key === 'Escape' || key.toLowerCase() === 'c') {
        clearDisplay();
        buttonSelector = `button[onclick="clearDisplay()"]`;
    }

    // Trigger physical button visual feedback
    if (buttonSelector) {
        const targetButton = document.querySelector(buttonSelector);
        if (targetButton) {
            triggerButtonVisual(targetButton);
        }
    }
});

// Function to animate the button when activated by physical keypress
function triggerButtonVisual(btn) {
    // 1. Add keypress highlight style
    btn.classList.add('keyboard-active');

    // 2. Trigger visual ripple effect
    const circle = document.createElement('span');
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${btn.clientWidth / 2 - radius}px`;
    circle.style.top = `${btn.clientHeight / 2 - radius}px`;
    circle.classList.add('ripple');

    const existingRipple = btn.getElementsByClassName('ripple')[0];
    if (existingRipple) {
        existingRipple.remove();
    }
    btn.appendChild(circle);

    // 3. Remove highlight style after release animation
    setTimeout(() => {
        btn.classList.remove('keyboard-active');
    }, 150);
}
// Calculate future/past date based on days added/subtracted
function calculateFutureDate() {
    const baseDateVal = document.getElementById('baseDate').value;
    const daysInputVal = document.getElementById('daysInput').value;
    const resultMain = document.getElementById('resultMain');
    const resultSub = document.getElementById('resultSub');

    if (!baseDateVal || daysInputVal === '') {
        resultMain.textContent = 'Enter base date and days';
        resultSub.textContent = 'Day of week & formatted date';
        return;
    }

    let date = parseLocalDate(baseDateVal);
    let days = parseInt(daysInputVal, 10);

    if (isNaN(days)) return;

    // Add or subtract days
    date.setDate(date.getDate() + days);

    // Format output
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    resultMain.textContent = date.toLocaleDateString('en-US', options);
    resultSub.textContent = `Offset: ${days >= 0 ? '+' + days : days} days`;
}

// Calculate exact difference between two dates (Years, Months, Days)
function calculateDateDifference() {
    const startVal = document.getElementById('startDate').value;
    const endVal = document.getElementById('endDate').value;
    const resultMain = document.getElementById('diffResultMain');
    const resultSub = document.getElementById('diffResultSub');

    if (!startVal || !endVal) {
        resultMain.textContent = 'Type or select both dates';
        resultSub.textContent = 'Years, Months & Days';
        return;
    }

    let start = parseLocalDate(startVal);
    let end = parseLocalDate(endVal);

    let isReversed = false;
    if (start > end) {
        [start, end] = [end, start];
        isReversed = true;
    }

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
        months--;
        const prevMonthLastDay = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
        days += prevMonthLastDay;
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    const totalDays = Math.round((end - start) / (1000 * 60 * 60 * 24));

    let outputStr = [];
    if (years > 0) outputStr.push(`${years} ${years === 1 ? 'year' : 'years'}`);
    if (months > 0) outputStr.push(`${months} ${months === 1 ? 'month' : 'months'}`);
    if (days > 0 || outputStr.length === 0) outputStr.push(`${days} ${days === 1 ? 'day' : 'days'}`);

    resultMain.textContent = outputStr.join(', ');
    resultSub.textContent = `${isReversed ? 'Reverse Difference' : 'Total duration'}: ${totalDays.toLocaleString()} days`;
}

// Preset helper: Set input to Today's date
function setToday(inputId) {
    const today = localDateValue(new Date());
    const input = document.getElementById(inputId);
    if (input) {
        input.value = today;
        if (inputId === 'baseDate') calculateFutureDate();
        if (inputId === 'endDate' || inputId === 'startDate') calculateDateDifference();
    }
}

// Preset helper: Add specific days shortcut
function addDaysPreset(daysCount) {
    const daysInput = document.getElementById('daysInput');
    if (daysInput) {
        daysInput.value = daysCount;
        calculateFutureDate();
    }
}

// Preset helper: Swap Start and End dates
function swapDates() {
    const startElem = document.getElementById('startDate');
    const endElem = document.getElementById('endDate');
    if (startElem && endElem) {
        const temp = startElem.value;
        startElem.value = endElem.value;
        endElem.value = temp;
        calculateDateDifference();
    }
}
function localDateValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function parseLocalDate(value) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
}

function openPanel(panel) {
    const drawer = document.getElementById('dateCalculatorScreen');
    activePanel = panel;
    document.body.classList.add('drawer-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.getElementById('utilityTabs').hidden = panel === 'history';
    document.getElementById('historyView').hidden = panel !== 'history';
    document.querySelectorAll('.drawer-content[id$="-tab"]').forEach(tab => {
        if (panel === 'history') tab.hidden = true;
    });
    document.getElementById('drawerTitle').textContent = panel === 'history' ? 'History' : 'Date calculator';
    if (panel === 'history') renderHistory();
}

function openDateCalculator() {
    openPanel('utilities');
    switchTab('date-tab');
}

function openUtilities() {
    openDateCalculator();
}

function closeDateCalculator() {
    activePanel = null;
    document.body.classList.remove('drawer-open');
    document.getElementById('dateCalculatorScreen').setAttribute('aria-hidden', 'true');
}

function switchTab(tabId, button) {
    document.querySelectorAll('.drawer-content[id$="-tab"]').forEach(tab => {
        tab.hidden = tab.id !== tabId;
    });
    document.querySelectorAll('.drawer-tab').forEach(tab => tab.classList.toggle('active', tab === button || (!button && tab.textContent === (tabId === 'date-tab' ? 'Add days' : 'Date difference'))));
    document.getElementById('drawerTitle').textContent = tabId === 'date-tab' ? 'Date calculator' : 'Date difference';
}

function toggleHistoryDrawer() {
    if (activePanel === 'history') {
        closeDateCalculator();
    } else {
        openPanel('history');
    }
}

function renderHistory() {
    const list = document.getElementById('historyList');
    list.replaceChildren();
    if (!calculationHistory.length) {
        const empty = document.createElement('p');
        empty.className = 'history-empty';
        empty.textContent = 'Your completed calculations will appear here.';
        list.appendChild(empty);
        return;
    }
    calculationHistory.forEach(item => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'history-item';
        const expression = document.createElement('span');
        expression.className = 'history-expression';
        expression.textContent = item.expression;
        const result = document.createElement('span');
        result.className = 'history-result';
        result.textContent = `= ${item.result}`;
        button.append(expression, result);
        button.addEventListener('click', () => {
            display.value = item.result;
            closeDateCalculator();
        });
        list.appendChild(button);
    });
}

function clearHistory() {
    calculationHistory.length = 0;
    renderHistory();
}

function nextMode() {
    const calculator = document.getElementById('mainCalculatorView');
    const scientific = calculator.classList.toggle('scientific-mode');
    document.getElementById('modeBtn').textContent = scientific ? 'STD' : 'SCI';
    document.getElementById('displayCaption').textContent = scientific ? 'SCIENTIFIC' : 'STANDARD';
    document.getElementById('modeBtn').title = scientific ? 'Switch to standard mode' : 'Switch to scientific mode';
}

function toggleVoiceInput() {
    if (speechRecognition) {
        speechRecognition.stop();
        speechRecognition = null;
        return;
    }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
        window.alert('Voice input is not supported by this browser.');
        return;
    }
    speechRecognition = new Recognition();
    speechRecognition.lang = navigator.language || 'en-US';
    speechRecognition.onstart = () => document.getElementById('micBtn').classList.add('mic-listening');
    speechRecognition.onend = () => {
        document.getElementById('micBtn').classList.remove('mic-listening');
        speechRecognition = null;
    };
    speechRecognition.onresult = event => {
        const spoken = event.results[0][0].transcript.toLowerCase()
            .replace(/\b(?:multiplied by|times)\b/g, '*')
            .replace(/\b(?:divided by|divide by)\b/g, '/')
            .replace(/\bplus\b/g, '+')
            .replace(/\bminus\b/g, '-')
            .replace(/\bpoint\b/g, '.')
            .replace(/\s+/g, '');
        display.value += spoken.replace(/[^0-9+*/().-]/g, '');
    };
    speechRecognition.start();
}

const baseDateInput = document.getElementById('baseDate');
if (baseDateInput) baseDateInput.value = localDateValue(new Date());