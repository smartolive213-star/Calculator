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