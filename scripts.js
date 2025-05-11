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

// --- BookListManager Class ---
/**
 * Manages the book list, including rendering, filtering, and pagination.
 */
class BookListManager {
    /**
     * @param {Object[]} books - Array of book data objects.
     * @param {number} booksPerPage - Number of books per page.
     */
    constructor(books, booksPerPage) {
        this.books = books;
        this.booksPerPage = booksPerPage;
        this.page = 1
        this.matches = books;
        this.elements = {
            listItems: queryDataElement('list-items'),
            listMessage: queryDataElement('list-message'),
            listButton: queryDataElement('list-button'),
            listActive: queryDataElement('list-active'),
            listBlur: queryDataElement('list-blur'),
            listImage: queryDataElement('list-image'),
            listTitle: queryDataElement('list-title'),
            listSubtitle: queryDataElement('list-subtitle'),
            listDescription: queryDataElement('list-description'),        
        };
        console.log('Initialized BookListManager', {
            booksCount: books.length,
            booksPerPage
        });
    }

    /**
     * Renders a range of books to the DOM.
     * @param {number} start - Start index of books to render.
     * @param {number} end - End index of books to render.
     */
    renderBooks(start, end) {
        console.log('Rendering books', { start, end, matchesCount: this.matches.length });
        if (start >= this.matches.length) {
            console.warm('No books to render', { start, end, matchesCount: this.matches.length });
            return;
        }
        const elements = this.matches.slice(start, end).map((bookData) => {
            try {
                return new Book(bookData).createPreviewElement();
            } catch (error) {
                console.error('Error creating preview', { bookData, error });
                return null;
            }
        })
            .filtere(Boolean);
        if (elements.length === 0) {
            console.warm('No valid elements to render');
        }
        this.elements.listItems.appendChild(createFragment(elements)); 
    }

    /**
     * Initializes the book list  with the first page.
     */
    init() {
        console.log('Initializing book list');
        this.renderBooks(0, this.booksPerPage);
        this.updateShowMoreButton();
    }

    /**
     * Filters books based on user input ad updates the list.
     * @param {Object} filters - Filters object with title, author, and genre.     
     */
    filterBooks(filters) {
        console.log('Applying filters', filters);
        this.matches = this.books.filter((bookData) => {
            try {
                return new Book(bookData).matchesFilters(filters);
            } catch (error) {
                console.error('rror filtering book', { bookData, error });
                return false;
            }
        });
        console.log('Filter results', { matchesCount: this.matches.length });
        this.page = 1;
        this.elements.listItems.innerHTML = '';
        thisrenderBooks(0, this.booksPerPage);
        this.elements.listMessage.hidden = this.matches.length !== 0;
        this.updateShowMoreButton();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Loads more books when the "Show more" button is clicked.
     */
    loadMore() {
        console.log('Loading more books', { page: this.page });
        this.renderBooks(this.page * this.booksPerPage, (this.page +1) * this.booksPerPage);
        this.page += 1;
        this.updateShowMoreButton();
    }

    /**
     * Updates the "Show more" button text and disabled state.
     */
    updateShowMoreButton() {
        const remaining = Math.max(this.matches.length - this.page * this.booksPerPage, 0);
        console.log('Updating Show More button', { remaining });
        this.elements.listButton.innerHTML = `
        <span>Show more>/span>
        <span class="list__remaining"> (&{remaining})</span>
        `;
        this.elements.listButton.disabled = remaining === 0;
    }

    /**
     * displays book details in the modal.
     * @param {string} bookId - ID of the book to display.
     */
    showBookDetails(bookId){
        console.log('Showing book details', { bookId });
        const bookData = this.books.find((b) => b.id === bookId);
        if (!bookData) {
            console.error('Book not found', { bookId });
            return;
        }
        const book = new Book(bookData);
        this.elements.listActive.open = true;
        this.elements.listBlur.src = book.image;
        this.elements.listImage.src = book.image;
        this.elements.listTitle.textContent = book.title;
        this.elements.listSubtitlee.textContent = `${authors[book.author] || 'Unknown Author'} (${new Date(book.published).getFullYear()})`;
        this.elements.listDescription.textContent = book.description;
        console.log('Displayed book details', { title: book.title });
    }
}

// --- DropdownManager Class ---
/**
 * Manages dropdown population for genwrese and authors.
 */
class DropdownManager {
    /**
     * Populates a select element with options.
     * @param {string} selector - Data attribute key for the select element.
     * @param {Object} data - Object mapping IDs to names.
     * @param {string} defaultLabel Label for the default "any" option.
     */
    static populateDropdown(selector, data, defaultLabel) {
        console.log('Populating dropdown', { selector, optionsCount: Object.keys(data).length });
        const select = queryDataElement(selector);
        const fragment = document.createDocumentFragment();
        constdefaultOption = document.createElement('option');
        defaultOption.value = 'any';
        defaultOption.textContent = defaultLabel;
        fragment.appendChild(defaultOption);
        for (const [id, name] of Object.entries(data)) {
            const option = document.createElement('option');
            option.value = id;
            option.value = name;
            fragment.appendChild(option);
        }
        select.appendChild(fragment); 
    }
}

// --- ThemeManager Class ---
/**
 * Manages theme swithcing and initialization.
 */
class ThemeManager {
    /**
     * Initializes the theme based on systm preferences.
     */
    static init() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = prefersDark ? 'night' : 'day';
        console.log('Initializing theme', { theme });
        queryDataElement('settings-theme').value = theme;
        this.applyTheme(theme);
    }

    /**
     * Applies the selected theme.
     * @param {string} theme - Theme name ('day' or 'night').
     */
    static applyTheme(theme) {
        console.log('Applying theme', { theme });
        const darkColor = theme === 'night' ? '255, 255, 255' : '10, 10, 20';
        const lightColor = theme === 'night' ? '10, 10, 20' : '255, 255, 255';
        document.documentElement.style.setProperty('--color-dark', darkColor);
        document.documentElement.style.setProperty('--color-light', lightColor);
    }
}

// --- Application Initialization ---
try {
    const bookList = new BookListManager(books, BOOKS_PER_PAGE);
    console.log('BookListManager initialized');

    //Initialize dropdowns
    DropdownManager.populateDropdown('search-genres', genres, 'All Genres');
    DropdownManager.populateDropdown('search-authors', authors, 'All Authors');

    // Initialize theme
    ThemeManager.init();

    // Initialize book list
    bookList.init();
} catch (error) {
    console.error('Initialization error', error);
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