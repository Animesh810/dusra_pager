let booksData = {};

function fetchBooksData() {
    fetch('https://sheets.googleapis.com/v4/spreadsheets/18Ye1ocXrWnZTt7C17w9UrzOR3V2jRvMGXcw7FnXOAmc/values/books_list?majorDimension=ROWS&key=AIzaSyCc2Upib8AalVeKb0fuUOfWdDsPnK0ELV4')
        .then(response => response.json())
        .then(data => {
            const rows = data.values;
            booksData = {};
            rows.forEach((row, index) => {
                if (index === 0) return; // Skip the header row
                let summaries = [
                    { duration: row[10], file: row[11] },
                    { duration: row[12], file: row[13] },
                    { duration: row[14], file: row[15] },
                    { duration: row[16], file: row[17] },
                    { duration: row[18], file: row[19] }
                ].filter(summary => summary.duration && summary.file); // Filter out empty summaries

                if (summaries.length > 0) { // Only include books with at least one valid summary
                    let book = {
                        title: row[4],
                        author: row[5],
                        short_summary: row[7],
                        book_cover_source: row[9],
                        summaries: summaries
                    };
                    booksData[row[0]] = book; // Assuming the first column is a unique identifier
                }
            });
            populateBooksCarousel();
        })
        .catch(error => console.error('Error fetching data from Google Sheets:', error));
}

function populateBooksCarousel() {
    const bookCarousel = document.querySelector('.book-carousel');
    bookCarousel.innerHTML = '';
    for (const book in booksData) {
        const bookInfo = booksData[book];
        const bookImg = document.createElement('img');
        bookImg.src = `${bookInfo.book_cover_source}`;
        bookImg.alt = bookInfo.title;
        bookImg.onclick = () => {
            showSummaryOptions(bookInfo); // Pass bookInfo instead of book
            clearSummaryText();
        };
        bookCarousel.appendChild(bookImg);
    }
}

function showSummaryOptions(bookInfo) {
    const optionsContainer = document.querySelector('.summary-options');
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
