'use strict';

const quote = document.getElementById('quote');
const author = document.getElementById('author');
const button = document.getElementById('butoon');
const warning = document.getElementById('warning');

const quoteJSON = (() => {
    return fetch('https://yslpn.github.io/quote/quotes.json')
        .then(x => x.json());
})();

const changeQuote = () => {
    quoteJSON.then((data) => {
        const getRandomInt = ((min, max) => Math.floor(Math.random() * (max - min + 1) + min))(0, data.length);
        quote.textContent = data[getRandomInt].quoteText;
        author.textContent = data[getRandomInt].quoteAuthor;
        indexAuthorList = 0;
        warning.textContent = '';
    })
};
changeQuote();

button.addEventListener('click', () => changeQuote());

let indexAuthorList = 0;

author.addEventListener('click', () => {
    quoteJSON.then((data) => {
        for (let z = indexAuthorList; z < data.length; z++) {
            if (data[z].quoteAuthor === author.textContent && data[z].quoteText !== quote.textContent) {
                quote.textContent = data[z].quoteText;
                author.textContent = data[z].quoteAuthor;
                indexAuthorList = z;
                break;
            } else if (z === data.length - 1) {
                warning.textContent = '*There are no more quotes from this author.';
            }
        }
    })
});
