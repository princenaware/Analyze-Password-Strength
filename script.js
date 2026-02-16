// Shared: theme toggle
const body = document.body;
const themeToggle = document.getElementById('themeToggle');

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('light-mode');
        body.classList.toggle('dark-mode');
        themeToggle.textContent = body.classList.contains('dark-mode') ? '🌙' : '☀️';
        localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
    });

    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        themeToggle.textContent = '🌙';
    }
}

// Analyzer-specific logic
const passwordInput = document.getElementById('passwordInput');
if (passwordInput) {
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    const suggestionText = document.getElementById('suggestionText');
    const crackTimeText = document.getElementById('crackTimeText');
    const togglePassword = document.getElementById('togglePassword');
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const generatedSection = document.getElementById('generatedSection');
    const generatedPassword = document.getElementById('generatedPassword');

    // Toggle password visibility
    togglePassword.addEventListener('click', (e) => {
        e.preventDefault();
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
    });

    function checkPasswordStrength(password) {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        };

        document.getElementById('req-length').classList.toggle('met', requirements.length);
        document.getElementById('req-uppercase').classList.toggle('met', requirements.uppercase);
        document.getElementById('req-lowercase').classList.toggle('met', requirements.lowercase);
        document.getElementById('req-number').classList.toggle('met', requirements.number);
        document.getElementById('req-special').classList.toggle('met', requirements.special);

        let score = 0;
        for (let key in requirements) {
            if (requirements[key]) score += 20;
        }

        if (password.length >= 12) score += 10;
        if (password.length >= 16) score += 10;

        updateStrengthDisplay(score, password, requirements);
        estimateCrackTime(password);
    }

    function updateStrengthDisplay(score, password, requirements) {
        let strengthLevel = '';
        let strengthColor = '';
        let barWidth = 0;

        if (password.length === 0) {
            strengthLevel = 'Enter a password';
            strengthColor = '#9ca3af';
            barWidth = 0;
            suggestionText.textContent = 'Start typing to see personalized suggestions to improve your password.';
        } else if (score < 20) {
            strengthLevel = 'Very Weak 🔴';
            strengthColor = '#ef4444';
            barWidth = 20;
        } else if (score < 40) {
            strengthLevel = 'Weak 🟠';
            strengthColor = '#f97316';
            barWidth = 40;
        } else if (score < 60) {
            strengthLevel = 'Fair 🟡';
            strengthColor = '#facc15';
            barWidth = 60;
        } else if (score < 80) {
            strengthLevel = 'Good 🟢';
            strengthColor = '#22c55e';
            barWidth = 80;
        } else {
            strengthLevel = 'Very Strong 💪';
            strengthColor = '#22c55e';
            barWidth = 100;
        }

        strengthBar.style.width = barWidth + '%';
        strengthBar.style.backgroundColor = strengthColor;
        strengthText.textContent = strengthLevel;

        if (password.length > 0) {
            suggestionText.textContent = buildSuggestions(password, requirements);
        }
    }

    function buildSuggestions(password, requirements) {
        const suggestions = [];

        if (!requirements.length) {
            suggestions.push('Increase the length to at least 8 characters (12+ is better).');
        } else if (password.length < 12) {
            suggestions.push('Try extending it to 12–16 characters for better security.');
        }

        if (!requirements.uppercase) {
            suggestions.push(' Add one or more uppercase letters (A–Z).');
        }

        if (!requirements.lowercase) {
            suggestions.push(' Add some lowercase letters (a–z).');
        }

        if (!requirements.number) {
            suggestions.push(' Include at least one number (0–9).');
        }

        if (!requirements.special) {
            suggestions.push(' Include a special character like !, @, #, or $.');
        }

        if (suggestions.length === 0) {
            return 'Nice! This password looks strong. Just make sure you do not reuse it on multiple sites.';
        }

        return suggestions.join(' ');
    }

    // Crack time estimation (simple brute-force model)
    function estimateCrackTime(password) {
        if (!password || !crackTimeText) {
            if (crackTimeText) {
                crackTimeText.textContent = 'Estimated time to crack (brute force): –';
            }
            return;
        }

        let charsetSize = 0;
        if (/[a-z]/.test(password)) charsetSize += 26;
        if (/[A-Z]/.test(password)) charsetSize += 26;
        if (/[0-9]/.test(password)) charsetSize += 10;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) charsetSize += 32;

        if (charsetSize === 0) charsetSize = 1;

        const length = password.length;
        const guessesPerSecond = 1e9; // 1 billion guesses per second (approx)
        // to avoid overflow for very large lengths, work in logs
        const logTotalComb = length * Math.log10(charsetSize);
        const logGuessesPerSecond = Math.log10(guessesPerSecond);
        const logSeconds = logTotalComb - logGuessesPerSecond;

        let timeText = '';

        if (logSeconds < -2) {
            timeText = '< 0.01 second (almost instant)';
        } else {
            const seconds = Math.pow(10, logSeconds);
            timeText = formatCrackTime(seconds);
        }

        crackTimeText.textContent = 'Estimated time to crack (brute force): ' + timeText;
    }

    function formatCrackTime(seconds) {
        if (seconds < 1) return '< 1 second';
        if (seconds < 60) return seconds.toFixed(1) + ' seconds';

        const minutes = seconds / 60;
        if (minutes < 60) return minutes.toFixed(1) + ' minutes';

        const hours = minutes / 60;
        if (hours < 24) return hours.toFixed(1) + ' hours';

        const days = hours / 24;
        if (days < 365) return days.toFixed(1) + ' days';

        const years = days / 365;
        if (years < 1e6) return years.toFixed(1) + ' years';

        const millions = years / 1e6;
        if (millions < 1e3) return millions.toFixed(1) + ' million years';

        const billions = years / 1e9;
        return billions.toFixed(1) + ' billion years';
    }

    function generateStrongPassword() {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        const allChars = uppercase + lowercase + numbers + special;
        let password = '';

        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += special[Math.floor(Math.random() * special.length)];

        for (let i = password.length; i < 16; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }

        password = password.split('').sort(() => 0.5 - Math.random()).join('');
        return password;
    }

    generateBtn.addEventListener('click', () => {
        const newPassword = generateStrongPassword();
        passwordInput.value = newPassword;
        passwordInput.type = 'text';
        togglePassword.textContent = '🙈';

        generatedPassword.textContent = newPassword;
        generatedSection.classList.add('show');
        copyBtn.style.display = 'block';
        copyBtn.textContent = 'Copy to Clipboard';
        copyBtn.classList.remove('copied');

        checkPasswordStrength(newPassword);
    });

    copyBtn.addEventListener('click', () => {
        const password = generatedPassword.textContent;
        navigator.clipboard.writeText(password).then(() => {
            copyBtn.textContent = '✓ Copied!';
            copyBtn.classList.add('copied');
            setTimeout(() => {
                copyBtn.textContent = 'Copy to Clipboard';
                copyBtn.classList.remove('copied');
            }, 2000);
        });
    });

    passwordInput.addEventListener('input', (e) => {
        const password = e.target.value;
        generatedSection.classList.remove('show');
        copyBtn.style.display = 'none';
        checkPasswordStrength(password);
    });
}
