"use strict";

let storyData = {};

// Importing library for ingesting csv file
var csv = require('jquery-csv');

function fetchStoryData(){

    const books_csv_file = "stories.csv"

    // const input = $('#input').val();
    const books_list = $.csv.toObjects(books_csv_file);

    console.log(books_list)

}





function fetchBooksData() {
    const columnToIndex = (column) => column.charCodeAt(0) - 'A'.charCodeAt(0);

    const columns = {
        index: columnToIndex("A"),
        title: columnToIndex("E"),
        author: columnToIndex("F"),
        short_summary: columnToIndex("H"),
        book_cover_source: columnToIndex("J"),
        chapter_metadata: columnToIndex("K"),
        book_folder: columnToIndex("L")
    };

    fetch('https://sheets.googleapis.com/v4/spreadsheets/18Ye1ocXrWnZTt7C17w9UrzOR3V2jRvMGXcw7FnXOAmc/values/books_list?majorDimension=ROWS&key=AIzaSyCc2Upib8AalVeKb0fuUOfWdDsPnK0ELV4')
        .then(response => response.json())
        .then(data => processBooksData(data.values, columns))
        .catch(error => console.error('Error fetching data from Google Sheets:', error));
}

function processBooksData(rows, columns) {
    booksData = {};

    rows.slice(1).forEach((row, i) => { // Skip header row with slice(1)
        const chapterMetadata = row[columns.chapter_metadata];
        const bookFolder = row[columns.book_folder];

        if (chapterMetadata && bookFolder) {
            try {
                const parsedMetadata = JSON.parse(chapterMetadata);
                if (Object.keys(parsedMetadata).length > 0) {
                    booksData[row[columns.index]] = {
                        title: row[columns.title],
                        author: row[columns.author],
                        short_summary: row[columns.short_summary],
                        book_cover_source: row[columns.book_cover_source],
                        book_folder: bookFolder,
                        chapters: parsedMetadata
                    };
                } else {
                    console.warn(`Skipping row ${i + 1} due to empty chapter metadata.`);
                }
            } catch (error) {
                console.error(`Error parsing chapter metadata for row ${i + 1}:`, error);
            }
        } else {
            console.warn(`Skipping row ${i + 1} due to missing chapter_metadata or book_folder.`);
        }
    });

    populateBooksCarousel();
}

function populateBooksCarousel() {
    const bookCarousel = document.querySelector('.book-carousel');
    bookCarousel.innerHTML = '';

    Object.values(booksData).forEach(bookInfo => {
        const bookImg = document.createElement('img');
        bookImg.src = bookInfo.book_cover_source;
        bookImg.alt = bookInfo.title;
        bookImg.onclick = () => {
            clearSummaryText();
            showSummaryOptions(bookInfo); // Ensure this is not called multiple times for the same book
        };
        bookCarousel.appendChild(bookImg);
    });
}

function showSummaryOptions(bookInfo) {
    const optionsContainer = document.querySelector('.summary-options');
    const bookInfoContainer = document.querySelector('.book-info');

    // Clear the container to avoid duplicate entries
    optionsContainer.innerHTML = '';

    bookInfoContainer.innerHTML = `
        <h2>${bookInfo.title}</h2>
        <p><strong>Author:</strong> ${bookInfo.author}</p>
        <p>${bookInfo.short_summary}</p>`;

    if (bookInfo.chapters) {
        Object.entries(bookInfo.chapters).forEach(([summary_length, chapters]) => {
            const duration = summary_length.split('_')[0];

            Object.keys(chapters).forEach(chapter_title => {
                const optionDiv = document.createElement('div');
                optionDiv.innerHTML = `<p><b>${duration} Minutes</b></p>`;
                optionDiv.onclick = () => {
                    clearChapterTitles();
                    displayChapters(bookInfo, summary_length);  // Pass summary_length to narrow down chapters
                    fetchPaginatedContent(bookInfo.book_folder, summary_length, chapter_title, 1);
                    generatePaginationButtons(chapters[chapter_title], bookInfo.book_folder, summary_length, chapter_title);
                };
                optionsContainer.appendChild(optionDiv);
            });
        });
    } else {
        console.error('No summaries found or invalid chapter metadata for this book:', bookInfo.title);
        optionsContainer.innerHTML = '<p>No summaries available for this book.</p>';
    }
}

function clearChapterTitles() {
    const optionsContainer = document.querySelector('.chapter-title');
    optionsContainer.innerHTML = '';  // Clear previous chapters to avoid duplication
}

function displayChapters(bookInfo, summary_length) {
    const chapters = bookInfo.chapters[summary_length];  // Narrow down to specific chapters for the given summary_length
    const optionsContainer = document.querySelector('.chapter-title');

    if (chapters) {
        Object.keys(chapters).forEach(chapter_title => {
            const chapterDiv = document.createElement('div');
            chapterDiv.className = 'chapter-button';
            chapterDiv.innerHTML = `<p><b>${chapter_title}</b></p>`;
            chapterDiv.onclick = () => {
                generatePaginationButtons(chapters[chapter_title], bookInfo.book_folder, summary_length, chapter_title);
                fetchPaginatedContent(bookInfo.book_folder, summary_length, chapter_title, 1);
            };
            optionsContainer.appendChild(chapterDiv);
        });
    } else {
        console.error('Chapters not found for this book and duration.');
        optionsContainer.innerHTML = '<p>No chapters available for this summary length.</p>';
    }
}

function fetchPaginatedContent(bookFolder, summary_length, chapter_title, pageNum) {
    const url = `Book_summaries/${bookFolder}/${summary_length}/${chapter_title}/page${pageNum}.txt`;

    fetch(url)
        .then(response => response.text())
        .then(data => {
            document.getElementById('summary-text').textContent = data;
        })
        .catch(error => console.error('Error fetching paginated content:', error));
}

function clearSummaryText() {
    document.getElementById('summary-text').textContent = '';
}

function generatePaginationButtons(totalPages, bookFolder, duration, chapter_title) {
    const paginationContainer = document.querySelector('.pagination-container');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.onclick = () => fetchPaginatedContent(bookFolder, duration, chapter_title, i);
        paginationContainer.appendChild(button);
    }
}

document.addEventListener('DOMContentLoaded', fetchStoryData);
