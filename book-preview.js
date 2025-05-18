class BookPreview extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open'});
    }

    static get observedAttributes() {
        return ['id', 'title', 'author', 'image'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render(){
        const id = this.getAttribute('id') || '';
        const title = this.getAttribute('title') || 'Unknown Title';
        const author = this.getAttribute('author') || 'Unknown Author';
        const image = this.getAttribute('image') || '';

        this.shadowRoot.innerHTML = `
            <style>
                .preview {
                    display: flex;
                    align-items: center;
                    padding: 10px;
                    border: none;
                    background: var(--color-light);
                    cursor: pointer;
                    width: 100%;
                    text-align: left;
                }
                .preview:hover {
                    background: var(--color-dark); 
                    color: var(--color-light);
                }
                .preview__image {
                    width: 50px;
                    height: 75px;
                    object-fit: cover:
                    margin-right: 10px;
                }
                .preview__image[src='']{
                    display: none;
                }
                .preview__info {
                    flex: 1;
                }
                .preview__title {
                    font-size: 16px;
                    margin: 0;
                }
                .preview__author {
                    font-size: 14px;
                    color: #666;
                }
            </style>
            <button class="preview" data-preview="${id}">
                <img class="preview__image" src="${image}" alt="${image ? title + ' cover' : 'No cover available'}">
                <div class="preview__info">
                    <h3 class="preview__title">${title}</h3>
                    <div class="preview__author">${author}</div>
                </div>
            </button>
        `;
    }
}

customElements.define('book-preview', BookPreview);