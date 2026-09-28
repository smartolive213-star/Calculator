const display = document.getElementById('display');

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
                display.value = eval(display.value);
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