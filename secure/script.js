/* global axios */

const result = document.getElementById('result');
const baseUrl = `${window.location.origin}`;

const deleteAlbum = async (albumId) => {
  try {
    const url = `${baseUrl}/api/albums/${albumId}`;
    await axios.delete(url);
    fetchAlbums('');
  }
  catch (error) {
    console.log(error);
    const errorObject = error.response.data.info;
    if (errorObject) {
      let errors = '';
      for (let key in errorObject) {
        errors += errorObject[key];
      }
      window.alert(errors);
    }
  }
};

const fetchAlbums = async (searchQuery) => {
  const url =
    searchQuery !== ''
      ? `${baseUrl}/api/query?search=${searchQuery}`
      : `${baseUrl}/api/albums`;

  try {
    const response = await axios.get(url);
    const data = response.data;
    let ownerName = '';

    const albums = data.data.map((album, index) => {
      album.owners.map((owner) => {
        ownerName = owner.username;
      });

      return `<div class="album">
                <h2>Album ${index + 1}</h2>
                <ul class="album-data">
                  <li><strong>Artist:</strong> ${album.artist}</li>
                  <li><strong>Title:</strong> ${album.title}</li>
                  <li><strong>Year:</strong> ${album.year}</li>
                  <li><strong>Genre:</strong> ${album.genre}</li>
                  <li><strong>Tracks:</strong> ${album.tracks}</li>
                  <li><strong>Owner:</strong> ${ownerName}</li>
                </ul>
                <button id="${album._id}" class="delete-album-btn">
                  Delete
                  </button>
              </div>`;
    });
    result.innerHTML = albums.join('');

    data.data.forEach(album => {
      const deleteButton = document.getElementById(album._id);
      if (deleteButton) {
        deleteButton.addEventListener('click', () => deleteAlbum(album._id));
      }
    });
  }
  catch (error) {
    console.log(error);
    result.innerHTML = '<div class="error">Could not fetch data</div>';
  }
};

const searchField = document.querySelector('#searchField');
searchField.addEventListener('input', async (event) => {
  event.preventDefault();
  fetchAlbums(searchField.value);
});

const createBtn = document.querySelector('.submit-form-btn');
const titleInput = document.querySelector('#title');
const artistInput = document.querySelector('#artist');
const yearInput = document.querySelector('#year');
const genreInput = document.querySelector('#genre');
const trackInput = document.querySelector('#tracks');
  
const emptyFields = () => {
  titleInput.value = '';
  artistInput.value = '';
  yearInput.value = '';
  genreInput.value = '';
  trackInput.value = '';
};

createBtn.addEventListener('click', async (event) => {
  event.preventDefault();
  
  const title = titleInput.value;
  const artist = artistInput.value;
  const year = yearInput.value;
  let genre = genreInput.value;
  const tracks = trackInput.value;

  if (genre === '') {
    genre = null;
  }
  
  try {
    await axios.post(
      `${baseUrl}/api/albums`,
      { title, artist, year, genre, tracks }
    );
    fetchAlbums('');
    emptyFields(titleInput, artistInput, yearInput, genreInput, trackInput);
  } catch (error) {
    console.log(error.response.data);

    const errorObject = error.response.data.info;
    if (errorObject) {
      let errors = '';
      for (let key in errorObject) {
        errors += errorObject[key];
      }
      window.alert(errors);
    }
  }
});

const logout = async () => {
  try {
    await axios.post(`${baseUrl}/logout`);
    window.location.href='/login';
  } catch (error) {
    console.log(error.response.data);
  }
};

const logoutBtn = document.querySelector('#logoutButton');
logoutBtn.addEventListener('click', (event) => {
  event.preventDefault();
  logout();
});

fetchAlbums('');
