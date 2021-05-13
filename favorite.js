// 把API網址成一個常數，假使API網址變更，就不用再一個一個改
const BASE_URL = `https://movie-list.alphacamp.io`
const INDEX_URL = BASE_URL + `/api/v1/movies/`
const POSTER_URL = BASE_URL + `/posters/`
const MOVIES_PER_PAGE = 12

const movies = JSON.parse(localStorage.getItem('favoriteMovies'))
let mode = 'card'
let selectPage = 1

const dataPanel = document.querySelector('#data-panel')
const searchInput = document.querySelector('#search-input')
const switchMode = document.querySelector('#switch-mode')
const paginator = document.querySelector('#paginator')

renderPaginator(movies.length)
displayListData()

// func
// render card mode
function renderMovieListCardMode(data) {
  let rawHTML = ``

  data.forEach(item => {
    // title, image
    // console.log(item)
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Post">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal"
                data-target="#movie-modal" data-id=${item.id}>More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id=${item.id}>X</button>
            </div>
          </div>
        </div>
      </div>
    `
  });

  dataPanel.innerHTML = rawHTML
}

// render list mode
function renderMovieListListMode(data) {
  let rawHTML = ``

  rawHTML += `
      <table class="table">
        <tbody>
    `
  data.forEach(item => {
    rawHTML += `
      <tr>
        <td>
          <h5 class="list-title">${item.title}</h5>
        </td>
            
        <td>
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
         <button class="btn btn-danger btn-remove-favorite" data-id=${item.id}>X</button>
        </td>
      </tr>
    `
  });

  rawHTML += `
        </tbody>
      </table>
    `
  dataPanel.innerHTML = rawHTML
}

function displayListData() {
  const data = getMoviesByPage(selectPage)
  mode === 'card' ? renderMovieListCardMode(data) : renderMovieListListMode(data)
}

function showMovieModal(id) {
  const modalTtile = document.querySelector('#movie-modal-title')
  const modalImg = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDesc = document.querySelector('#movie-modal-desc')

  axios.get(INDEX_URL + id).then(response => {
    const data = response.data.results
    modalTtile.innerText = data.title
    modalDate.innerText = 'Release date：' + data.release_date
    modalDesc.innerText = data.description
    modalImg.innerHTML = `
      <img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">
    `
  })
}

// remove favorite
function removeFromFavorite(id) {
  if (!movies) return

  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex === -1) return

  movies.splice(movieIndex, 1)

  localStorage.setItem('favoriteMovies', JSON.stringify(movies))

  displayListData()
}

// movies per page
function getMoviesByPage(page) {
  let data = movies

  const startIndex = (page - 1) * MOVIES_PER_PAGE

  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

// render page
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)

  let rawHTML = ``

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }

  paginator.innerHTML = rawHTML
}

// event
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

switchMode.addEventListener('click', function onSwitchlistClicked(event) {
  let target = event.target
  if (target.matches('#list-mode')) {
    mode = 'list'
  } else {
    mode = 'card'
  }
  displayListData()
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  selectPage = Number(event.target.dataset.page)
  displayListData()
})
