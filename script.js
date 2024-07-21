const quizContainer = document.getElementById('quiz-container');
const questionContainer = document.getElementById('question-container');
const answerButtons = document.getElementById('answer-buttons');
const actionButton = document.getElementById('action-button');
const feedbackContainer = document.getElementById('feedback'); // New element
const nightModeToggle = document.getElementById('night-mode-toggle');
const body = document.body;

let currentQuestionIndex = 0;
let questions = [];
let isAnswered = false;
let selectedAnswers = [];

async function getQuestions() {
    try {
        const response = await fetch('questions.yaml');
        const yamlText = await response.text();
        questions = jsyaml.load(yamlText); // Use js-yaml to parse YAML
        startGame();
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

function startGame() {
    currentQuestionIndex = 0;
    isAnswered = false;
    feedbackContainer.innerText = ''; // Clear previous feedback
    selectedAnswers = [];

    // Shuffle the array of questions
    questions = shuffleArray(questions);

    showQuestion(questions[currentQuestionIndex]);
    updateActionButton('Answer');
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function showQuestion(question) {
    const questionIdElement = document.getElementById('question-id-number');
    if (questionIdElement) {
        questionIdElement.innerText = ` ${question.id}`;
    }

    // Render the question text using MathJax
    questionContainer.innerHTML = question.question;
    MathJax.typeset([questionContainer]); // Trigger MathJax to typeset the question

    // Render answer buttons with LaTeX math equations
    answerButtons.innerHTML = '';

    question.answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerHTML = answer.text;
        button.classList.add('btn');
        button.addEventListener('click', () => handleAnswerSelection(answer, button, question.multipleCorrect));
        answerButtons.appendChild(button);
        MathJax.typeset([button]); // Trigger MathJax to typeset each answer button
    });
}


function handleAnswerSelection(answer, button, multipleCorrect) {
    if (!multipleCorrect) {
        // Single correct answer: toggle selection
        const currentlySelected = selectedAnswers.length > 0 && selectedAnswers[0] === answer;
        clearSelection(); // Clear previous selection
        if (!currentlySelected) {
            selectedAnswers = [answer];
            button.classList.add('selected');
        }
    } else {
        // Multiple correct answers: add or remove selection
        const index = selectedAnswers.indexOf(answer);
        if (index === -1) {
            selectedAnswers.push(answer);
            button.classList.add('selected');
        } else {
            selectedAnswers.splice(index, 1);
            button.classList.remove('selected');
        }
    }
}


function checkAnswers() {
    const correctAnswers = questions[currentQuestionIndex].answers.filter(answer => answer.correct);
    const correctAnswerIds = correctAnswers.map(answer => answer.text);

    const selectedAnswerTexts = selectedAnswers.map(answer => answer.text);

    const allCorrect = correctAnswerIds.every(answer => selectedAnswerTexts.includes(answer)) &&
                       correctAnswerIds.length === selectedAnswerTexts.length;

    return { allCorrect, correctAnswers };
}

function updateActionButton(action) {
    actionButton.innerText = action;
}

function handleAction() {
    if (!isAnswered) {
        const { allCorrect, correctAnswers } = checkAnswers();

        if (allCorrect) {
            feedbackContainer.innerHTML = 'Correct!';
        } else {
            const correctAnswerText = correctAnswers.map(answer => answer.text).join(', ');
            feedbackContainer.innerHTML = `Incorrect! Correct answer(s): ${correctAnswerText}`;
            MathJax.typeset([feedbackContainer]); // Trigger MathJax to typeset the feedback
        }

        const explanation = questions[currentQuestionIndex].explanation;
        if (explanation) {
            feedbackContainer.innerHTML += `<br><br>Explanation: ${explanation}`;
            MathJax.typeset([feedbackContainer]); // Trigger MathJax to typeset the explanation
        }

        isAnswered = true;
        updateActionButton('Next');
    } else {
        // Clear the feedback message when moving to the next question
        feedbackContainer.innerHTML = '';

        currentQuestionIndex++;

        if (currentQuestionIndex < questions.length) {
            isAnswered = false;
            showQuestion(questions[currentQuestionIndex]);
            updateActionButton('Answer');
            clearSelection();
        } else {
            quizContainer.innerHTML = '<h2>Quiz Completed!</h2>';
        }
    }
}

function toggleNightMode() {
    const body = document.body;
    body.classList.toggle('night-mode');
    
    // Check if night mode is currently enabled
    const nightModeEnabled = body.classList.contains('night-mode');
    
    // Store the night mode preference in localStorage
    localStorage.setItem('nightMode', nightModeEnabled);
}
function applyNightMode() {
    const body = document.body;
    const nightModeEnabled = localStorage.getItem('nightMode') === 'true';

    if (nightModeEnabled) {
        body.classList.add('night-mode');
    } else {
        body.classList.remove('night-mode');
    }
}

// Call applyNightMode() when the page is loaded
document.addEventListener('DOMContentLoaded', applyNightMode);

function clearSelection() {
    selectedAnswers = [];
    const buttons = answerButtons.querySelectorAll('.btn');
    buttons.forEach(button => button.classList.remove('selected'));
}
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const nightModeEnabled = localStorage.getItem('nightMode') === 'true';

    if (nightModeEnabled) {
        body.classList.add('night-mode');
    } else {
        body.classList.remove('night-mode');
    }

    // Show night mode toggle button after applying night mode
    const nightModeToggle = document.getElementById('night-mode-toggle');
    nightModeToggle.style.display = 'block';
});

getQuestions();
