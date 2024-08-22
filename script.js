
let booksData = {};

function fetchBooksData() {
    fetch('books_info.json')
        .then(response => response.json())
        .then(data => {
            booksData = data;
            populateBooksCarousel();
        })
        .catch(error => console.error('Error fetching books data:', error));
}

function populateBooksCarousel() {
    const bookCarousel = document.querySelector('.book-carousel');
    bookCarousel.innerHTML = '';
    for (const book in booksData) {
        const bookInfo = booksData[book];
        const bookImg = document.createElement('img');
        bookImg.src = `${bookInfo.book_cover_source}`;
        bookImg.alt = booksData[book].title;
        bookImg.onclick = () => {
            showSummaryOptions(book);
            clearSummaryText();
        };
        bookCarousel.appendChild(bookImg);
    }
}

function showSummaryOptions(book) {
    const optionsContainer = document.querySelector('.summary-options');
    const bookInfo = booksData[book];
    const bookInfoContainer = document.querySelector('.book-info');
    bookInfoContainer.innerHTML = `<h2>${bookInfo.title}</h2>
                                   <p><strong>Author:</strong> ${bookInfo.author}</p>
                                   <p>${bookInfo.short_summary}</p>`;
    optionsContainer.innerHTML = '';
    bookInfo.summaries.forEach(option => {
        const optionDiv = document.createElement('div');
        optionDiv.onclick = () => fetchSummary(option.file);
        optionDiv.innerHTML = `<p><b>${option.duration}</b></p>`;
        optionsContainer.appendChild(optionDiv);
    });
}

function fetchSummary(url) {
    clearSummaryText(); // Clear previous summary text
    fetch(url)
        .then(response => response.text())
        .then(data => {
            document.getElementById('summary-text').textContent = data;
        })
        .catch(error => console.error('Error fetching summary:', error));
}

function clearSummaryText() {
    document.getElementById('summary-text').textContent = '';
}

document.addEventListener('DOMContentLoaded', fetchBooksData);






