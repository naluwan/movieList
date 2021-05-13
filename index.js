// 把API網址成一個常數，假使API網址變更，就不用再一個一個改
const BASE_URL = `https://movie-list.alphacamp.io`
const INDEX_URL = BASE_URL + `/api/v1/movies/`
const POSTER_URL = BASE_URL + `/posters/`
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []
let mode = 'card'
let selectPage = 1

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const switchMode = document.querySelector('#switch-mode')

// init renderList
axios.get(INDEX_URL)
  .then(responese => {
    // Array(80)
    // for of 輸出的是array的值(value)，for in是array的屬性名稱(key)
    // for (const movie of responese.data.results) {
    //   movies.push(movie)
    // }
    // ...為展開運算子，可以設計更有彈性的函式
    movies.push(...responese.data.results)
    renderPaginator(movies.length)
    // renderMovieListCardMode(getMoviesByPage(1))
    displayListData()
  }).catch(error => {
    console.log(error)
  })

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
              <button class="btn btn-info btn-add-favorite" data-id=${item.id}>+</button>
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
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
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

// change mode
function displayListData() {
  const data = getMoviesByPage(selectPage)
  mode === 'card' ? renderMovieListCardMode(data) : renderMovieListListMode(data)
}

// modal
function showMovieModal(id) {
  const modalTtile = document.querySelector('#movie-modal-title')
  const modalImg = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDesc = document.querySelector('#movie-modal-desc')

  axios.get(INDEX_URL + id).then(response => {
    const data = response.data.results
    console.log(data)
    modalTtile.innerText = data.title
    modalDate.innerText = 'Release date：' + data.release_date
    modalDesc.innerText = data.description
    modalImg.innerHTML = `
      <img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">
    `
  })
}

// movies per page
function getMoviesByPage(page) {
  // movies ? "movies" : "filteredMovies"
  const data = filteredMovies.length ? filteredMovies : movies
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

// add favorite
function addToFavorite(id) {
  // function isMovieIdMatched(movie) {
  //   return movie.id === id
  // }
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)

  if (list.some(movie => movie.id === id)) {
    return alert('This movie already added in your favorite!!')
  }

  list.push(movie)
  // console.log(list)

  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}


// event
// datapanel監聽事件 => 更多資訊/加到最愛
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// search form submit監聽事件
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase()

  // filter作法
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )

  if (filteredMovies.length === 0) {
    return alert(`Cannot find movie with keyword:` + keyword)
  }

  // for of迴圈做法
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }
  renderPaginator(filteredMovies.length)
  selectPage = 1
  displayListData()
})

// page click 監聽事件
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  selectPage = Number(event.target.dataset.page)
  displayListData()
})

// switch mode 監聽事件
switchMode.addEventListener('click', function onSwitchlistClicked(event) {
  let target = event.target
  if (target.matches('#list-mode')) {
    mode = 'list'
  } else {
    mode = 'card'
  }
  displayListData()
})





