let questions = [];
let filteredQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let incorrectQuestions = [];
let falladas = JSON.parse(localStorage.getItem('falladas')) || [];

function loadQuestionsFromJSON(tema) {
    let url = '';
    if (tema === 'todos') {
        // Lógica para cargar todas las preguntas de múltiples archivos JSON
        // Aquí puedes cargar múltiples archivos JSON o hacer una llamada específica para obtener todas las preguntas
        url = 'todos.json'; // Deberás crear un archivo todos.json o adaptar esta lógica
    } else if (tema === 'falladas') {
        questions = falladas;
        startQuiz();
        return;
    } else {
        url = `${tema}.json`;
    }

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            questions = data;
            startQuiz();
        })
        .catch(error => console.error('Error al cargar las preguntas:', error));
}

function startQuiz() {
    if (questions.length === 0) {
        console.error('Las preguntas no se han cargado correctamente');
        return;
    }

    filteredQuestions = questions.slice();
    if (filteredQuestions.length > 50) {
        filteredQuestions = getRandomQuestions(filteredQuestions, 50);
    }

    currentQuestionIndex = 0;
    score = 0;
    incorrectQuestions = [];
    document.getElementById('question-container').style.display = 'block';
    document.getElementById('next-button').style.display = 'none';
    document.getElementById('result').style.display = 'none';
    document.getElementById('retry-button').style.display = 'none';
    loadQuestion(currentQuestionIndex);
}

function getRandomQuestions(questionsArray, numQuestions) {
    const shuffled = [...questionsArray].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numQuestions);
}

function loadQuestion(index) {
    if (index < filteredQuestions.length) {
        const question = filteredQuestions[index];
        document.getElementById('question-text').innerText = question.pregunta;
        const optionsContainer = document.getElementById('options');
        optionsContainer.innerHTML = '';
        for (let i = 1; i <= 4; i++) {
            const option = question[`opcion${i}`];
            const button = document.createElement('button');
            button.classList.add('btn', 'btn-secondary', 'btn-block', 'mt-2');
            button.innerText = option;
            button.onclick = () => selectAnswer(i);
            optionsContainer.appendChild(button);
        }
        document.getElementById('feedback').innerText = '';
    } else {
        showResult();
    }
}

function selectAnswer(selectedOption) {
    const question = filteredQuestions[currentQuestionIndex];
    let feedback = '';
    if (selectedOption === question.respuesta_correcta) {
        score++;
        updateIncorrectQuestions(question, false);
        feedback = "Correcto! " + question.explicacion;
    } else {
        updateIncorrectQuestions(question, true);
        feedback = "Incorrecto. " + question.explicacion;
    }
    document.querySelectorAll('#options button').forEach((button, index) => {
        button.disabled = true;
        if (index + 1 === question.respuesta_correcta) {
            button.style.backgroundColor = 'green';
        } else if (index + 1 === selectedOption) {
            button.style.backgroundColor = 'red';
        }
    });
    document.getElementById('feedback').innerText = feedback;
    document.getElementById('next-button').style.display = 'block';
}

function updateIncorrectQuestions(question, fallada) {
    const index = falladas.findIndex(q => q.pregunta === question.pregunta);
    if (fallada && index === -1) {
        falladas.push(question);
    } else if (!fallada && index !== -1) {
        falladas.splice(index, 1);
    }
    localStorage.setItem('falladas', JSON.stringify(falladas));
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < filteredQuestions.length) {
        loadQuestion(currentQuestionIndex);
    } else {
        showResult();
    }
    document.getElementById('next-button').style.display = 'none';
}

function showResult() {
    document.getElementById('question-container').style.display = 'none';
    document.getElementById('result').style.display = 'block';
    document.getElementById('score').innerText = `Tu puntuación es: ${score} de ${filteredQuestions.length}`;
    if (incorrectQuestions.length > 0) {
        document.getElementById('retry-button').style.display = 'block';
    }
}

function retryIncorrectQuestions() {
    filteredQuestions = incorrectQuestions;
    incorrectQuestions = [];
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById('question-container').style.display = 'block';
    document.getElementById('result').style.display = 'none';
    document.getElementById('retry-button').style.display = 'none';
    loadQuestion(currentQuestionIndex);
}

window.onload = function() {
    document.getElementById('tema').addEventListener('change', function() {
        loadQuestionsFromJSON(this.value);
    });
    loadQuestionsFromJSON('todos');
};
