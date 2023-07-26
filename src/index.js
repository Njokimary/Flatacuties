document.addEventListener('DOMContentLoaded', () => {
  const characterBar = document.getElementById('character-bar');
  const detailedInfo = document.getElementById('detailed-info');
  const votesForm = document.getElementById('votes-form');
  const resetBtn = document.getElementById('reset-btn');
  const characterForm = document.getElementById('character-form');
  let currentCharacter = null;

  // Function to make a GET request to retrieve character data
  function fetchCharacterData() {
    return fetch('http://localhost:3000/characters')
      .then(response => response.json())
      .catch(err => {
        console.log('Error fetching character data:', err);
      });
  }

  // Function to add a character's name to the character bar
  function addCharacterBar(name, id, image, votes) {
    const spanElement = document.createElement('span');
    spanElement.textContent = name;
    // Store the character ID, image, and votes as data attributes
    spanElement.dataset.characterId = id;
    spanElement.dataset.characterImage = image;
    spanElement.dataset.characterVotes = votes;
    characterBar.appendChild(spanElement);

    // Add a click event listener to each character name span
    spanElement.addEventListener('click', () => {
      const characterId = spanElement.dataset.characterId;
      const characterImage = spanElement.dataset.characterImage;
      const characterVotes = spanElement.dataset.characterVotes;
      getCharacterDetails(characterId, characterImage, characterVotes);
    });
  }

  // Function to display character details in the detailed-info div
  function displayCharacterDetails(character, characterImage, characterVotes) {
    const nameElement = document.getElementById('name');
    const imageElement = document.getElementById('image');
    const voteCountElement = document.getElementById('vote-count');

    nameElement.textContent = character.name;
    imageElement.src = characterImage;
    voteCountElement.textContent = characterVotes;
    currentCharacter = character;

    // Event listener for voting
    votesForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const votesInput = document.getElementById('votes');
      const votes = parseInt(votesInput.value, 10);
      if (!isNaN(votes) && currentCharacter !== null) {
        const updatedCharacter = { ...currentCharacter };
        updatedCharacter.votes += votes;
        voteCountElement.textContent = updatedCharacter.votes;
        votesInput.value = '';
        updateVotesInDatabase(updatedCharacter.id, updatedCharacter.votes);
      }
    });

    resetBtn.addEventListener('click', () => {
      if (currentCharacter !== null) {
        const updatedCharacter = { ...currentCharacter };
        updatedCharacter.votes = 0;
        voteCountElement.textContent = updatedCharacter.votes;
        updateVotesInDatabase(updatedCharacter.id, updatedCharacter.votes);
      }
    });
  }

  // Function to add a new character to the character bar
  function addNewCharacter(character) {
    const characterName = character.name;
    const characterId = character.id;
    const characterImage = character.image;
    const characterVotes = character.votes;
    addCharacterBar(characterName, characterId, characterImage, characterVotes);
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
      displayCharacterDetails(updatedCharacter, updatedCharacter.image, updatedCharacter.votes);
    })
    .catch(err => {
      console.log('Error updating votes in the database:', err);
    });
  }

  // Function to get character details by ID and display them in the detailed-info div
  function getCharacterDetails(id, image, votes) {
    fetch(`http://localhost:3000/characters/${id}`)
      .then(response => response.json())
      .then(data => {
        displayCharacterDetails(data, image, votes);
        detailedInfo.dataset.characterId = data.id;
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
          addCharacterBar(character.name, character.id, character.image, character.votes);
        });

        // Get character details for the first character and display them in the detailed-info div
        if (characters.length > 0) {
          getCharacterDetails(characters[0].id, characters[0].image, characters[0].votes);
        }
      })
      .catch((error) => {
        console.log('Error initializing app:', error);
      });
  }

  // Call the initializeApp function when the DOM is loaded
  initializeApp();
  
  // Event listener for adding a new character
  characterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const nameInput = document.getElementById('name-input');
    const imageInput = document.getElementById('image-url');
    const name = nameInput.value.trim();
    const image = imageInput.value.trim();

    if (name !== '' && image !== '') {
      const data = {
        name: name,
        image: image,
        votes: 0
      };

      fetch('http://localhost:3000/characters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(newCharacter => {
        addNewCharacter(newCharacter);
        displayCharacterDetails(newCharacter, newCharacter.image, newCharacter.votes);
      })
      .catch(err => {
        console.log('Error adding new character:', err);
      });

      // Clear input fields after adding a character
      nameInput.value = '';
      imageInput.value = '';
    }
  });
});
