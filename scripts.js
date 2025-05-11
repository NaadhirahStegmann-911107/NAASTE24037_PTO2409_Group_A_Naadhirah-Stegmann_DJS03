import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'

// --- Debugging Initialization ---
console.log('Initializing Book Connect', {
    booksCount: books.length,
    authorsCount: Object.keys(authors).length,
    genresCount: Object.keys(genres).length,
    booksPerPage: BOOKS_PER_PAGE,
    sampleBook: books[0]
});

// --- Utility Functions ---
/**
 * Creating fragments from an array  of elements.
 * @param {HTMLElement[]} elements - Array of DOM elements
 * @returns {DocumentFragment} - A document fragment containing the elements.
 */
const createFragment = (elements) => {
    console.log('Creating fragment', { elementCount: elements.length });
    const fragment = document.createDocumentFragment();
    elements.forEach((element) => {
        if (element) {
            fragment.appendChild(element);
        } else {
            console.warn('Skipping null element in fragment');
        }
    });
    return fragment;
};

/**
 * Queries a DOM element using a data attribute selector.
 * @param {string} key - Data attribute key (e.g., 'list-items').
 * @returns {HTMLElement} - The matching DOM element.
 * @throws {Errors} - If the element is not found.
 */
const queryDataElement = (key) => {
    const element = document.querySelector(`[data-${key}]`);
    if (!element) {
        console.error(`Element with data-${key} not found`);
        throw new Error(`Element with data-${key} not found`);
    }
    console.log(`Queried element: data-${key}`);
    return element;
};

// --- Book Class ---
/**
 * Represents a book with its properties and renderingn logic.
 */
class Book {
    /**
     * @param {Object} data - Book data.
     * @param {string} data.id - Unique book ID.
     * @@param {string} data.title - Book title.
     * @param {string} data.author - Author ID.
     * @param {string} data.image - Image URL.
     * @param {string[]} data.genres - Array of genre IDs.
     * @param {string} data.description - Book description.
     * @param {string} data.published - Publication data (ISO string).
     */
    constructor({ id, title, author, image, genres, description, published }) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.image = image;
        this.genres = genres || [];
        this.description = description || '';
        this.published = published;
        console.log('Created Book', { id, title })
    }

    /**
     * Creates a preview button for the book.
     * @returns {HTMLElement} - The preview button element.
     */
    createPreviewElement() {
        console.log('Creating preview', {bookId: this.id, title: this.title });
        const button = document.createElement('button');
        button.className = 'preview';
        button.dataset.preview - this.id;
        button.innerHTML =`
            <img class="preview__image" src=${this.image}" alt="${this.title} coverp">
            <div class="preview__info">
                <h3 class="preview__title">${this.title}</h3>
                <div class="preview__author">${authors[this.author]} || 'Unknown Author'}</div>
            </div>
        `;
        return button;
    }

    /**
     * Checks if the book matches the given filters.
     * @param {Object} filters - Filters object with title, author, and genre.
     * @param {string} [filters.title=''] - Title search string.
     * @param {string} [filters.author='any'] - Author ID or 'any'.
     * @param {string} [filters.genre='any'] - Genre ID or 'any'.
     * @returns {boolean} - True if the book matches the filteres.
     */
    matchesFilters({ title = '', author = 'any', genre = 'any' }) {
        const titleMatch = title.trim() === '' || this.title.toLowerCase().includes(title.toLowerCase());
        const authorMatch = author === 'any' || this.author === author;
        const genreMatch = genre === 'any' || this.genres.includes(genre);
        console.log('Filtering book', {
            id: this.id,
            title: this.title,
            filters: { titlee, author, genre },
            matches: { titleMatch, authorMatch, genreMatch }
        });
        return titleMatch && authorMatch && genreMatch;
    }
}

let page = 1;
let matches = books

const starting = document.createDocumentFragment()

for (const { author, id, image, title } of matches.slice(0, BOOKS_PER_PAGE)) {
    const element = document.createElement('button')
    element.classList = 'preview'
    element.setAttribute('data-preview', id)

    element.innerHTML = `
        <img
            class="preview__image"
            src="${image}"
        />
        
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
    `

    starting.appendChild(element)
}

document.querySelector('[data-list-items]').appendChild(starting)

const genreHtml = document.createDocumentFragment()
const firstGenreElement = document.createElement('option')
firstGenreElement.value = 'any'
firstGenreElement.innerText = 'All Genres'
genreHtml.appendChild(firstGenreElement)

for (const [id, name] of Object.entries(genres)) {
    const element = document.createElement('option')
    element.value = id
    element.innerText = name
    genreHtml.appendChild(element)
}

document.querySelector('[data-search-genres]').appendChild(genreHtml)

const authorsHtml = document.createDocumentFragment()
const firstAuthorElement = document.createElement('option')
firstAuthorElement.value = 'any'
firstAuthorElement.innerText = 'All Authors'
authorsHtml.appendChild(firstAuthorElement)

for (const [id, name] of Object.entries(authors)) {
    const element = document.createElement('option')
    element.value = id
    element.innerText = name
    authorsHtml.appendChild(element)
}

document.querySelector('[data-search-authors]').appendChild(authorsHtml)

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.querySelector('[data-settings-theme]').value = 'night'
    document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
    document.documentElement.style.setProperty('--color-light', '10, 10, 20');
} else {
    document.querySelector('[data-settings-theme]').value = 'day'
    document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
    document.documentElement.style.setProperty('--color-light', '255, 255, 255');
}

document.querySelector('[data-list-button]').innerText = `Show more (${books.length - BOOKS_PER_PAGE})`
document.querySelector('[data-list-button]').disabled = (matches.length - (page * BOOKS_PER_PAGE)) > 0

document.querySelector('[data-list-button]').innerHTML = `
    <span>Show more</span>
    <span class="list__remaining"> (${(matches.length - (page * BOOKS_PER_PAGE)) > 0 ? (matches.length - (page * BOOKS_PER_PAGE)) : 0})</span>
`

document.querySelector('[data-search-cancel]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = false
})

document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = false
})

document.querySelector('[data-header-search]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = true 
    document.querySelector('[data-search-title]').focus()
})

document.querySelector('[data-header-settings]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = true 
})

document.querySelector('[data-list-close]').addEventListener('click', () => {
    document.querySelector('[data-list-active]').open = false
})

document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const { theme } = Object.fromEntries(formData)

    if (theme === 'night') {
        document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
        document.documentElement.style.setProperty('--color-light', '10, 10, 20');
    } else {
        document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', '255, 255, 255');
    }
    
    document.querySelector('[data-settings-overlay]').open = false
})

document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const filters = Object.fromEntries(formData)
    const result = []

    for (const book of books) {
        let genreMatch = filters.genre === 'any'

        for (const singleGenre of book.genres) {
            if (genreMatch) break;
            if (singleGenre === filters.genre) { genreMatch = true }
        }

        if (
            (filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase())) && 
            (filters.author === 'any' || book.author === filters.author) && 
            genreMatch
        ) {
            result.push(book)
        }
    }

    page = 1;
    matches = result

    if (result.length < 1) {
        document.querySelector('[data-list-message]').classList.add('list__message_show')
    } else {
        document.querySelector('[data-list-message]').classList.remove('list__message_show')
    }

    document.querySelector('[data-list-items]').innerHTML = ''
    const newItems = document.createDocumentFragment()

    for (const { author, id, image, title } of result.slice(0, BOOKS_PER_PAGE)) {
        const element = document.createElement('button')
        element.classList = 'preview'
        element.setAttribute('data-preview', id)
    
        element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `

        newItems.appendChild(element)
    }

    document.querySelector('[data-list-items]').appendChild(newItems)
    document.querySelector('[data-list-button]').disabled = (matches.length - (page * BOOKS_PER_PAGE)) < 1

    document.querySelector('[data-list-button]').innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${(matches.length - (page * BOOKS_PER_PAGE)) > 0 ? (matches.length - (page * BOOKS_PER_PAGE)) : 0})</span>
    `

    window.scrollTo({top: 0, behavior: 'smooth'});
    document.querySelector('[data-search-overlay]').open = false
})

document.querySelector('[data-list-button]').addEventListener('click', () => {
    const fragment = document.createDocumentFragment()

    for (const { author, id, image, title } of matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE)) {
        const element = document.createElement('button')
        element.classList = 'preview'
        element.setAttribute('data-preview', id)
    
        element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `

        fragment.appendChild(element)
    }

    document.querySelector('[data-list-items]').appendChild(fragment)
    page += 1
})

document.querySelector('[data-list-items]').addEventListener('click', (event) => {
    const pathArray = Array.from(event.path || event.composedPath())
    let active = null

    for (const node of pathArray) {
        if (active) break

        if (node?.dataset?.preview) {
            let result = null
    
            for (const singleBook of books) {
                if (result) break;
                if (singleBook.id === node?.dataset?.preview) result = singleBook
            } 
        
            active = result
        }
    }
    
    if (active) {
        document.querySelector('[data-list-active]').open = true
        document.querySelector('[data-list-blur]').src = active.image
        document.querySelector('[data-list-image]').src = active.image
        document.querySelector('[data-list-title]').innerText = active.title
        document.querySelector('[data-list-subtitle]').innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`
        document.querySelector('[data-list-description]').innerText = active.description
    }
})