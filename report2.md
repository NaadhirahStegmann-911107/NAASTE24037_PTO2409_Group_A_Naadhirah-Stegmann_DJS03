# Book Connect:Web Components

## Overview
This project enhances the "Book Connect" app from DJS03 by converting the book preview and header into Web components(<book-preview> and <app-header>) to improve modularity and reuseability. The app retains all the fucntionailty(search, "Show more", book details, theme toggle) while addressing visual issues(SVG title, broken images).

## Web Components
**<book-preview>**
- **Purpose**: Displays a book preview with an image, titlee, and author.
- **Attributes**:
    -**id**: Book ID for click events.
    -**title**: Book title.
    -**author**: Author name.
    -**image**: Image URL (empty if invalid).
- **Implementation**: 
    -Uses Shadow DOM for encapsulated HTML, CSS and JavaScript.
    -Renders a <button class="preview"> with image and text.
    -Styles match the original preview.

**<app-header>**
- **Purpose**: Displays the app header with an SVG title and search/settings buttons.
- **Implmentation**:
    - Encapulates <div data-header> with SVG and buttons.
    - Handles click events to open Search/settings overlays.
    - Uses Shadow DOM for styling isolation.

## Process
1. **Understanding the Codebase**:
   - Analyzed scripts.js to identify Book.createPreviewElement for conversion.
   - Reviewed <div data header> for SVG and button functionality.
2. **Creating <book-preview>**:
    - Moved preview logic to book-preview.js.
    - Updated BookListManager.renderBooks to use <book-preview>.
    - Ensured click events trigger showBookDetails.
3. **Creating <app-header>**:
   - Encapsulated SVG and buttons in app-header.js.
   - Moved event listenerss to the component.
   - Fixed SVG rendering with proper HTML structure and CSS.
4. **Challenges**:
    - **SVG Not Displaying**: Incorrect <svg> structure caused rendering issues. Fixed by nesting all the <path> elements and ensuring they were indented correctly to align with each other.
    - **Broken Images**: Permission for images were available prior to abstrctions and once abstraction wasa completed, the images were forbidden from use.
5. **Testing**:
    - Testing <book-preview> for rendering and click functionality.
    - Verfying <app-header> SVG and button interctions.
    - Confirming search, "Show more", and theme toggle works.

## Reflections

- **Advantages of Web Components**:
  - Encapsulation prevents style conflicts (e.g., Shadow DOM isolates .preview styles).
  - Reusability allows <book-preview> to be used in other projects.
  - Modularity simplifies maintenance (e.g., update header inn one file).
- **Limitations**:
  - Event handling requires careful intergration (e.g.,<app-header> accesses external overlays).
  - Browser support for Shadow DOM is good but not universal (e.g., older browsers).
- **Insights**:
  - Web Components shine for UI elements like previews and headers but require planning for data flow (e.g., passing authors to <book-preview>).
  - Debugging Shadow DOM requires DevTools inspection of shadow roots.

## Usage

1. Ensures /images/ contains book images or uses external URLs in data.js.
2. Run on a server (.g., http://localhost) for local image paths.
3. Includes scripts in index.html.

## Next Steps
  - Fix book.image URLs to display in browser.
  - Consider Converting data-search-overlay or data-list-active to Web Components for further modularity.
  - Enhance <book-preview> with custom events for better decoupling.

