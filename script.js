"use strict";

let storyData = {};

function fetchStoryData() {
    const books_file = "story_data.json"; // Path to the JSON file
    let books_list; // Declare a variable to store the parsed JSON data

    fetch(books_file) // Fetch the JSON file
        .then(response => {
            if (!response.ok) {
                // Check if the response is successful (status code 200-299)
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json(); // Parse the JSON data
        })
        .then(parsedBooksList => {
            books_list = parsedBooksList; // Assign parsed JSON to books_list
            console.log(`books_list variable: ${books_list}`); // Log the parsed data to the console
            storyData = books_list; // Update the global variable storyData
            console.log('calling the populate books list')
            populate_books_list();
        })
        .catch(error => {
            // Handle errors (e.g., network issues or JSON parsing errors)
            console.error("Error fetching or parsing story data:", error);
        });

        
}

function populate_books_list(){
    const story_list_element = document.querySelector('.story-list');

    storyData.forEach(row => {
            console.log(row.sno,row.story_name,row.audio_file_link);
            const listItem = document.createElement('li');

            const listItemtext = document.createElement('story-list-text');

            const heading = document.createElement('h2');
            heading.textContent = row.story_name;

            const description = document.createElement('p');
            description.textContent = row.story_name;

            // Create audio element
            const audio = document.createElement('audio');
            audio.src = row.audio_file_link; // Set audio file source
            audio.id = row.audio_file_link; // Unique ID for each audio element

            // Create play/pause button
            const playButton = document.createElement('button');
            playButton.textContent = '▶ Play'; // Initial button text

            playButton.addEventListener('click', () => {
                if (audio.paused) {
                    // If audio is paused, play it
                    audio.play();
                    playButton.textContent = '⏸ Pause'; // Update button text
                } else {
                    // If audio is playing, pause it
                    audio.pause();
                    playButton.textContent = '▶ Play'; // Update button text
                }
            });


            listItemtext.appendChild(heading);
            listItemtext.appendChild(description);

            listItem.appendChild(listItemtext)
            listItem.appendChild(playButton);
            listItem.appendChild(audio); // Append audio element (hidden by default)


            // listItem.textContent = `Story Name: ${row.story_name}, Audiofile Link: ${row.audio_file_link}`;
            // <button id="playButton">Play Sound</button>;
            // <audio id="audio" src="your-audio-file.mp3"></audio>;

            story_list_element.appendChild(listItem); // Append the <li> to the .story-list
        }
    )


}



document.addEventListener('DOMContentLoaded', fetchStoryData); // Wait until the DOM is fully loaded before running fetchStoryData
