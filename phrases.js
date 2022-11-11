const Translation = { LATIN: 'latin', RUSSIAN: 'russian'};

var phrasesPool;
var dynamicZoneElement;

const unsortedPhrases = [];

var phrasesCounter;

function configure() {
    phrasesPool = [
        new PhraseTranslation("Consuetudo est altera natura", "Привычка - вторая натура"),
        new PhraseTranslation("Nota bene", "Заметьте хорошо!"),
        new PhraseTranslation("Nulla calamitas sola", "Беда не приходит одна"),
        new PhraseTranslation("Per aspera ad astra", "Через тернии к звёздам"),
    ]
    dynamicZoneElement = document.getElementById("dynamicZone");
    phrasesCounter = 0;
}

function onPhraseClick(phraseElement) {
    let clickedPhrase = unsortedPhrases.find(phrase => phrase.element == phraseElement);
    if (clickedPhrase == null) {
        return; 
    }

    clickedPhrase.changeContent(Translation.LATIN);
    sortPhrase(clickedPhrase);
}

function spawnPhrase() {
    if (phrasesPool.length == 0) {
        document.getElementById("phrasesOutOfStockWarning").style.display = "block";
        return;
    }

    let phraseElement = getPhraseElement();
    let phraseTranslationIndex = Math.floor(Math.random() * phrasesPool.length);
    let phrase = new Phrase(++phrasesCounter, phrasesPool[phraseTranslationIndex], phraseElement);
    unsortedPhrases.push(phrase);
    phrasesPool.splice(phraseTranslationIndex, 1);

    dynamicZoneElement.appendChild(phraseElement);
}

function sortPhrase(phraseToSort) {
    if (phraseToSort.number % 2 == 0) {
        translate(phraseToSort.element, 50, phraseToSort.element.y);
    } else {
        translate(phraseToSort.element, dynamicZoneElement.getBoundingClientRect().right - dynamicZoneElement.getBoundingClientRect().left - 50, phraseToSort.element.y);
    }
    let phraseToSortIndex = unsortedPhrases.indexOf(phraseToSort);
    unsortedPhrases.splice(phraseToSortIndex, 1);
}

function colorUnsortedPhrases() {
    unsortedPhrases.forEach(phrase => {
        phrase.changeColor("yellow");
    });
}

function getPhraseElement() {
    let phraseElement = document.createElement("div");
    phraseElement.setAttribute("class", "phrase");
    phraseElement.style.top = `${Math.random() * 100}%`;
    phraseElement.style.left = `${Math.random() * 100}%`;
    phraseElement.style.backgroundColor = "white";
    phraseElement.setAttribute("onClick", "onPhraseClick(this)");
    return phraseElement;
}

class Phrase {
    constructor(number, phraseTranslation, element) {
        this.number = number;
        this.phraseTranslation = phraseTranslation;
        this.element = element;
        this.setContent(phraseTranslation.russianText);
    }

    changeContent(translation) {
        let newText;
        switch (translation) {
            case Translation.LATIN:
                newText = this.phraseTranslation.latinText;
                break;
            case Translation.RUSSIAN:
                newText = this.phraseTranslation.russianText;
                break;
        }
        this.setContent(newText);
    }

    changeColor(newColor) {
        this.element.style.backgroundColor = newColor;
    }

    setContent(newContent) {
        this.element.innerText = `${this.number}. `+ newContent;
    }
}

class PhraseTranslation {
    constructor(latinText, russianText) {
        this.latinText = latinText;
        this.russianText = russianText;
    }
}

// Взято отсюда: https://stackoverflow.com/questions/7454983/javascript-smooth-animation-from-x-y-to-x1-y1
function translate( elem, x, y ) {
    var left = parseInt( css( elem, 'left' ), 10 ),
        top = parseInt( css( elem, 'top' ), 10 ),
        dx = left - x,
        dy = top - y,
        i = 1,
        count = 20,
        delay = 20;

    function loop() {
        if ( i >= count ) { return; }
        i += 1;
        elem.style.left = ( left - ( dx * i / count ) ).toFixed( 0 ) + 'px';
        elem.style.top = ( top - ( dy * i / count ) ).toFixed( 0 ) + 'px';
        setTimeout( loop, delay );
    }

    loop();
}

function css( element, property ) {
    return window.getComputedStyle( element, null ).getPropertyValue( property );
}