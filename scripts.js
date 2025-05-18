import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'

// --- Debugging Initialization ---
console.log('Initializing Book Connect', {
    booksCount: books.length,
    authorsCount: Object.keys(authors).length,
    genresCount: Object.keys(genres).length,
    booksPerPage: BOOKS_PER_PAGE,
    sampleBook: books[0],
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
    elements.forEach((element) => element && fragment.appendChild(element));
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

const validateImageUrl = (key, url) => {
    if (!url || typeof url !== 'string' ||url.trim() === '') {
        console.warn(`Invalid image URL for ${key}`, { url });
        return '';
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url.trim();
    }
    console.warm(`Non-HTTP image URL for ${key}`, { url });
    return '';
}

// --- Book Class ---
/**
 * Represents a book with its properties and renderingn logic.
 */
class Book {
    /**
     * @param {Object} data - Book data.
     * @param {string} data.id - Unique book ID.
     * @param {string} data.title - Book title.
     * @param {string} data.author - Author ID.
     * @param {string} data.image - Image URL.
     * @param {string[]} data.genres - Array of genre IDs.
     * @param {string} data.description - Book description.
     * @param {string} data.published - Publication data (ISO string).
     */
    constructor({ id, title, author, image, genres, description, published }) {
        if (!id || !title || !author) {
            console.error('Invalid book data', { id, title, author,});
            throw new Error('Invalid book data');
        }
        this.id = id;
        this.title = title;
        this.author = author;
        this.image = validateImageUrl(`book ${id}`, image);
        this.genres = genres || [];
        this.description = description || '';
        this.published = published;
        console.log('Created Book', { id, title })
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
            filters: { title, author, genre },
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
        console.log('Rendering books', { start, end });
        if (start >= this.matches.length) {
            console.log('No books to render');
            this.elements.listMessage.hidden = false;
            return;
        }
        const booksToRender = this.matches.slice(start, end);
        const elements = booksToRender.map((bookData) => {
            try {
                const book = new Book(bookData);
                const preview = document.createElement('book-preview');
                preview.setAttribute('id', book.id);
                preview.setAttribute('title', book.title);
                preview.setAttribute('author', uthor[book.author] || 'Unknown Author');
                preview.setAttribute('image', book.image);
                return preview;
            } catch (error) {
                console.error('Failed to render book', { bookData, error });
                return null;
            }
        }).filter(Boolean);
        if (elements.length === 0) {
            console.warm('No valid elements to render');
        }
        this.elements.listItems.appendChild(createFragment(elements)); 
    }

    /**
     * Initializes the book list with the first page.
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
        console.log('Filtering books', filters);
        this.matches = this.books.filter((bookData) => {
            try {
                return new Book(bookData).matchesFilters(filters);
            } catch (error) {
                console.error('Error filtering book', { bookData, error });
                return false;
            }
        });
        this.page = 1;
        this.elements.listItems.innerHTML = '';
        this.renderBooks(0, this.booksPerPage);
        this.elements.listMessage.hidden = this.matches.length !== 0;
        this.updateShowMoreButton();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Loads more books when the "Show more" button is clicked.
     */
    loadMore() {
        console.log('Loading more books', { page: this.page });
        this.renderBooks(this.page * this.booksPerPage, (this.page + 1) * this.booksPerPage);
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
            <span>Show more</span>
            <span class="list__remaining"> (${remaining})</span>
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
        this.elements.listSubtitle.textContent = `${authors[book.author] || 'Unknown Author'} (${new Date(book.published).getFullYear()})`;
        this.elements.listDescription.textContent = book.description;
        this.elements.listDescription.textcontent = book.description;
    }
}

// --- DropdownManager Class ---
/**
 * Manages dropdown population for genres and authors.
 */
class DropdownManager {
    /**
     * Populates a select element with options.
     * @param {string} selector - Data attribute key for the select element.
     * @param {Object} data - Object mapping IDs to names.
     * @param {string} defaultLabel - Label for the default "any" option.
     */
    static populateDropdown(selector, data, defaultLabel) {
        console.log('Populating dropdown', { selector });
        const select = queryDataElement(selector);
        const fragment = document.createDocumentFragment();
        const defaultOption = document.createElement('option');
        defaultOption.value = 'any';
        defaultOption.textContent = defaultLabel;
        fragment.appendChild(defaultOption);
        for (const [id, name] of Object.entries(data)) {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = name;
            fragment.appendChild(option);
        }
        select.appendChild(fragment); 
    }
}

// --- ThemeManager Class ---
/**
 * Manages theme switching and initialization.
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

// --- Event Listeners ---
queryDataElement('search-cancel').addEventListener('click', () => {
    console.log('Search cancel clicked');
    queryDataElement('search-overlay').open = false;
});

queryDataElement('settings-cancel').addEventListener('click', () => {
    console.log('Settings cancel clicked');
    queryDataElement('settings-overlay').open = false;
});

queryDataElement('header-search').addEventListener('click', () => {
    console.log('Search button clicked');
    queryDataElement('search-overlay').open = true;
    queryDataElement('search-title').focus();
});

queryDataElement('header-settings').addEventListener('click', () => {
    console.log('Settings button clicked');
    queryDataElement('settings-overlay').open = true;
});

queryDataElement('list-close').addEventListener('click', () => {
    console.log('Closed book details clicked');
    queryDataElement('list-active').open = false;
});

queryDataElement('settings-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);
    console.log('Settings form submitted', { theme });
    ThemeManager.applyTheme(theme);
    queryDataElement('settings-overlay').open = false;
});

queryDataElement('search-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    console.log('Search form submitted', filters);
    bookList.filterBooks(filters);
    queryDataElement('search-overlay').open = false;
});

queryDataElement('list-button').addEventListener('click', () => {
    console.log('Show more button clicked');
    bookList.loadMore();
});

queryDataElement('list-items').addEventListener('click', (event) => {
    console.log('Book list clicked', { target: event.target.tagName });
    const pathArray = Array.from(event.composedPath());
    for (const node of pathArray) {
        if (node.dataset?.preview) {
            console.log('Preview button clicked', { bookId: node.dataset.preview });
            break;
        }
    }
});