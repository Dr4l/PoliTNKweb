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
let answerMapping = {}; // Added mapping to store original answers

async function getQuestions() {
    try {
        const response = await fetch('questions.json');
        questions = await response.json();
        startGame();
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

function startGame() {
    currentQuestionIndex = 0;
    isAnswered = false;
    feedbackContainer.innerText = ''; // Clear previous feedback
    answerMapping = {}; // Clear previous mapping

    // Shuffle the array of questions
    questions = shuffleArray(questions);

    showQuestion(questions[currentQuestionIndex]);
    updateActionButton('Answer');
}

// Helper function to shuffle an array using the Fisher-Yates algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


function showQuestion(question) {
    questionContainer.innerText = question.question;
    answerButtons.innerHTML = '';

    const sortedAnswers = question.answers.slice().sort((a, b) => a.index - b.index);

    sortedAnswers.forEach((answer, index) => {
        answerMapping[String.fromCharCode(65 + index)] = answer;
        const button = document.createElement('button');
        button.innerText = String.fromCharCode(65 + index) + '. ' + answer.text;
        button.classList.add('btn');
        button.addEventListener('click', () => toggleAnswerSelection(button, answer));
        answerButtons.appendChild(button);
    });

    if (question.multipleCorrect) {
        // If multiple correct answers are allowed, update styles or add indicators as needed
        answerButtons.classList.add('multiple-correct');
    }
}


function toggleAnswerSelection(button, answer) {
    if (!isAnswered) {
        if (!questions[currentQuestionIndex].multipleCorrect) {
            // If question does not allow multiple correct answers
            // Deselect all other answers when selecting a new one
            questions[currentQuestionIndex].answers.forEach(a => {
                if (a !== answer) {
                    a.selected = false;
                }
            });

            // Remove 'selected' class from all buttons
            const buttons = answerButtons.querySelectorAll('.btn');
            buttons.forEach(btn => btn.classList.remove('selected'));
        }

        answer.selected = !answer.selected; // Toggle the selected state
        button.classList.toggle('selected'); // Toggle the 'selected' class
    }
}


function checkAnswers() {
    const selectedAnswers = questions[currentQuestionIndex].answers.filter(answer => answer.selected);
    const correctAnswers = questions[currentQuestionIndex].answers.filter(answer => answer.correct);

    const allCorrect = selectedAnswers.length === correctAnswers.length &&
                       selectedAnswers.every(answer => answer.correct);

    return { allCorrect, correctAnswers };
}

function updateActionButton(action) {
    actionButton.innerText = action;
}

function handleAction() {
    if (!isAnswered) {
        const { allCorrect, correctAnswers } = checkAnswers();

        if (allCorrect) {
            feedbackContainer.innerText = 'Correct!';
        } else {
            const correctAnswerText = correctAnswers.map(answer => answer.text).join(', ');
            let explanation = '';

            if (correctAnswers.length === 1 && correctAnswers[0].text === 'None') {
                feedbackContainer.innerText = 'Correct! The answer is None.';
            } else {
                feedbackContainer.innerText = `Incorrect! Correct answer: ${correctAnswerText}`;
                explanation = questions[currentQuestionIndex].explanation || '';
            }

            if (explanation) {
                feedbackContainer.innerText += `\nExplanation: ${explanation}`;
            }
        }

        isAnswered = true;
        updateActionButton('Next');
    } else {
        // Clear the feedback message when moving to the next question
        feedbackContainer.innerText = '';

        // Remove night mode when moving to the next question
        body.classList.remove('night-mode');

        currentQuestionIndex++;

        if (currentQuestionIndex < questions.length) {
            isAnswered = false;
            showQuestion(questions[currentQuestionIndex]);
            updateActionButton('Answer');
        } else {
            quizContainer.innerHTML = '<h2>Quiz Completed!</h2>';
        }
    }
}


function toggleNightMode() {
    body.classList.toggle('night-mode');
}


getQuestions();
