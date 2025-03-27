let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
let port = "7127";
let userId = loggedInUser.id;

function fetchQuizzes() {
    //fetch(`https://localhost:${port}/api/Question/GetQuizsForUser/${userId}`)
    fetch(`https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Question/GetQuizsForUser/${userId}`)
        .then(response => response.json())
        .then(data => {
            let quizListDiv = document.getElementById('quizList');
            quizListDiv.innerHTML = '';

            if (data.length === 0) {
                quizListDiv.innerHTML = `<h2>There are no quizzes.</h2>`;
                return;
            }
            let i = 1;
            data.forEach(quiz => {
                let quizDiv = document.createElement('div');
                quizDiv.className = 'quiz';
                quizDiv.innerHTML = `
                            <h1>Quiz ${i++}</h1>
                            <h2>Date: ${new Date(quiz.QuizDate).toLocaleDateString()}</h2>
                            <h2>Grade: ${quiz.Grade} out of 5</h2>
                            <button class="button" onclick="showQuizDetail(${quiz.QuizID})">See Quiz</button>
                        `;
                quizListDiv.appendChild(quizDiv);
            });
        })
        .catch(error => console.error('Error fetching quizzes:', error));
}

function showQuizDetail(quizId) {
    //fetch(`https://localhost:${port}/api/Question/GetQuizsForUser/${userId}`)
    fetch(`https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Question/GetQuizsForUser/${userId}`)
        .then(response => response.json())
        .then(data => {
            let quiz = data.find(q => q.QuizID === quizId);
            if (!quiz) {
                console.error('Quiz not found');
                return;
            }

            let quizDetailModal = document.getElementById('quizDetailModal');
            let contentDiv = document.getElementById('quizDetailsContent');
            contentDiv.innerHTML = `
                <p>Date: ${new Date(quiz.QuizDate).toLocaleDateString()}</p>
                <p>Grade: ${quiz.Grade}</p>
            `;

            for (let i = 1; i <= 5; i++) {
                let question = quiz[`Question${i}`];
                if (question) {
                    // Replace null values with "None of these answers are correct"
                    let answers = [
                        question.correctAnswer || 'None of these answers are correct.',
                        question.incorrectAnswer1 || 'None of these answers are correct.',
                        question.incorrectAnswer2 || 'None of these answers are correct.',
                        question.incorrectAnswer3 || 'None of these answers are correct.'
                    ];

                    let userAnswer = question.userAnswer || 'None of these answers are correct.';
                    let correctLabel = userAnswer === question.correctAnswer ? ' (selected, correct answer)' : ' (correct answer)';
                    let userAnswerLabel = userAnswer === question.correctAnswer ? correctLabel : ' (selected)';

                    contentDiv.innerHTML += `
                        <div>
                            <h3>Question ${i}: ${question.text}</h3>
                            <ul>
                                ${answers.map(answer => {
                        let label = '';
                        if (answer === question.correctAnswer) {
                            label = correctLabel;
                        } else if (answer === userAnswer) {
                            label = userAnswerLabel;
                        }
                        return `<li>${answer}${label}</li>`;
                    }).join('')}
                            </ul>
                        </div>
                    `;
                }
            }

            quizDetailModal.classList.add('active');
        })
        .catch(error => console.error('Error fetching quiz details:', error));
}

function closeQuizDetail() {
    document.getElementById('quizDetailModal').classList.remove('active');
}

let quizQuestions = []; // Array to store quiz questions and answers from the server

document.getElementById('startNewQuiz').addEventListener('click', () => {
    if (confirm('Are you sure you want to start a new quiz?')) {
        //fetch(`https://localhost:${port}/api/Question/CreateAndGetQuiz/${userId}`)
        fetch(`https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Question/CreateAndGetQuiz/${userId}`)
            .then(response => response.json())
            .then(questions => {
                quizQuestions = questions;
                let quizModal = document.getElementById('quizModal');
                let questionsDiv = document.getElementById('quizQuestions');
                questionsDiv.innerHTML = '';

                questions.forEach((question, index) => {
                    // Replace null values with "None of these answers are correct" and shuffle answers
                    let answers = [
                        question.CorrectAnswer || 'None of these answers are correct.',
                        question.IncorrectAnswer1 || 'None of these answers are correct.',
                        question.IncorrectAnswer2 || 'None of these answers are correct.',
                        question.IncorrectAnswer3 || 'None of these answers are correct.'
                    ].sort(() => Math.random() - 0.5);

                    // Display the question and the shuffled answers
                    questionsDiv.innerHTML += `
                        <div>
                            <h3>Question ${index + 1}: ${question.QuestionText}</h3>
                            <ul>
                                ${answers.map(answer => `<li><input type="radio" name="question${index}" value="${answer}">${answer}</li>`).join('')}
                            </ul>
                        </div>
                    `;
                });

                quizModal.classList.add('active');
                document.getElementById('submitQuiz').onclick = () => submitQuiz();
            })
            .catch(error => console.error('Error creating quiz:', error));
    }
});

function closeQuiz() {
    document.getElementById('quizModal').classList.remove('active');
}

function handleResponse(response) {
    if (response.ok) {
        return response.json().catch(() => response.text()); // Try to parse JSON, fallback to text
    } else {
        return response.text().then(text => { throw new Error(`Server error: ${text}`); });
    }
}

async function submitQuiz() {
    let questionIds = [];
    let answers = Array.from(document.querySelectorAll('#quizQuestions input:checked')).map(input => input.value);
    let userId = loggedInUser.id;

    if (answers.length !== quizQuestions.length) {
        alert('Please answer all questions before submitting the quiz.');
        return;
    }

    let questionPromises = quizQuestions.map((questionData, index) => {
        let questionText = questionData.QuestionText;
        let correctAnswer = questionData.CorrectAnswer || 'None of these answers are correct.';
        let incorrectAnswers = [
            questionData.IncorrectAnswer1 || 'None of these answers are correct.',
            questionData.IncorrectAnswer2 || 'None of these answers are correct.',
            questionData.IncorrectAnswer3 || 'None of these answers are correct.'
        ];
        let userAnswer = answers[index] || 'None of these answers are correct.';

        console.log({
            userId,
            questionText,
            correctAnswer,
            incorrectAnswer1: incorrectAnswers[0],
            incorrectAnswer2: incorrectAnswers[1],
            incorrectAnswer3: incorrectAnswers[2],
            userAnswer
        });

        //return fetch(`https://localhost:${port}/api/Question/AddQuestion`, {
        return fetch(`https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Question/AddQuestion`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                questionText,
                correctAnswer,
                incorrectAnswer1: incorrectAnswers[0],
                incorrectAnswer2: incorrectAnswers[1],
                incorrectAnswer3: incorrectAnswers[2]
            })
        })
            .then(response => response.json())
            .then(questionId => {
                questionIds.push(questionId);
                return questionId;
            })
            .catch(error => console.error('Error adding question:', error));
    });

    Promise.all(questionPromises).then(() => {
        let correctAnswersCount = 0;

        answers.forEach((answer, index) => {
            if (answer === quizQuestions[index].CorrectAnswer) {
                correctAnswersCount++;
            }
        });

        let grade = correctAnswersCount;

        console.log({
            userID: userId,
            grade: grade,
            question1: questionIds[0],
            question2: questionIds[1],
            question3: questionIds[2],
            question4: questionIds[3],
            question5: questionIds[4],
            userAnswer1: answers[0],
            userAnswer2: answers[1],
            userAnswer3: answers[2],
            userAnswer4: answers[3],
            userAnswer5: answers[4]
        });

        //fetch(`https://localhost:${port}/api/Question/AddQuiz`, {
        fetch(`https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Question/AddQuiz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userID: userId,
                grade: grade,
                question1: questionIds[0],
                question2: questionIds[1],
                question3: questionIds[2],
                question4: questionIds[3],
                question5: questionIds[4],
                userAnswer1: answers[0] || 'None of these answers are correct.',
                userAnswer2: answers[1] || 'None of these answers are correct.',
                userAnswer3: answers[2] || 'None of these answers are correct.',
                userAnswer4: answers[3] || 'None of these answers are correct.',
                userAnswer5: answers[4] || 'None of these answers are correct.'
            })
        })
            .then(handleResponse)
            .then(() => {
                closeQuiz();
                fetchQuizzes();
            })
            .catch(error => console.error('Error submitting quiz:', error));
    });
}

window.onload = fetchQuizzes;