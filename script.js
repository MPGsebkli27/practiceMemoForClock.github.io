document.addEventListener('DOMContentLoaded', function () {
    const startButton = document.getElementById('startButton');
    const stopwatch = document.getElementById('stopwatch');
    const numberDisplay = document.getElementById('numberDisplay');
    const buttons = document.querySelectorAll('.choice');
    const resultDiv = document.getElementById('result');
    const gameModeSelect = document.getElementById('gameMode');
    const easierTopTimes = document.getElementById('easierTopTimes');
    const harderTopTimes = document.getElementById('harderTopTimes');
    const sessionAttempts = document.getElementById('sessionAttempts');
    const totalAttempts = document.getElementById('totalAttempts');
    const sightBlocker = document.getElementById('sightblocker');

    let timer;
    let startTime;
    let currentIndex = 0;
    let sesAttempts = 0;
    let interruptions = getCookie('interruptions') || -1;
    let totAttempts = getCookie('totalNumberOfAttempts') || 0;
    totalAttempts.innerText = totAttempts;
    let numbers = [];
    let userAnswers = [];
    let correctAnswers = [];
    let currentGameMode = getCookie('gameMode') || 'original'; // Default to original mode

    gameModeSelect.value = currentGameMode; // Set select to the last saved mode
    totAttempts.innerText = totAttempts;
    loadTopTimes();

    const numberToLetter = {
        0: 'O', 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E', 6: 'F', 7: 'G', 8: 'H', 9: 'I', 10: 'J', 11: 'K', 12: 'O',
        '-11': 'A', '-10': 'B', '-9': 'C', '-8': 'D', '-7': 'E', '-6': 'F', '-5': 'G', '-4': 'H', '-3': 'I', '-2': 'J', '-1': 'K'
    };

    function startStopwatch() {
        startTime = new Date().getTime();
        timer = setInterval(() => {
            const elapsedTime = new Date().getTime() - startTime;
            stopwatch.textContent = formatTime(elapsedTime);
        }, 10);
    }

    function stopStopwatch() {
        clearInterval(timer);
    }

    function formatTime(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(2);
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(5, '0')}`;
    }

    function generateRandomNumber() {
        return Math.floor(Math.random() * 12) - 5;
    }

    function generateAdditionProblem() {
        const num1 = generateRandomNumber();
        const num2 = generateRandomNumber();
        return {
            problem: `${num1} + ${num2}`,
            result: num1 + num2
        };
    }

    function showNextNumber() {
        if (currentIndex < 6) {
            setCookie('gameRunning', 'true', 365);
            let number, letter, problem;
            if (currentGameMode === 'harder' && (currentIndex === 0 || currentIndex === 3)) {
                const additionProblem = generateAdditionProblem();
                problem = additionProblem.problem;
                number = additionProblem.result;
                numberDisplay.textContent = problem;
            } else {
                number = generateRandomNumber();
                numberDisplay.textContent = number;
            }
            numbers.push(number);
            letter = numberToLetter[number.toString()];
            correctAnswers.push(letter);
            currentIndex++;
        } else {
            setCookie('gameRunning', 'false', 365);
            stopStopwatch();
            displayResults();
            resetGame();
        }
    }

    function displayResults() {
        let correctCount = 0;
        let resultHTML = `<p>Time: ${stopwatch.textContent}</p>`;
        resultHTML += `<p>Numbers and Answers:</p><ul>`;

        for (let i = 0; i < correctAnswers.length; i++) {
            const isCorrect = userAnswers[i] === correctAnswers[i];
            if (!isCorrect) {
                resultHTML += `<li>
                    Number: ${numbers[i]}, 
                    Your Answer: ${userAnswers[i]}, 
                    Correct Answer: ${correctAnswers[i]} 
                    ${isCorrect ? '(Correct)' : '(Wrong)'}
                </li>`;
            } else {
                correctCount++;
            }
        }

        const accuracy = ((correctCount / correctAnswers.length) * 100).toFixed(2);
        resultHTML += `</ul><p>Accuracy: ${accuracy}%</p>`;

        resultDiv.innerHTML = resultHTML;

        if (accuracy === '100.00') {
            saveTime(stopwatch.textContent);
        } else {
            resultDiv.innerHTML += `<p>Your time was not added to the top times list because your accuracy was not 100%.</p>`;
        }
    }

    function handleChoiceClick(event) {
        const letter = event.target.getAttribute('data-letter');
        userAnswers.push(letter);
        showNextNumber();
    }

    function saveTime(time) {
        let times = getTopTimes(currentGameMode);
        times.push(time);
        times.sort();
        if (times.length > 10) {
            times = times.slice(0, 10);
        }
        setTopTimes(currentGameMode, times);
        loadTopTimes();
    }

    function loadTopTimes() {
        const easierTimes = getTopTimes('original');
        const harderTimes = getTopTimes('harder');

        easierTopTimes.innerHTML = easierTimes.map(time => `<li>${time}</li>`).join('');
        harderTopTimes.innerHTML = harderTimes.map(time => `<li>${time}</li>`).join('');
    }

    function getTopTimes(mode) {
        const times = getCookie(`topTimes_${mode}`);
        return times ? times.split(',') : [];
    }

    function setTopTimes(mode, times) {
        setCookie(`topTimes_${mode}`, times.join(','), 365);
    }

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value}; ${expires}; path=/`;
    }

    function resetGame() {
        startButton.disabled = false;
    }

    startButton.addEventListener('click', () => {
        startButton.disabled = true;
        currentIndex = 0;
        numbers = [];
        userAnswers = [];
        correctAnswers = [];
        resultDiv.innerHTML = ''; // Clear previous results
        numberDisplay.textContent = 'Get ready!';
        setTimeout(() => {
            startStopwatch();
            showNextNumber();
        }, 1000);
        sesAttempts++;
        totAttempts++;
        sessionAttempts.innerText = sesAttempts;
        totalAttempts.innerText = totAttempts;
        setCookie('totalNumberOfAttempts', totAttempts, 365);
    });

    gameModeSelect.addEventListener('change', (event) => {
        currentGameMode = event.target.value;
        setCookie('gameMode', currentGameMode, 365);
    });

    buttons.forEach(button => {
        button.addEventListener('click', handleChoiceClick);
    });

    if ((performance.navigation.type == performance.navigation.TYPE_RELOAD) && (getCookie('gameRunning') == 'true')) {
        if (interruptions >= 10) {
            document.getElementById('container').style.display = 'none';
            sightBlocker.style.display = 'block';
            startButton.disabled = true;
            buttons.forEach(button => {
                button.disabled = true;
            });
        } else {
            interruptions++;
            setCookie('interruptions', interruptions, 0.00347222);
        }
        console.info("This page is reloaded");
    }
});