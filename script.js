let questions = [];
let filteredQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let incorrectQuestions = [];
let falladas = JSON.parse(localStorage.getItem('falladas')) || [];

document.getElementById('file-input').addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        questions = XLSX.utils.sheet_to_json(worksheet);
    };

    reader.readAsArrayBuffer(file);
}

function loadQuestionsFromExcel() {
    if (!questions.length) {
        alert('Por favor, carga un archivo Excel primero.');
        return;
    }

    const tema = document.getElementById('tema').value;
    if (tema === 'todos') {
        filteredQuestions = questions;
    } else if (tema === 'falladas') {
        filteredQuestions = falladas;
    } else {
        filteredQuestions = questions.filter(q => q.tema === tema);
    }

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
