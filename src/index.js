// Function to make a GET request to retrieve character data
function fetchCharacterData() {
  return fetch('http://localhost:3000/characters')
    .then(response => response.json())
    .catch(err => {
      console.log('Error fetching character data:', err);
    });
}

// Function to add a character's name to the character bar
function addCharacterBar(name, id) {
  const characterBar = document.getElementById('character-bar');
  const spanElement = document.createElement('span');
  spanElement.textContent = name;
  // Store the character ID as a data attribute
  spanElement.dataset.characterId = id;
  characterBar.appendChild(spanElement);

  // Add a click event listener to each character name span
  spanElement.addEventListener('click', () => {
    const characterId = spanElement.dataset.characterId;
    getCharacterDetails(characterId);
  });
}

// Function to display character details in the detailed-info div
function displayCharacterDetails(character) {
  const nameElement = document.getElementById('name');
  const imageElement = document.getElementById('image');
  const voteCountElement = document.getElementById('vote-count');
  const voteForm = document.getElementById('votes-form');
  const resetButton = document.getElementById('reset-btn');

  nameElement.textContent = character.name;
  imageElement.src = character.image;
  voteCountElement.textContent = character.votes;

  // Event listener for voting
  voteForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const votesInput = document.getElementById('votes');
    const votes = parseInt(votesInput.value, 10);
    if (!isNaN(votes)) {
      character.votes += votes;
      voteCountElement.textContent = character.votes;
      votesInput.value = '';

      // Update votes in the database using a PATCH request
      updateVotesInDatabase(character.id, character.votes);
    }
  });

  // Event listener for resetting votes
  resetButton.addEventListener('click', () => {
    character.votes = 0;
    voteCountElement.textContent = character.votes;
    // Update votes in the database using a PATCH request
    updateVotesInDatabase(character.id, character.votes);
  });
}

// Function to update votes in the database via a PATCH request
function updateVotesInDatabase(characterId, votes) {
  const data = {
    votes: votes
  };

  fetch(`http://localhost:3000/characters/${characterId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(updatedCharacter => {
    console.log('Votes updated in the database:', updatedCharacter);
    // Optionally update the UI with the updated character data
    // For example, if you want to update the character's vote count in the UI,
    // you can call the displayCharacterDetails function again with the updatedCharacter data
    displayCharacterDetails(updatedCharacter);
  })
  .catch(err => {
    console.log('Error updating votes in the database:', err);
  });
}

// Function to get character details by ID and display them in the detailed-info div
function getCharacterDetails(id) {
  fetch(`http://localhost:3000/characters/${id}`)
    .then(response => response.json())
    .then(data => {
      displayCharacterDetails(data);
    })
    .catch(err => {
      console.log('Error getting character details', err);
    });
}

// Function to initialize the app
function initializeApp() {
  // Fetch character data from the server
  fetchCharacterData()
    .then((characters) => {
      // Add character names to the character bar
      characters.forEach((character) => {
        addCharacterBar(character.name, character.id);
      });

      // Get character details for the first character and display them in the detailed-info div
      if (characters.length > 0) {
        getCharacterDetails(characters[0].id);
      }
    })
    .catch((error) => {
      console.log('Error initializing app:', error);
    });
}

// Call the initializeApp function when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
