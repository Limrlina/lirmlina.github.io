a = 0, b = 0, c = 0;
const Smile = { HAPPY: 'happy', SAD: 'sad'};

async function start() {
    resetContent();
    inputVariables();
    let formulasCount = document.getElementById("formulas-count-input").value;
    for (i = 1; i <= formulasCount; i++) {
        /* Даём страничке отрендериться, тк окно confirm 
        не даёт обновлять отображение странички */
        await sleep(100);
        if (i != 1 && !confirm("Продолжить?")) {
            return;
        }

        let result = applyFormula(i);
        showFormulaResult(i, result);
    }
}

/* Чистим страничку */
function resetContent() {
    let formulas = document.getElementsByClassName("formula-result");
    Array.from(formulas).forEach(formula => {
        formula.style.display = 'none';
    });

    let smileElements = document.getElementsByClassName("smile-img");
    Array.from(smileElements).forEach(smileElement => {
        smileElement.remove()
    });
 }

function inputVariables() {
    let aInput = prompt("Введите значение переменной a");
    let bInput = prompt("Введите значение переменной b");
    let cInput = prompt("Введите значение переменной c");

    a = Number(aInput);
    b = Number(bInput);
    c = Number(cInput);
 }

function limiter(input) {
    if (input.value < 1) input.value = 1;
    if (input.value > 3) input.value = 3;
 }

 function applyFormula(index) {
    let result;
    switch(index) {
        case 1:
            result = (Math.PI * Math.sqrt(Math.pow(a, 2))) / (Math.pow(b, 2) * c);
            break;
        case 2:
            result = Math.pow(a + Math.sqrt(b), 2) / Math.pow(c, 3);
            break;
        case 3:
            result = Math.sqrt(a + b + Math.sqrt(c)) / (Math.PI * b);
            break;
    }
    return result;
 }

 function showFormulaResult(index, result) {
    let formulaBlock = document.getElementById(`formula-${index}`);
    formulaBlock.style.display = 'block';

    let formulaResultText = document.getElementById(`formula-${index}-result-text`);
    formulaResultText.innerHTML = result;

    let smile = getSmileImageElement(isNaN(result) ? Smile.SAD : Smile.HAPPY);
    formulaBlock.appendChild(smile);
 }

 function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

 function getSmileImageElement(smile) {
    let smileImageElement = document.createElement("img");
    switch(smile) {
        case Smile.HAPPY:
            smileImageElement.setAttribute("src", "images/sm_1.png");
            smileImageElement.setAttribute("alt", "Happy smile");
            break;
        case Smile.SAD:
            smileImageElement.setAttribute("src", "images/sm_2.png");
            smileImageElement.setAttribute("alt", "Sad smile");
            break;
    }
    smileImageElement.setAttribute("class", "smile-img")
    smileImageElement.setAttribute("height", "100");
    smileImageElement.setAttribute("width", "120");
    return smileImageElement;
 }