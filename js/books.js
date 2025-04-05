// books.js - PART 1: Initial Setup and Event Listeners
let currentUser = null;
let isAdmin = false;

// Replace your current Add Book modal handler with this
// Add Book Modal and Form Handler
// Helper functions
function getDocumentType(url) {
    if (!url) return { type: 'Unknown', viewer: 'default' };

    const extension = url.split('.').pop().toLowerCase();
    
    const types = {
        'pdf': { type: 'PDF', viewer: 'pdf' },
        'epub': { type: 'EPUB', viewer: 'epub' },
        'mobi': { type: 'MOBI', viewer: 'epub' },
        'doc': { type: 'Word', viewer: 'word' },
        'docx': { type: 'Word', viewer: 'word' },
        'txt': { type: 'Text', viewer: 'text' }
    };

    return types[extension] || { type: 'Unknown', viewer: 'default' };
}

function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return 'Unknown';

    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

// Global elements object
const elements = {
    modal: document.getElementById('add-book-modal'),
    form: document.getElementById('add-book-form'),
    coverPreview: document.getElementById('add-cover-preview'),
    coverUpload: document.getElementById('add-cover-upload'),
    coverUrlInput: document.getElementById('add-cover-url'),
    title: document.getElementById('add-title'),
    authors: document.getElementById('add-authors'),
    pubDate: document.getElementById('add-pub-date'),
    isbn: document.getElementById('add-isbn'),
    language: document.getElementById('add-language'),
    genre: document.getElementById('add-genre'),
    genreOther: document.getElementById('add-genre-other'), // Add this line
    tags: document.getElementById('add-tags'),
    description: document.getElementById('add-description'),
    copyright: document.getElementById('add-copyright'),
    drm: document.getElementById('add-drm'),
    pdfLink: document.getElementById('add-pdf-link')
};

// Modal handler
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Add Book Setup');

    const addBookBtn = document.getElementById('add-book');
    const addBookModal = document.getElementById('add-book-modal');

    console.log('Initial Elements:', {
        addBookBtn: addBookBtn,
        addBookModal: addBookModal
    });

    if (addBookBtn) {
        addBookBtn.addEventListener('click', function() {
            console.log('Add Book Button Clicked');
            
            const modal = document.getElementById('add-book-modal');
            console.log('Modal Element:', modal);

            if (modal) {
                // Remove hidden class and ensure display is set
                modal.classList.remove('hidden');
                modal.style.display = 'flex';

                // Ensure modal content is visible
                const modalContent = modal.querySelector('.container');
                const modalForm = modal.querySelector('#add-book-form');
                
                console.log('Modal Elements:', {
                    modalContent: modalContent,
                    modalForm: modalForm
                });

                if (modalContent) {
                    modalContent.style.display = 'block';
                }

                // Add these styles directly
                modal.style.position = 'fixed';
                modal.style.top = '0';
                modal.style.left = '0';
                modal.style.right = '0';
                modal.style.bottom = '0';
                modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                modal.style.zIndex = '50';
                modal.style.display = 'flex';
                modal.style.alignItems = 'center';
                modal.style.justifyContent = 'center';
            }
        });
    }

    // Setup close handlers
    const closeAddModal = document.getElementById('close-add-modal');
    const cancelAddBtn = document.getElementById('cancel-add');

    if (closeAddModal) {
        closeAddModal.addEventListener('click', function() {
            console.log('Close button clicked');
            if (addBookModal) {
                addBookModal.classList.add('hidden');
                addBookModal.style.display = 'none';
            }
        });
    }

    if (cancelAddBtn) {
        cancelAddBtn.addEventListener('click', function() {
            console.log('Cancel button clicked');
            if (addBookModal) {
                addBookModal.classList.add('hidden');
                addBookModal.style.display = 'none';
            }
        });
    }

    // Close on outside click
    if (addBookModal) {
        addBookModal.addEventListener('click', function(e) {
            if (e.target === addBookModal) {
                addBookModal.classList.add('hidden');
                addBookModal.style.display = 'none';
            }
        });
    }

    // Initialize Add Book Form
    setupAddBookForm();
});

// Form setup and handlers
function setupAddBookForm() {
    if (elements.genre && elements.genreOther) {
        elements.genre.addEventListener('change', function() {
            if (this.value === 'Other') {
                elements.genreOther.classList.remove('hidden');
                elements.genreOther.required = true;
            } else {
                elements.genreOther.classList.add('hidden');
                elements.genreOther.required = false;
                elements.genreOther.value = '';
            }
        });
    }
    // Handle cover image upload
    if (elements.coverUpload) {
        elements.coverUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        elements.coverPreview.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                } else {
                    alert('Please upload an image file');
                    elements.coverUpload.value = '';
                }
            }
        });
    }

    // Handle cover URL change
    if (elements.coverUrlInput) {
        elements.coverUrlInput.addEventListener('change', function() {
            const imageUrl = this.value.trim();
            if (imageUrl) {
                const img = new Image();
                img.onload = function() {
                    elements.coverPreview.src = imageUrl;
                };
                img.onerror = function() {
                    elements.coverPreview.src = './assets/images/default-cover.jpg';
                    alert('Unable to load image from the provided URL');
                };
                img.src = imageUrl;
            } else {
                elements.coverPreview.src = './assets/images/default-cover.jpg';
            }
        });
    }

    // Handle form submission
    if (elements.form) {
        elements.form.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Form submitted');

            const submitButton = e.target.querySelector('button[type="submit"]');
            const originalButtonText = submitButton ? submitButton.textContent : 'Add Book';

            try {
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = 'Adding Book...';
                }

                // Validate required fields
                const requiredFields = ['title', 'authors', 'pdfLink'];
                const missingFields = requiredFields.filter(field => 
                    !elements[field] || !elements[field].value.trim()
                );

                if (missingFields.length > 0) {
                    alert('Please fill in all required fields: ' + missingFields.join(', '));
                    return;
                }

                // Get file info
                const docUrl = elements.pdfLink.value;
                const docInfo = getDocumentType(docUrl);
                let fileSize = 'Unknown';

                // Replace the file size detection code in the form submission handler
                try {
                    const response = await fetch(docUrl, { 
                        method: 'HEAD',
                        mode: 'no-cors' // Add this line
                    }).catch(() => null);
                    
                    if (response && response.headers) {
                        const size = response.headers.get('content-length');
                        if (size) {
                            fileSize = formatFileSize(parseInt(size));
                        }
                    }
                } catch (error) {
                    console.warn('Could not detect file size, using default');
                    fileSize = 'Unknown';
                }

                const genre = elements.genre.value === 'Other' 
                    ? elements.genreOther.value.trim() 
                    : elements.genre.value;

                const newBook = {
                    title: elements.title.value.trim(),
                    author: elements.authors.value.trim(),
                    publicationDate: elements.pubDate.value,
                    isbn: elements.isbn.value.trim(),
                    language: elements.language.value.trim(),
                    genre: genre, // Updated this line to use the new genre value
                    fileFormat: docInfo.type,
                    fileSize: fileSize,
                    tags: elements.tags.value.split(',').map(tag => tag.trim()).filter(tag => tag),
                    description: elements.description.value.trim(),
                    copyright: elements.copyright.value.trim(),
                    drm: elements.drm.value.trim(),
                    pdfLink: docUrl,
                    coverUrl: elements.coverUrlInput.value.trim() || './assets/images/default-cover.jpg',
                    addedDate: firebase.firestore.FieldValue.serverTimestamp(),
                    lastModified: firebase.firestore.FieldValue.serverTimestamp(),
                    viewCount: 0,
                    downloadCount: 0,
                    likesCount: 0,
                    reviewsCount: 0
                };

                console.log('Adding new book:', newBook);

                // Add to Firestore
                const docRef = await db.collection('books').add(newBook);
                console.log('Book added with ID:', docRef.id);

                // Handle cover image upload if needed
                if (elements.coverUpload.files.length > 0) {
                    const file = elements.coverUpload.files[0];
                    const storageRef = firebase.storage().ref(`book-covers/${docRef.id}`);
                    const snapshot = await storageRef.put(file);
                    const coverUrl = await snapshot.ref.getDownloadURL();
                    await docRef.update({ coverUrl: coverUrl });
                }

                // Show success message
                alert('Book added successfully!');

                // Reset form and close modal
                elements.form.reset();
                elements.coverPreview.src = './assets/images/default-cover.jpg';
                elements.modal.classList.add('hidden');
                elements.modal.style.display = 'none';

                // Refresh the book list
                if (typeof fetchBooks === 'function') {
                    fetchBooks(adminBookListElement, true);
                }

            } catch (error) {
                console.error('Error adding book:', error);
                alert('Error adding book: ' + error.message);
            } finally {
                // Reset button state
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all elements
    const bookCatalogElement = document.getElementById('book-catalog');
    const adminBookListElement = document.getElementById('admin-book-list');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchResultsElement = document.getElementById('search-results');
    const addBookButton = document.getElementById('add-book');
    const addBookForm = document.getElementById('add-book-form');
    const bookmarkListElement = document.getElementById('bookmark-list');
    const suggestionForm = document.getElementById('suggestion-form');
    const suggestionStatusElement = document.getElementById('suggestion-status');
    const userReportsElement = document.getElementById('user-reports');
    const bookReportsElement = document.getElementById('book-reports');
    const reviewListElement = document.getElementById('review-list');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section-content');

    // Initialize sorting and filtering elements
    const sortOptions = document.getElementById('sort-options');
    const genreCheckboxes = document.querySelectorAll('input[name="genre"]');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const minLikesInput = document.getElementById('min-likes');
    const maxLikesInput = document.getElementById('max-likes');
    const booksLoading = document.getElementById('books-loading');
    const booksError = document.getElementById('books-error');
    const booksEmpty = document.getElementById('books-empty');

    let allBooks = []; // Store all books for filtering and sorting

    // Error Handling and Debug Functions
    function handleError(error, context) {
        console.error(`Error in ${context}:`, error);
        
        // Create error message element
        const errorMessage = document.createElement('div');
        errorMessage.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50';
        errorMessage.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <strong class="font-bold">Error in ${context}!</strong>
                    <span class="block sm:inline"> ${error.message || 'An unexpected error occurred.'}</span>
                </div>
                <button class="ml-4" onclick="this.parentElement.parentElement.remove();">
                    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                </button>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(errorMessage);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (errorMessage.parentElement) {
                errorMessage.remove();
            }
        }, 5000);
    }

    function validateElements(elements, context) {
        const missingElements = Object.entries(elements)
            .filter(([key, element]) => !element)
            .map(([key]) => key);

        if (missingElements.length > 0) {
            debugLog(`Missing elements in ${context}:`, missingElements);
            return false;
        }
        return true;
    }

    // Add debug logging function
    function debugLog(message, data = null) {
        if (data) {
            console.log(`[Debug] ${message}:`, data);
        } else {
            console.log(`[Debug] ${message}`);
        }
    }

    async function detectFileInfo(url) {
        if (!url) return;
    
        try {
            // Detect file type from URL
            const docInfo = getDocumentType(url);
            console.log('Detected file type:', docInfo.type);
    
            // Try to get file size using a CORS proxy
            try {
                const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
                const response = await fetch(proxyUrl + url, { method: 'HEAD' });
                const size = response.headers.get('content-length');
                if (size) {
                    const formattedSize = formatFileSize(parseInt(size));
                    console.log('Detected file size:', formattedSize);
                    return {
                        type: docInfo.type,
                        size: formattedSize
                    };
                }
            } catch (error) {
                console.warn('Could not detect file size:', error);
            }
    
            return {
                type: docInfo.type,
                size: null
            };
        } catch (error) {
            console.error('Error detecting file info:', error);
            return null;
        }
    }

    // Add these functions at the appropriate place in PART 1
    function showLoadingIndicator(element) {
        if (element) {
            const loader = document.createElement('div');
            loader.className = 'loading-indicator flex items-center justify-center p-4';
            loader.innerHTML = `
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span class="ml-2">Loading...</span>
            `;
            element.appendChild(loader);
        }
    }

    function hideLoadingIndicator(element) {
        if (element) {
            const loader = element.querySelector('.loading-indicator');
            if (loader) {
                loader.remove();
            }
        }
    }

    // Loading state functions
    function showLoading() {
        if (booksLoading) {
            booksLoading.classList.remove('hidden');
            booksError?.classList.add('hidden');
            booksEmpty?.classList.add('hidden');
            bookCatalogElement?.classList.add('hidden');
        }
    }

    function showError() {
        if (booksError) {
            booksLoading?.classList.add('hidden');
            booksError.classList.remove('hidden');
            booksEmpty?.classList.add('hidden');
            bookCatalogElement?.classList.add('hidden');
        }
    }

    function showEmpty() {
        if (booksEmpty) {
            booksLoading?.classList.add('hidden');
            booksError?.classList.add('hidden');
            booksEmpty.classList.remove('hidden');
            bookCatalogElement?.classList.add('hidden');
        }
    }

    function showBooks() {
        if (bookCatalogElement) {
            booksLoading?.classList.add('hidden');
            booksError?.classList.add('hidden');
            booksEmpty?.classList.add('hidden');
            bookCatalogElement.classList.remove('hidden');
        }
    }

    // In PART 1, update the fetchBooks function:
    async function fetchBooks(listElement, isAdmin) {
        console.log('Fetching books for:', isAdmin ? 'admin' : 'user', 'List element:', listElement?.id);

        if (!listElement) {
            console.error('List element not found');
            return;
        }

        showLoading();
        listElement.innerHTML = ''; // Clear current list

        try {
            const querySnapshot = await db.collection('books').get();
            console.log('Books fetched:', querySnapshot.size);
            
            if (querySnapshot.empty) {
                console.log('No books found');
                showEmpty();
                return;
            }

            const bookPromises = querySnapshot.docs.map(async (doc) => {
                try {
                    const book = doc.data();
                    book.id = doc.id;

                    // Fetch likes and reviews count
                    const [likesSnapshot, reviewsSnapshot] = await Promise.all([
                        db.collection('likes').where('bookId', '==', doc.id).get(),
                        db.collection('reviews')
                            .where('bookId', '==', doc.id)
                            .where('status', '==', 'approved')
                            .get()
                    ]);

                    book.likesCount = likesSnapshot.size;
                    book.reviewsCount = reviewsSnapshot.size;
                    book.popularity = book.likesCount + book.reviewsCount;

                    return book;
                } catch (error) {
                    console.error('Error processing book:', doc.id, error);
                    return null;
                }
            });

            allBooks = (await Promise.all(bookPromises)).filter(book => book !== null);
            console.log('Processed books:', allBooks.length);

            if (allBooks.length === 0) {
                showEmpty();
                return;
            }

            renderBooks(listElement, allBooks, isAdmin);
            showBooks();

            // Set up sorting and filtering if not admin view
            if (!isAdmin && sortOptions) {
                setupSortingAndFiltering(listElement);
            }

        } catch (error) {
            console.error('Error fetching books:', error);
            showError();
        }
    }

    // Add these new functions at the beginning of your books.js file
    function getUniqueGenres(books) {
        const genres = books.map(book => book.genre || 'Unspecified Genre')
                        .filter((genre, index, self) => 
                            genre && self.indexOf(genre) === index
                        )
                        .sort();
        
        return ['All Genres', ...genres];
    }

    function updateGenreFilters(genres) {
        const genreContainer = document.querySelector('.genre-filters');
        if (!genreContainer) return;

        genreContainer.innerHTML = genres.map(genre => `
            <label class="flex items-center">
                <input type="checkbox" name="genre" value="${genre === 'All Genres' ? 'all' : genre}" 
                    class="mr-2" ${genre === 'All Genres' ? 'checked' : ''}>
                ${genre}
            </label>
        `).join('');
    }

    // Your updated setupSortingAndFiltering function
    function setupSortingAndFiltering(listElement, isAdmin) {
        const sortOptions = document.getElementById('sort-options');
        const applyFiltersBtn = document.getElementById('apply-filters');

        // Fetch books and setup filters
        db.collection('books').get().then((snapshot) => {
            const books = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Update genre filters with actual genres from books
            const genres = getUniqueGenres(books);
            updateGenreFilters(genres);

            const genreCheckboxes = document.querySelectorAll('input[name="genre"]');
            
            // Handle "All Genres" checkbox
            const allGenresCheckbox = document.querySelector('input[value="all"]');
            if (allGenresCheckbox) {
                allGenresCheckbox.addEventListener('change', (e) => {
                    genreCheckboxes.forEach(checkbox => {
                        if (checkbox !== allGenresCheckbox) {
                            checkbox.checked = false;
                            checkbox.disabled = e.target.checked;
                        }
                    });
                });
            }

            // Handle other genre checkboxes
            genreCheckboxes.forEach(checkbox => {
                if (checkbox.value !== 'all') {
                    checkbox.addEventListener('change', () => {
                        if (checkbox.checked && allGenresCheckbox) {
                            allGenresCheckbox.checked = false;
                        }
                    });
                }
            });

            if (sortOptions) {
                sortOptions.addEventListener('change', () => {
                    const filteredBooks = filterBooks(books);
                    const sortedBooks = sortBooks(filteredBooks, sortOptions.value);
                    renderBooks(listElement, sortedBooks, isAdmin);
                });
            }

            if (applyFiltersBtn) {
                applyFiltersBtn.addEventListener('click', () => {
                    const filteredBooks = filterBooks(books);
                    const sortedBooks = sortOptions ? 
                        sortBooks(filteredBooks, sortOptions.value) : 
                        filteredBooks;
                    renderBooks(listElement, sortedBooks, isAdmin);
                });
            }

            // Initial render
            renderBooks(listElement, books, isAdmin);
        });
    }

    // Your existing filterBooks function remains the same
    function filterBooks(books) {
        const genreCheckboxes = document.querySelectorAll('input[name="genre"]');
        const selectedGenres = Array.from(genreCheckboxes)
            .filter(cb => cb.checked && cb.value !== 'all')
            .map(cb => cb.value.toLowerCase());

        const allGenresSelected = Array.from(genreCheckboxes)
            .find(cb => cb.value === 'all')?.checked;

        return books.filter(book => {
            if (allGenresSelected) return true;

            const bookGenre = (book.genre || '').toLowerCase();
            const genreMatch = selectedGenres.length === 0 || selectedGenres.includes(bookGenre);

            return genreMatch;
        });
    }

    // Sort books function
    function sortBooks(books, sortBy) {
        const sortedBooks = [...books];
        
        switch(sortBy) {
            case 'name-asc':
                return sortedBooks.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
            case 'name-desc':
                return sortedBooks.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
            case 'date-new':
                return sortedBooks.sort((a, b) => {
                    const dateA = a.publicationDate ? new Date(a.publicationDate) : new Date(0);
                    const dateB = b.publicationDate ? new Date(b.publicationDate) : new Date(0);
                    return dateB - dateA;
                });
            case 'date-old':
                return sortedBooks.sort((a, b) => {
                    const dateA = a.publicationDate ? new Date(a.publicationDate) : new Date(0);
                    const dateB = b.publicationDate ? new Date(b.publicationDate) : new Date(0);
                    return dateA - dateB;
                });
            case 'popularity':
                return sortedBooks.sort((a, b) => {
                    const popularityA = (a.likesCount || 0) + (a.reviewsCount || 0);
                    const popularityB = (b.likesCount || 0) + (b.reviewsCount || 0);
                    return popularityB - popularityA;
                });
            default:
                return sortedBooks;
        }
    }

    // Update the renderBooks function:
    function renderBooks(listElement, books, isAdmin) {
        console.log('Rendering books:', books.length, 'Is admin:', isAdmin);
    
        if (!listElement) {
            console.error('List element not found in renderBooks');
            return;
        }
    
        listElement.innerHTML = '';
    
        if (books.length === 0) {
            console.log('No books to render');
            showEmpty();
            return;
        }
    
        books.forEach((book, index) => {
            try {
                const bookCard = document.createElement('div');
                bookCard.className = 'bg-white rounded-lg shadow-md overflow-hidden book-card flex flex-col h-full';
    
                const cardContent = `
                    <div class="flex flex-col h-full">
                        <div class="cursor-pointer view-trigger" style="height: 220px; display: flex; align-items: center; justify-content: center;">
                            <img src="${book.coverUrl || './assets/images/default-cover.jpg'}" 
                                alt="${book.title} cover" 
                                class="w-full h-full object-contain"
                                onerror="this.src='./assets/images/default-cover.jpg'"
                                style="max-height: 100%;">
                        </div>
                        <div class="p-4 flex flex-col flex-grow">
                            <div class="flex-grow">
                                <h3 class="text-lg font-semibold mb-2" style="min-height: 3em; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${book.title || 'Untitled'}</h3>
                                <p class="text-sm text-gray-600 mb-1" style="min-height: 1.5em; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">${book.author ? `by ${book.author}` : 'by Unknown Author'}</p>
                                <p class="text-sm text-gray-600 mb-2">${book.genre || 'Unspecified Genre'}</p>
                                <p class="text-sm text-gray-600 mb-1" style="min-height: 3em; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${book.description || 'No description available'}</p>
                                <div class="flex items-center mb-4">
                                    <span class="mr-2">
                                        <svg class="w-5 h-5 text-red-500 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                        ${book.likesCount || 0}
                                    </span>
                                    <span>
                                        <svg class="w-5 h-5 text-blue-500 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                        </svg>
                                        ${book.reviewsCount || 0}
                                    </span>
                                </div>
                            </div>
                            <div class="mt-auto">
                                <div class="flex space-x-2">
                                    <button class="view-trigger bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex-1">
                                        View Book
                                    </button>
                                    ${isAdmin ? `
                                        <button class="edit-book bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 flex-1">
                                            Edit
                                        </button>
                                        <button class="delete-book bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex-1">
                                            Delete
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
    
                bookCard.innerHTML = cardContent;
    
                // Add event listeners with error handling
                bookCard.querySelectorAll('.view-trigger').forEach(trigger => {
                    trigger.addEventListener('click', () => {
                        try {
                            debugLog('View trigger clicked for book:', book.id);
                            viewBook(book.id, book);
                        } catch (error) {
                            handleError(error, 'view trigger');
                        }
                    });
                });
    
                if (isAdmin) {
                    const editBtn = bookCard.querySelector('.edit-book');
                    const deleteBtn = bookCard.querySelector('.delete-book');
    
                    if (editBtn) {
                        editBtn.addEventListener('click', () => {
                            try {
                                debugLog('Edit trigger clicked for book:', book.id);
                                editBook(book.id, book);
                            } catch (error) {
                                handleError(error, 'edit trigger');
                            }
                        });
                    }
    
                    if (deleteBtn) {
                        deleteBtn.addEventListener('click', () => {
                            try {
                                debugLog('Delete trigger clicked for book:', book.id);
                                deleteBook(book.id);
                            } catch (error) {
                                handleError(error, 'delete trigger');
                            }
                        });
                    }
                }
    
                listElement.appendChild(bookCard);
                console.log(`Rendered book ${index + 1}/${books.length}: ${book.title}`);
    
            } catch (error) {
                console.error('Error rendering book card:', error, book);
            }
        });
    }

    function initializeNavigation() {
        console.log('Initializing navigation');
        
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('.section-content');
        const adminOnlyButtons = document.querySelectorAll('.admin-only');
        const userOnlyButtons = document.querySelectorAll('.user-only');
    
        // First, hide all sections
        sections.forEach(section => {
            section.classList.add('hidden');
        });
    
        // Show/hide role-specific navigation buttons and set default section
        if (isAdmin) {
            // Show admin buttons, hide user buttons
            adminOnlyButtons.forEach(btn => btn.classList.remove('hidden'));
            userOnlyButtons.forEach(btn => btn.classList.add('hidden'));
            
            // Show only admin book management section by default
            const adminSection = document.getElementById('admin-book-management');
            if (adminSection) {
                adminSection.classList.remove('hidden');
                // Hide all other sections explicitly
                sections.forEach(section => {
                    if (section.id !== 'admin-book-management') {
                        section.classList.add('hidden');
                    }
                });
            }
        } else {
            // Show user buttons, hide admin buttons
            adminOnlyButtons.forEach(btn => btn.classList.add('hidden'));
            userOnlyButtons.forEach(btn => btn.classList.remove('hidden'));
            
            // Show only view books section by default
            const viewBooksSection = document.getElementById('view-books');
            if (viewBooksSection) {
                viewBooksSection.classList.remove('hidden');
                // Hide all other sections explicitly
                sections.forEach(section => {
                    if (section.id !== 'view-books') {
                        section.classList.add('hidden');
                    }
                });
            }
        }
    
        // Add click handlers to navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active state from all links
                navLinks.forEach(l => {
                    l.classList.remove('bg-blue-600', 'text-white');
                    l.classList.add('text-blue-600');
                });
    
                // Add active state to clicked link
                link.classList.remove('text-blue-600');
                link.classList.add('bg-blue-600', 'text-white');
    
                const targetSection = link.getAttribute('data-section');
                console.log('Navigation clicked:', targetSection);
    
                // Hide all sections first
                sections.forEach(section => {
                    section.classList.add('hidden');
                });
    
                // Show only the target section
                const targetElement = document.getElementById(targetSection);
                if (targetElement) {
                    targetElement.classList.remove('hidden');
                    console.log('Showing section:', targetSection);
    
                    // Refresh content based on section
                    switch(targetSection) {
                        case 'view-books':
                            fetchBooks(bookCatalogElement, false);
                            break;
                        case 'admin-book-management':
                            fetchBooks(adminBookListElement, true);
                            break;
                        case 'my-bookmarks':
                            fetchBookmarks();
                            break;
                        case 'system-statistics':
                            fetchSystemStatistics();
                            break;
                        case 'review-management':
                            fetchReviews();
                            break;
                    }
                }
            });
        });
    
        // Set initial active state for navigation
        const defaultSection = isAdmin ? 'admin-book-management' : 'view-books';
        const defaultLink = document.querySelector(`[data-section="${defaultSection}"]`);
        if (defaultLink) {
            defaultLink.classList.remove('text-blue-600');
            defaultLink.classList.add('bg-blue-600', 'text-white');
        }
    
        // Debug log for visibility state
        console.log('Section visibility after initialization:');
        sections.forEach(section => {
            console.log(`${section.id}: ${!section.classList.contains('hidden')}`);
        });
    }

    // Add this helper function to PART 1
    function validateElements(elements, context) {
        const missingElements = Object.entries(elements)
            .filter(([key, element]) => !element)
            .map(([key]) => key);

        if (missingElements.length > 0) {
            debugLog(`Missing elements in ${context}:`, missingElements);
            return false;
        }
        return true;
    }

    // Authentication state observer with improved error handling and logging
    auth.onAuthStateChanged((user) => {
        try {
            if (!user) {
                console.log('No user logged in, redirecting...');
                window.location.href = 'index.html';
                return;
            }
    
            currentUser = user;
            isAdmin = user.email === 'admin@example.com';
            console.log(`User authenticated: ${user.email}, Admin: ${isAdmin}`);
    
            // Initialize navigation (this will handle section visibility)
            initializeNavigation();
    
            // Initialize functionality based on role
            if (isAdmin) {
                console.log('Initializing admin view');
                fetchBooks(adminBookListElement, true);
                
                // Set up admin-specific event listeners
                if (addBookButton && addBookForm) {
                    addBookButton.addEventListener('click', () => {
                        addBookForm.classList.toggle('hidden');
                    });
                    addBookForm.addEventListener('submit', handleAddBookSubmission);
                }
            } else {
                console.log('Initializing user view');
                fetchBooks(bookCatalogElement, false);
                
                // Set up user-specific event listeners
                if (searchButton && searchInput) {
                    searchButton.addEventListener('click', () => {
                        const query = searchInput.value.trim().toLowerCase();
                        console.log('Search query:', query);
                        searchBooks(query);
                    });
                }
            }
    
        } catch (error) {
            console.error('Authentication state handling error:', error);
            handleAuthError(error);
        }
    });

    // Handle add book form submission
    function handleAddBookSubmission(e) {
        e.preventDefault();
        // Your existing add book form submission code...
    }

    // Handle suggestion form submission
    function handleSuggestionSubmission(e) {
        e.preventDefault();
        console.log('Processing suggestion submission');

        // Get form elements
        const titleInput = document.getElementById('suggestion-title');
        const authorInput = document.getElementById('suggestion-author');
        const descriptionInput = document.getElementById('suggestion-description');
        const statusElement = document.getElementById('suggestion-status');

        // Validate inputs
        if (!titleInput || !authorInput || !descriptionInput || !statusElement) {
            console.error('Required form elements not found');
            return;
        }

        const suggestionData = {
            title: titleInput.value.trim(),
            author: authorInput.value.trim(),
            description: descriptionInput.value.trim(),
            userId: currentUser.uid,
            userEmail: currentUser.email,
            status: 'Pending',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Validate data
        if (!suggestionData.title || !suggestionData.author) {
            statusElement.innerHTML = `
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    Please fill in all required fields.
                </div>
            `;
            return;
        }

        // Show loading state
        statusElement.innerHTML = `
            <div class="text-center text-gray-600 py-4">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p class="mt-2">Submitting suggestion...</p>
            </div>
        `;

        // Submit to Firebase
        db.collection('suggestions').add(suggestionData)
            .then(() => {
                // Show success message
                statusElement.innerHTML = `
                    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        Thank you! Your book suggestion has been submitted successfully.
                    </div>
                `;

                // Clear form
                titleInput.value = '';
                authorInput.value = '';
                descriptionInput.value = '';

                // Refresh suggestions list
                fetchSuggestions();

                // Clear success message after 5 seconds
                setTimeout(() => {
                    statusElement.innerHTML = '';
                }, 5000);
            })
            .catch((error) => {
                console.error('Error submitting suggestion:', error);
                statusElement.innerHTML = `
                    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        Error submitting suggestion. Please try again.
                    </div>
                `;
            });
    }

    // Add this to PART 1
    function handleFirebaseConnectionError() {
        db.enableNetwork().catch(error => {
            console.error('Error reconnecting to Firestore:', error);
            setTimeout(handleFirebaseConnectionError, 5000); // Retry after 5 seconds
        });
    }

    // Add this to your error handlers
    window.addEventListener('online', handleFirebaseConnectionError);

    // Error handling function
    function handleAuthError(error) {
        console.error('Authentication error:', error);
        const errorMessage = document.createElement('div');
        errorMessage.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded';
        errorMessage.innerHTML = `
            <strong class="font-bold">Authentication Error!</strong>
            <span class="block sm:inline">${error.message}</span>
        `;
        document.body.insertBefore(errorMessage, document.body.firstChild);
    }
    // Book Viewing and Editing Functions
    function viewBook(bookId, book) {
        debugLog('Viewing book:', {bookId, book });
    
        if (!book) {
            handleError(new Error('Book data not provided'), 'viewBook');
            return;
        }
        console.log('Viewing book:', bookId, book);
    
        // Get all required elements with null checks
        const elements = {
            viewer: document.getElementById('book-viewer'),
            closeBtn: document.getElementById('close-viewer'),
            viewDocBtn: document.getElementById('view-pdf'),
            downloadBtn: document.getElementById('download-book'),
            viewCountElement: document.getElementById('viewer-pdf-views'),
            downloadCountElement: document.getElementById('viewer-pdf-downloads'),
            likesCountElement: document.getElementById('likes-count'),
            likeButton: document.getElementById('like-button'),
            reviewForm: document.getElementById('review-form'),
            reviewsContainer: document.getElementById('reviews-container'),
            starButtons: document.querySelectorAll('.star-btn'),
            selectedRatingElement: document.getElementById('selected-rating'),
            defaultView: document.querySelector('.flex-1.p-6.overflow-y-auto'),
            docViewLayout: document.getElementById('doc-view-layout'),
            backToDetailsBtn: document.getElementById('back-to-details'),
            docViewerFrame: document.getElementById('pdf-viewer-frame'),
            epubViewer: document.getElementById('epub-viewer'),
            docxViewer: document.getElementById('docx-viewer'),
            txtViewer: document.getElementById('txt-viewer'),
            docErrorMessage: document.getElementById('doc-error-message'),
            docLoading: document.getElementById('doc-loading'),
            docDownloadBtn: document.getElementById('doc-download-btn'),
            // Book details elements
            title: document.getElementById('viewer-book-title'),
            cover: document.getElementById('viewer-cover'),
            bookTitle: document.getElementById('viewer-title'),
            author: document.getElementById('viewer-author'),
            pubDate: document.getElementById('viewer-pub-date'),
            isbn: document.getElementById('viewer-isbn'),
            language: document.getElementById('viewer-language'),
            genre: document.getElementById('viewer-genre'),
            format: document.getElementById('viewer-format'),
            size: document.getElementById('viewer-size'),
            description: document.getElementById('viewer-description'),
            copyright: document.getElementById('viewer-copyright'),
            drm: document.getElementById('viewer-drm')
        };
    
        // Check if essential elements exist
        const essentialElements = ['viewer', 'title', 'cover', 'bookTitle', 'viewDocBtn', 'downloadBtn'];
        const missingElements = essentialElements.filter(key => !elements[key]);
    
        if (missingElements.length > 0) {
            console.error('Missing essential elements:', missingElements);
            handleError(new Error('Required viewer elements not found'), 'viewBook');
            return;
        }
    
        let rendition = null; // For EPUB viewer
    
        // User Interaction Tracking
        function trackBookView() {
            if (!currentUser) return;
    
            db.collection('user_interactions').add({
                userId: currentUser.uid,
                bookId: bookId,
                interactionType: 'view',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            }).catch(error => {
                console.error('Error tracking book view:', error);
            });
    
            // Increment view count
            db.collection('books').doc(bookId).update({
                viewCount: firebase.firestore.FieldValue.increment(1)
            }).catch(error => {
                console.error('Error updating view count:', error);
            });
        }
    
        // Likes Functionality
        function updateLikesCount() {
            if (!elements.likesCountElement) return;
    
            db.collection('likes')
                .where('bookId', '==', bookId)
                .get()
                .then((snapshot) => {
                    elements.likesCountElement.textContent = snapshot.size;
                })
                .catch(error => {
                    console.error('Error updating likes count:', error);
                });
        }
    
        function handleLike() {
            if (!currentUser) {
                alert('Please log in to like this book');
                return;
            }
    
            const likeRef = db.collection('likes')
                .where('bookId', '==', bookId)
                .where('userId', '==', currentUser.uid);
    
            likeRef.get().then((snapshot) => {
                if (snapshot.empty) {
                    // Add like
                    db.collection('likes').add({
                        bookId: bookId,
                        userId: currentUser.uid,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    }).then(() => {
                        updateLikesCount();
                        // Track like interaction
                        db.collection('user_interactions').add({
                            userId: currentUser.uid,
                            bookId: bookId,
                            interactionType: 'like',
                            timestamp: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    });
                } else {
                    // Remove like
                    snapshot.forEach((doc) => {
                        db.collection('likes').doc(doc.id).delete()
                            .then(() => updateLikesCount());
                    });
                }
            }).catch(error => {
                console.error('Error handling like:', error);
            });
        }
    
        // Review System
        function submitEnhancedReview(reviewData) {
            if (!currentUser) {
                alert('Please log in to submit a review');
                return;
            }
    
            const enhancedReviewData = {
                bookId: bookId,
                userId: currentUser.uid,
                userName: currentUser.displayName || 'Anonymous',
                rating: reviewData.rating,
                reviewText: reviewData.reviewText,
                status: currentUser.email === 'admin@example.com' ? 'approved' : 'pending',
                helpfulCount: 0,
                notHelpfulCount: 0,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };
    
            db.collection('enhanced_reviews').add(enhancedReviewData)
                .then(() => {
                    // Track review submission
                    db.collection('user_interactions').add({
                        userId: currentUser.uid,
                        bookId: bookId,
                        interactionType: 'review_submission',
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
    
                    fetchEnhancedReviews();
                    if (elements.reviewForm) {
                        elements.reviewForm.reset();
                    }
                    if (elements.selectedRatingElement) {
                        elements.selectedRatingElement.textContent = '0';
                    }
                })
                .catch((error) => {
                    console.error('Error submitting review:', error);
                    handleError(error, 'submitEnhancedReview');
                });
        }
    
        // Fetch and Display Reviews
        function fetchEnhancedReviews() {
            if (!elements.reviewsContainer) return;
    
            elements.reviewsContainer.innerHTML = '';
    
            db.collection('enhanced_reviews')
                .where('bookId', '==', bookId)
                .where('status', '==', 'approved')
                .orderBy('timestamp', 'desc')
                .get()
                .then((snapshot) => {
                    if (snapshot.empty) {
                        elements.reviewsContainer.innerHTML = '<p class="text-gray-600">No reviews yet</p>';
                        return;
                    }
    
                    snapshot.forEach((doc) => {
                        const review = doc.data();
                        const reviewElement = createReviewElement(doc.id, review);
                        elements.reviewsContainer.appendChild(reviewElement);
                    });
                })
                .catch((error) => {
                    console.error('Error fetching reviews:', error);
                    elements.reviewsContainer.innerHTML = 
                        '<p class="text-red-600">Error loading reviews. Please try again.</p>';
                });
        }
    
        // Create Review Element
        function createReviewElement(reviewId, review) {
            const reviewElement = document.createElement('div');
            reviewElement.className = 'bg-gray-100 p-4 rounded-lg mb-2';
            reviewElement.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <h5 class="font-semibold">${review.userName}</h5>
                    <div class="text-yellow-500">
                        ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                    </div>
                </div>
                <p>${review.reviewText}</p>
                <div class="flex justify-between items-center mt-2">
                    <small class="text-gray-500">
                        ${new Date(review.timestamp.toDate()).toLocaleString()}
                    </small>
                    <div class="flex items-center space-x-2">
                        <button class="helpful-btn text-sm text-blue-500">
                            Helpful (${review.helpfulCount})
                        </button>
                        <button class="not-helpful-btn text-sm text-red-500">
                            Not Helpful (${review.notHelpfulCount})
                        </button>
                    </div>
                </div>
            `;
            // Add event listeners for helpful/not helpful buttons
            const helpfulBtn = reviewElement.querySelector('.helpful-btn');
            const notHelpfulBtn = reviewElement.querySelector('.not-helpful-btn');

            if (helpfulBtn) {
                helpfulBtn.addEventListener('click', () => voteReviewHelpfulness(reviewId, true));
            }
            if (notHelpfulBtn) {
                notHelpfulBtn.addEventListener('click', () => voteReviewHelpfulness(reviewId, false));
            }

            return reviewElement;
        }

        // Review Helpfulness Voting
        function voteReviewHelpfulness(reviewId, isHelpful) {
            if (!currentUser) {
                alert('Please log in to vote');
                return;
            }

            db.collection('review_votes')
                .where('reviewId', '==', reviewId)
                .where('userId', '==', currentUser.uid)
                .get()
                .then((snapshot) => {
                    if (snapshot.empty) {
                        // Add vote
                        return db.collection('review_votes').add({
                            reviewId: reviewId,
                            userId: currentUser.uid,
                            isHelpful: isHelpful,
                            timestamp: firebase.firestore.FieldValue.serverTimestamp()
                        }).then(() => {
                            // Update review helpfulness count
                            return db.collection('enhanced_reviews').doc(reviewId).update({
                                [isHelpful ? 'helpfulCount' : 'notHelpfulCount']: 
                                    firebase.firestore.FieldValue.increment(1)
                            });
                        });
                    } else {
                        throw new Error('You have already voted on this review');
                    }
                })
                .then(() => {
                    fetchEnhancedReviews(); // Refresh reviews to show updated counts
                })
                .catch((error) => {
                    console.error('Error voting on review:', error);
                    alert(error.message);
                });
        }

        // Initialize Book Viewer
        try {
            // Set basic book information
            elements.title.textContent = book.title || 'Untitled';
            elements.cover.src = book.coverUrl || './assets/images/default-cover.jpg';
            elements.bookTitle.textContent = book.title || 'Untitled';
            elements.author.textContent = book.author || 'Unknown Author';
            elements.pubDate.textContent = formatDate(book.publicationDate);
            elements.isbn.textContent = book.isbn || book.asin || 'N/A';
            elements.language.textContent = book.language || 'N/A';
            elements.genre.textContent = book.genre || 'N/A';
            elements.format.textContent = getDocumentType(book.pdfLink).type;
            elements.size.textContent = formatFileSize(book.fileSize);
            elements.description.textContent = book.description || 'No description available';
            elements.copyright.textContent = book.copyright || 'All rights reserved';
            elements.drm.textContent = book.drm || 'None';

            // Update counts
            elements.viewCountElement.textContent = book.viewCount || 0;
            elements.downloadCountElement.textContent = book.downloadCount || 0;

            // Set up event listeners
            elements.likeButton.addEventListener('click', handleLike);
            updateLikesCount();

            if (elements.reviewForm) {
                elements.reviewForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const reviewText = document.getElementById('review-text')?.value.trim();
                    const selectedRating = parseInt(elements.selectedRatingElement?.textContent || '0');
                    
                    if (!selectedRating || !reviewText) {
                        alert('Please provide both a rating and review text');
                        return;
                    }

                    submitEnhancedReview({
                        rating: selectedRating,
                        reviewText: reviewText
                    });
                });
            }

            // Star rating selection
            elements.starButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const rating = button.getAttribute('data-rating');
                    if (elements.selectedRatingElement) {
                        elements.selectedRatingElement.textContent = rating;
                    }
                    
                    elements.starButtons.forEach(btn => {
                        const btnRating = btn.getAttribute('data-rating');
                        if (btnRating <= rating) {
                            btn.classList.add('text-yellow-500');
                        } else {
                            btn.classList.remove('text-yellow-500');
                        }
                    });
                });
            });

            // Add this after star rating initialization in viewBook function
            // const toggleReviews = document.getElementById('toggle-reviews');
            // const reviewsContent = document.getElementById('reviews-content');
            // if (toggleReviews && reviewsContent) {
            //     toggleReviews.addEventListener('click', () => {
            //         const isExpanded = reviewsContent.classList.toggle('hidden');
            //         const toggleIcon = toggleReviews.querySelector('span:last-child');
            //         if (toggleIcon) {
            //             toggleIcon.textContent = isExpanded ? '+' : '−';
            //         }
            //     });
            // }

            // Updated collapsible reviews functionality to prevent duplication
            try {
                // First, remove any existing review sections to prevent duplication
                const existingReviewSections = document.querySelectorAll('.review-section-container');
                existingReviewSections.forEach(section => section.remove());

                const reviewsSection = document.querySelector('.p-6.border-t');
                if (reviewsSection) {
                    // Create a container for the entire review section
                    const reviewSectionContainer = document.createElement('div');
                    reviewSectionContainer.className = 'review-section-container'; // Add a unique class for identification

                    // Create and insert toggle button with improved styling
                    const toggleButton = document.createElement('button');
                    toggleButton.className = 'flex justify-between items-center w-full mb-4 hover:bg-gray-50 p-2 rounded';
                    toggleButton.innerHTML = `
                        <div class="flex items-center">
                            <h4 class="text-lg font-semibold">Reviews</h4>
                            <span class="text-sm text-gray-500 ml-2">(Click to add/view reviews)</span>
                        </div>
                        <span class="text-xl font-bold transform transition-transform duration-200">+</span>
                    `;

                    // Get the content to be collapsed
                    const contentToCollapse = reviewsSection.querySelector('#add-review-section')?.parentElement;
                    if (contentToCollapse) {
                        // Add the toggle button and content to the container
                        reviewSectionContainer.appendChild(toggleButton);
                        reviewSectionContainer.appendChild(contentToCollapse);

                        // Insert the container into the reviews section
                        reviewsSection.appendChild(reviewSectionContainer);

                        // Set initial state
                        let isExpanded = false;
                        contentToCollapse.style.display = 'none';
                        const toggleIcon = toggleButton.querySelector('span:last-child');

                        // Add click handler
                        toggleButton.addEventListener('click', () => {
                            isExpanded = !isExpanded;
                            if (isExpanded) {
                                contentToCollapse.style.display = 'block';
                                toggleIcon.textContent = '−'; // Using minus sign
                                // Ensure the reviews section is fully visible
                                setTimeout(() => {
                                    reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                }, 100);
                            } else {
                                contentToCollapse.style.display = 'none';
                                toggleIcon.textContent = '+';
                            }
                        });

                        // Style the content container
                        contentToCollapse.style.transition = 'all 0.3s ease-in-out';
                        
                        // Add a container for reviews with fixed max height
                        const reviewsContainer = document.getElementById('reviews-container');
                        if (reviewsContainer) {
                            reviewsContainer.style.maxHeight = '400px'; // Adjust this value as needed
                            reviewsContainer.style.overflowY = 'auto';
                            reviewsContainer.style.marginTop = '1rem';
                        }
                    }
                }
            } catch (error) {
                console.error('Error setting up collapsible reviews:', error);
            }

            // Document viewing logic
            const docUrl = book.pdfLink || book.epubLink || book.docLink || '';
            const docInfo = getDocumentType(docUrl);

            // Update button text based on document type
            if (elements.viewDocBtn) {
                elements.viewDocBtn.textContent = `View ${docInfo.type}`;
            }
            if (elements.downloadBtn) {
                elements.downloadBtn.textContent = `Download ${docInfo.type}`;
            }
            if (elements.docDownloadBtn) {
                elements.docDownloadBtn.textContent = `Download ${docInfo.type}`;
            }

            // Document viewer setup
            elements.viewDocBtn.onclick = async () => {
                if (!docUrl) {
                    alert('Document link not available');
                    return;
                }

                try {
                    if (elements.docLoading) {
                        elements.docLoading.classList.remove('hidden');
                    }

                    // Hide book details and show document layout
                    if (elements.defaultView) {
                        elements.defaultView.classList.add('hidden');
                    }
                    if (elements.docViewLayout) {
                        elements.docViewLayout.classList.remove('hidden');
                    }

                    // Hide all viewers first
                    hideAllViewers();

                    // Handle different document types
                    switch (docInfo.viewer) {
                        // Inside the document viewer setup, update the EPUB case
                        case 'epub':
                            if (elements.epubViewer) {
                                elements.epubViewer.classList.remove('hidden');
                                try {
                                    // Direct EPUB loading without CORS proxy
                                    const book = ePub(docUrl);
                                    rendition = book.renderTo(elements.epubViewer, {
                                        width: "100%",
                                        height: "100%",
                                        allowScriptedContent: true
                                    });
                                    await rendition.display();

                                    // Add navigation controls
                                    rendition.on("rendered", (section) => {
                                        let nextButton = document.createElement('button');
                                        nextButton.textContent = '→';
                                        nextButton.className = 'fixed right-4 top-1/2 bg-white p-2 rounded-full shadow-lg';
                                        nextButton.onclick = () => rendition.next();
                                        
                                        let prevButton = document.createElement('button');
                                        prevButton.textContent = '←';
                                        prevButton.className = 'fixed left-4 top-1/2 bg-white p-2 rounded-full shadow-lg';
                                        prevButton.onclick = () => rendition.prev();
                                        
                                        elements.epubViewer.appendChild(nextButton);
                                        elements.epubViewer.appendChild(prevButton);
                                    });

                                    if (elements.docLoading) {
                                        elements.docLoading.classList.add('hidden');
                                    }
                                } catch (error) {
                                    console.error('Error loading EPUB:', error);
                                    // Fallback to download option
                                    if (elements.docErrorMessage) {
                                        elements.docErrorMessage.innerHTML = `
                                            <div class="text-center">
                                                <p class="text-xl mb-2">Unable to preview EPUB file</p>
                                                <p class="text-gray-600 mb-4">This EPUB file cannot be previewed directly.</p>
                                                <button onclick="window.open('${docUrl}', '_blank')" 
                                                        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                                                    Download to View
                                                </button>
                                            </div>
                                        `;
                                        elements.docErrorMessage.classList.remove('hidden');
                                    }
                                    if (elements.docLoading) {
                                        elements.docLoading.classList.add('hidden');
                                    }
                                }
                            }
                            break;

                        case 'pdf':
                            if (elements.docViewerFrame) {
                                const pdfUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(docUrl)}&embedded=true`;
                                elements.docViewerFrame.src = pdfUrl;
                                elements.docViewerFrame.classList.remove('hidden');
                            }
                            break;

                        case 'word':
                            if (elements.docViewerFrame) {
                                const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(docUrl)}`;
                                elements.docViewerFrame.src = officeUrl;
                                elements.docViewerFrame.classList.remove('hidden');
                            }
                            break;

                        case 'text':
                            if (elements.txtViewer) {
                                const response = await fetch(docUrl);
                                const text = await response.text();
                                elements.txtViewer.innerHTML = `<pre>${text}</pre>`;
                                elements.txtViewer.classList.remove('hidden');
                            }
                            break;

                        default:
                            // For unsupported formats, show download prompt
                            if (elements.docErrorMessage) {
                                elements.docErrorMessage.innerHTML = `
                                    <div class="text-center">
                                        <p class="text-xl mb-2">This document type (${docInfo.type}) cannot be previewed</p>
                                        <button onclick="window.open('${docUrl}', '_blank')" 
                                                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                                            Download to View
                                        </button>
                                    </div>
                                `;
                                elements.docErrorMessage.classList.remove('hidden');
                            }
                            break;
                    }

                    // Update view count
                    await db.collection('books').doc(bookId).update({
                        viewCount: firebase.firestore.FieldValue.increment(1)
                    });

                    // Update display
                    const currentCount = parseInt(elements.viewCountElement.textContent || '0');
                    elements.viewCountElement.textContent = currentCount + 1;

                    // Hide loading indicator
                    if (elements.docLoading) {
                        elements.docLoading.classList.add('hidden');
                    }

                } catch (error) {
                    console.error('Error setting up document viewer:', error);
                    if (elements.docErrorMessage) {
                        elements.docErrorMessage.classList.remove('hidden');
                    }
                    if (elements.docLoading) {
                        elements.docLoading.classList.add('hidden');
                    }
                }
            };

            // Helper function to hide all viewers
            function hideAllViewers() {
                const viewers = [
                    elements.docViewerFrame,
                    elements.epubViewer,
                    elements.txtViewer,
                    elements.docErrorMessage
                ];

                viewers.forEach(viewer => {
                    if (viewer) {
                        viewer.classList.add('hidden');
                        if (viewer === elements.docViewerFrame) {
                            viewer.src = '';
                        }
                    }
                });
            }

            // Back button handling
            if (elements.backToDetailsBtn) {
                elements.backToDetailsBtn.onclick = () => {
                    if (elements.docViewLayout) {
                        elements.docViewLayout.classList.add('hidden');
                    }
                    if (elements.defaultView) {
                        elements.defaultView.classList.remove('hidden');
                    }
                    if (rendition) {
                        rendition.destroy();
                        rendition = null;
                    }
                    hideAllViewers();
                };
            }

            // Download handling
            const handleDownload = async () => {
                if (!docUrl) {
                    alert('Download link not available');
                    return;
                }

                try {
                    window.open(docUrl, '_blank');

                    // Update download count
                    await db.collection('books').doc(bookId).update({
                        downloadCount: firebase.firestore.FieldValue.increment(1)
                    });

                    // Update display
                    const currentCount = parseInt(elements.downloadCountElement.textContent || '0');
                    elements.downloadCountElement.textContent = currentCount + 1;

                } catch (error) {
                    console.error('Error downloading document:', error);
                    alert('Unable to download document. Please try again later.');
                }
            };

            // Assign download handlers
            elements.downloadBtn.onclick = handleDownload;
            if (elements.docDownloadBtn) {
                elements.docDownloadBtn.onclick = handleDownload;
            }

            // Show viewer
            elements.viewer.classList.remove('hidden');

            // Handle close
            const handleClose = () => {
                elements.viewer.classList.add('hidden');
                if (elements.docViewLayout) {
                    elements.docViewLayout.classList.add('hidden');
                }
                if (elements.defaultView) {
                    elements.defaultView.classList.remove('hidden');
                }
                if (rendition) {
                    rendition.destroy();
                    rendition = null;
                }
                hideAllViewers();
            };

            elements.closeBtn.onclick = handleClose;

            // Close on outside click
            elements.viewer.onclick = (e) => {
                if (e.target === elements.viewer) {
                    handleClose();
                }
            };

            // Track book view
            trackBookView();

            // Fetch initial reviews
            fetchEnhancedReviews();

        } catch (error) {
            console.error('Error in viewBook:', error);
            handleError(error, 'viewBook');
        }
    }
    
    // Example implementation of handleLike function
    function handleLike() {
        if (!currentUser) {
            alert('Please log in to like this book');
            return;
        }
    
        const likeRef = db.collection('likes')
            .where('bookId', '==', bookId)
            .where('userId', '==', currentUser.uid);
    
        likeRef.get().then((snapshot) => {
            if (snapshot.empty) {
                // Add like
                db.collection('likes').add({
                    bookId: bookId,
                    userId: currentUser.uid,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => {
                    updateLikesCount();
                    // Track like interaction
                    db.collection('user_interactions').add({
                        userId: currentUser.uid,
                        bookId: bookId,
                        interactionType: 'like',
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
                });
            } else {
                // Remove like
                snapshot.forEach((doc) => {
                    db.collection('likes').doc(doc.id).delete()
                        .then(() => updateLikesCount());
                });
            }
        }).catch(error => {
            console.error('Error handling like:', error);
        });
    }

    // Helper function to hide all viewers
    function hideAllViewers() {
        const viewers = [
            document.getElementById('pdf-viewer-frame'),
            document.getElementById('epub-viewer'),
            document.getElementById('docx-viewer'),
            document.getElementById('txt-viewer')
        ];

        viewers.forEach(viewer => {
            if (viewer) {
                viewer.classList.add('hidden');
            }
        });
    }

    // Helper functions (if not already defined)
    function formatDate(timestamp) {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString();
    }
    
    function formatFileSize(bytes) {
        if (!bytes) return 'N/A';
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Byte';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }

    // Add this function near your other utility functions
    async function getFileSize(url) {
        try {
            const response = await fetch(url, { 
                method: 'HEAD',
                mode: 'cors'
            });
            const size = response.headers.get('content-length');
            return size ? formatFileSize(parseInt(size)) : 'Size unknown';
        } catch (error) {
            console.warn('Could not detect file size:', error);
            // Estimate size based on file type
            const extension = url.split('.').pop().toLowerCase();
            const estimatedSizes = {
                'pdf': '2-10 MB',
                'epub': '1-5 MB',
                'mobi': '1-5 MB',
                'doc': '0.5-2 MB',
                'docx': '0.5-2 MB',
                'txt': '0.1-1 MB'
            };
            return estimatedSizes[extension] || 'Size unknown';
        }
    }

    // Helper functions
    function formatDate(timestamp) {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString();
    }
    
    // books.js - PART 3: Edit Book and Related Functions

    // Continue PART 2 with editBook function and related code

    function editBook(bookId, book) {
        debugLog('Editing book:', {bookId, book });
    
        if (!book) {
            handleError(new Error('Book data not provided'), 'viewBook');
            return;
        }
        console.log('Editing book:', bookId, book);
        
        // Get all required elements with null checks
        const elements = {
            modal: document.getElementById('edit-book-modal'),
            closeBtn: document.getElementById('close-edit-modal'),
            cancelBtn: document.getElementById('cancel-edit'),
            form: document.getElementById('edit-book-form'),
            coverPreview: document.getElementById('edit-cover-preview'),
            coverUpload: document.getElementById('edit-cover-upload'),
            coverUrlInput: document.getElementById('edit-cover-url'),
            title: document.getElementById('edit-title'),
            authors: document.getElementById('edit-authors'),
            pubDate: document.getElementById('edit-pub-date'),
            isbn: document.getElementById('edit-isbn'),
            language: document.getElementById('edit-language'),
            genre: document.getElementById('edit-genre'),
            tags: document.getElementById('edit-tags'),
            description: document.getElementById('edit-description'),
            copyright: document.getElementById('edit-copyright'),
            drm: document.getElementById('edit-drm'),
            pdfLink: document.getElementById('edit-pdf-link')
        };
    
        // Check if essential elements exist
        const essentialElements = ['modal', 'form', 'title', 'authors'];
        const missingElements = essentialElements.filter(key => !elements[key]);
    
        if (missingElements.length > 0) {
            console.error('Missing essential elements:', missingElements);
            handleError(new Error('Required edit form elements not found'), 'editBook');
            return;
        }
    
        try {
            // Populate form fields with null checks
            elements.title.value = book.title || '';
            elements.authors.value = book.author || '';
            elements.pubDate.value = formatDateForInput(book.publicationDate) || '';
            elements.isbn.value = book.isbn || book.asin || '';
            elements.language.value = book.language || '';
            elements.genre.value = book.genre || '';
            elements.tags.value = book.tags ? book.tags.join(', ') : '';
            elements.description.value = book.description || '';
            elements.copyright.value = book.copyright || '';
            elements.drm.value = book.drm || 'none';
            elements.pdfLink.value = book.pdfLink || '';
            elements.coverPreview.src = book.coverUrl || './assets/images/default-cover.jpg';
            elements.coverUrlInput.value = book.coverUrl || '';
    
            // Add file link change handler for automatic type and size detection
            elements.pdfLink.onchange = async () => {
                const url = elements.pdfLink.value;
                if (url) {
                    const docInfo = getDocumentType(url);
                    console.log('Detected file type:', docInfo.type);
                    
                    try {
                        const response = await fetch(url, { method: 'HEAD' });
                        const size = response.headers.get('content-length');
                        if (size) {
                            console.log('Detected file size:', formatFileSize(parseInt(size)));
                        }
                    } catch (error) {
                        console.warn('Could not detect file size:', error);
                    }
                }
            };
    
            // Handle cover image upload
            elements.coverUpload.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            elements.coverPreview.src = e.target.result;
                        };
                        reader.readAsDataURL(file);
                    } else {
                        alert('Please upload an image file');
                        elements.coverUpload.value = '';
                    }
                }
            };
    
            // Handle cover URL change
            elements.coverUrlInput.onchange = () => {
                if (elements.coverUrlInput.value) {
                    elements.coverPreview.src = elements.coverUrlInput.value;
                    elements.coverPreview.onerror = () => {
                        elements.coverPreview.src = './assets/images/default-cover.jpg';
                        alert('Invalid image URL');
                    };
                } else {
                    elements.coverPreview.src = './assets/images/default-cover.jpg';
                }
            };
    
            // Show modal
            elements.modal.classList.remove('hidden');
    
            // Handle form submission
            elements.form.onsubmit = async (e) => {
                e.preventDefault();
    
                try {
                    // Show loading state
                    const submitButton = elements.form.querySelector('button[type="submit"]');
                    const originalButtonText = submitButton.textContent;
                    submitButton.disabled = true;
                    submitButton.textContent = 'Saving...';
    
                    // Get file info
                    const docInfo = getDocumentType(elements.pdfLink.value);
                    let fileSize = 'Unknown';
                    try {
                        const response = await fetch(elements.pdfLink.value, { method: 'HEAD' });
                        const size = response.headers.get('content-length');
                        if (size) {
                            fileSize = formatFileSize(parseInt(size));
                        }
                    } catch (error) {
                        console.warn('Could not detect file size:', error);
                    }
    
                    // Prepare updated book data
                    const updatedBook = {
                        title: elements.title.value,
                        author: elements.authors.value,
                        publicationDate: elements.pubDate.value,
                        isbn: elements.isbn.value,
                        language: elements.language.value,
                        genre: elements.genre.value,
                        fileFormat: docInfo.type,
                        fileSize: fileSize,
                        tags: elements.tags.value.split(',').map(tag => tag.trim()).filter(tag => tag),
                        description: elements.description.value,
                        copyright: elements.copyright.value,
                        drm: elements.drm.value,
                        pdfLink: elements.pdfLink.value,
                        coverUrl: elements.coverUrlInput.value,
                        lastModified: firebase.firestore.FieldValue.serverTimestamp()
                    };
    
                    // Handle cover image upload if needed
                    if (elements.coverUpload.files.length > 0) {
                        const file = elements.coverUpload.files[0];
                        const storageRef = firebase.storage().ref(`book-covers/${bookId}`);
                        const snapshot = await storageRef.put(file);
                        updatedBook.coverUrl = await snapshot.ref.getDownloadURL();
                    }
    
                    // Update book in Firestore
                    await db.collection('books').doc(bookId).update(updatedBook);
    
                    // Show success message
                    alert('Book updated successfully!');
                    elements.modal.classList.add('hidden');
    
                    // Refresh the book list
                    fetchBooks(adminBookListElement, true);
    
                } catch (error) {
                    console.error('Error updating book:', error);
                    alert('Error updating book: ' + error.message);
                } finally {
                    // Reset button state
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent = originalButtonText;
                    }
                }
            };
    
            // Handle close and cancel
            const closeModal = () => {
                elements.modal.classList.add('hidden');
                elements.form.reset();
            };
    
            elements.closeBtn.onclick = closeModal;
            elements.cancelBtn.onclick = closeModal;
    
            // Close on outside click
            elements.modal.onclick = (e) => {
                if (e.target === elements.modal) {
                    closeModal();
                }
            };
    
        } catch (error) {
            console.error('Error in editBook:', error);
            handleError(error, 'editBook');
        }
    }

    // Helper function for date formatting in edit form
    function formatDateForInput(timestamp) {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toISOString().split('T')[0];
    }

    function deleteBook(bookId) {
        if (confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
            db.collection('books').doc(bookId).delete()
                .then(() => {
                    alert('Book deleted successfully!');
                    fetchBooks(adminBookListElement, true);
                })
                .catch((error) => {
                    console.error('Error deleting book:', error);
                    alert('Error deleting book: ' + error.message);
                });
        }
    }

    function formatDate(timestamp) {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString();
    }

    function formatDateForInput(timestamp) {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toISOString().split('T')[0];
    }

    // Search, Bookmarks, Suggestions, Reviews, and System Statistics Functions

    // Add these functions after your element declarations but before any other functionality

    function initializeSearch() {
        if (searchInput && searchButton && searchResultsElement) {
            // Populate genre filter when page loads
            populateGenreFilter();

            // Add event listeners
            searchButton.addEventListener('click', () => {
                const query = searchInput.value.toLowerCase().trim();
                const selectedGenre = document.getElementById('genre-filter')?.value || '';
                searchBooks(query, selectedGenre);
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = searchInput.value.toLowerCase().trim();
                    const selectedGenre = document.getElementById('genre-filter')?.value || '';
                    searchBooks(query, selectedGenre);
                }
            });
        }
    }

    function populateGenreFilter() {
        const genreFilter = document.getElementById('genre-filter');
        if (!genreFilter) return;

        db.collection('books').get().then(snapshot => {
            const genres = new Set();
            snapshot.forEach(doc => {
                const book = doc.data();
                if (book.genre) genres.add(book.genre);
            });

            genreFilter.innerHTML = `
                <option value="">All Genres</option>
                ${Array.from(genres).sort().map(genre => 
                    `<option value="${genre}">${genre}</option>`
                ).join('')}
            `;
        }).catch(error => {
            console.error('Error getting genres:', error);
        });
    }

    function searchBooks(query, selectedGenre = '') {
        if (!searchResultsElement) return;

        searchResultsElement.innerHTML = `
            <div class="text-center py-8">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p class="mt-4 text-gray-600">Searching books...</p>
            </div>
        `;

        db.collection('books').get()
            .then((querySnapshot) => {
                let resultsFound = false;
                const processedBooks = [];

                querySnapshot.forEach((doc) => {
                    const book = doc.data();
                    
                    // Check if book matches search query and genre filter
                    const matchesSearch = query === '' || 
                        (book.title && book.title.toLowerCase().includes(query)) || 
                        (book.author && book.author.toLowerCase().includes(query)) || 
                        (book.genre && book.genre.toLowerCase().includes(query)) ||
                        (book.tags && book.tags.some(tag => tag.toLowerCase().includes(query))) ||
                        (book.description && book.description.toLowerCase().includes(query));

                    const matchesGenre = !selectedGenre || 
                        (book.genre && book.genre === selectedGenre);

                    if (matchesSearch && matchesGenre) {
                        processedBooks.push({ id: doc.id, ...book });
                        resultsFound = true;
                    }
                });

                if (!resultsFound) {
                    searchResultsElement.innerHTML = `
                        <div class="text-center text-gray-600 py-8">
                            No books found matching "${query}"${selectedGenre ? ` in genre "${selectedGenre}"` : ''}
                        </div>
                    `;
                    return;
                }

                // Clear results container
                searchResultsElement.innerHTML = '';

                // Use existing renderBooks function for consistent display
                renderBooks(searchResultsElement, processedBooks, isAdmin);
            })
            .catch((error) => {
                console.error('Error searching books:', error);
                searchResultsElement.innerHTML = `
                    <div class="text-center text-red-600 py-8">
                        Error searching books. Please try again.
                    </div>
                `;
            });
    }

    // Add this line to your existing initialization code
    initializeSearch();

    function fetchBookmarks() {
        bookmarkListElement.innerHTML = ''; // Clear current bookmarks
        db.collection('bookmarks')
            .where('userId', '==', auth.currentUser.uid)
            .get()
            .then((querySnapshot) => {
                if (querySnapshot.empty) {
                    bookmarkListElement.innerHTML = `
                        <div class="text-center text-gray-600 py-8">
                            No bookmarks yet. Start adding books to your bookmarks!
                        </div>
                    `;
                    return;
                }
    
                querySnapshot.forEach((doc) => {
                    const bookmark = doc.data();
                    db.collection('books').doc(bookmark.bookId).get()
                        .then((bookDoc) => {
                            if (bookDoc.exists) {
                                const book = bookDoc.data();
                                
                                // Fetch likes count
                                db.collection('likes')
                                    .where('bookId', '==', bookmark.bookId)
                                    .get()
                                    .then((likesSnapshot) => {
                                        const likesCount = likesSnapshot.size;
    
                                        // Fetch reviews count
                                        db.collection('reviews')
                                            .where('bookId', '==', bookmark.bookId)
                                            .where('status', '==', 'approved')
                                            .get()
                                            .then((reviewsSnapshot) => {
                                                const reviewsCount = reviewsSnapshot.size;
    
                                                const bookmarkItem = document.createElement('div');
                                                bookmarkItem.className = 'bg-white rounded-lg shadow-md overflow-hidden mb-4';
                                                bookmarkItem.innerHTML = `
                                                    <div class="flex">
                                                        <img src="${book.coverUrl}" alt="${book.title} cover" 
                                                            class="w-32 h-48 object-cover">
                                                        <div class="p-4 flex-1">
                                                            <h3 class="text-lg font-semibold mb-2">${book.title}</h3>
                                                            <p class="text-sm text-gray-600 mb-1">by ${book.author}</p>
                                                            <p class="text-sm text-gray-600 mb-2">${book.genre}</p>
                                                            <div class="flex items-center mt-2">
                                                                <span class="mr-2">
                                                                    <svg class="w-5 h-5 text-red-500 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                                    </svg>
                                                                    ${likesCount}
                                                                </span>
                                                                <span>
                                                                    <svg class="w-5 h-5 text-blue-500 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                                                    </svg>
                                                                    ${reviewsCount}
                                                                </span>
                                                            </div>
                                                            <div class="flex space-x-2 mt-4">
                                                                <button class="view-book bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex-1">
                                                                    View Book
                                                                </button>
                                                                <button class="remove-bookmark bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex-1">
                                                                    Remove Bookmark
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                `;
    
                                                bookmarkItem.querySelector('.view-book').addEventListener('click', () => {
                                                    viewBook(bookDoc.id, book);
                                                });
    
                                                bookmarkItem.querySelector('.remove-bookmark').addEventListener('click', () => {
                                                    removeBookmark(doc.id);
                                                });
    
                                                bookmarkListElement.appendChild(bookmarkItem);
                                            })
                                            .catch((error) => {
                                                console.error('Error fetching reviews count:', error);
                                            });
                                    })
                                    .catch((error) => {
                                        console.error('Error fetching likes count:', error);
                                    });
                            }
                        });
                });
            })
            .catch((error) => {
                console.error('Error fetching bookmarks:', error);
                bookmarkListElement.innerHTML = `
                    <div class="text-center text-red-600 py-8">
                        Error loading bookmarks. Please try again.
                    </div>
                `;
            });
    }

    function removeBookmark(bookmarkId) {
        if (confirm('Are you sure you want to remove this bookmark?')) {
            db.collection('bookmarks').doc(bookmarkId).delete()
                .then(() => {
                    fetchBookmarks();
                })
                .catch((error) => {
                    console.error('Error removing bookmark:', error);
                    alert('Error removing bookmark. Please try again.');
                });
        }
    }

    function fetchSuggestions() {
        suggestionStatusElement.innerHTML = ''; // Clear current suggestions
        
        db.collection('suggestions')
            .where('userId', '==', auth.currentUser.uid)
            .orderBy('timestamp', 'desc')
            .get()
            .then((querySnapshot) => {
                if (querySnapshot.empty) {
                    suggestionStatusElement.innerHTML = `
                        <div class="text-center text-gray-600 py-4">
                            No suggestions submitted yet.
                        </div>
                    `;
                    return;
                }
    
                querySnapshot.forEach((doc) => {
                    const suggestion = doc.data();
                    
                    // Check if the suggested book exists in the library
                    db.collection('books')
                        .where('title', '==', suggestion.title)
                        .where('author', '==', suggestion.author)
                        .get()
                        .then((bookSnapshot) => {
                            let likesCount = 0;
                            let reviewsCount = 0;
    
                            // If book exists, fetch likes and reviews
                            if (!bookSnapshot.empty) {
                                const bookId = bookSnapshot.docs[0].id;
    
                                // Fetch likes count
                                db.collection('likes')
                                    .where('bookId', '==', bookId)
                                    .get()
                                    .then((likesResult) => {
                                        likesCount = likesResult.size;
    
                                        // Fetch reviews count
                                        db.collection('reviews')
                                            .where('bookId', '==', bookId)
                                            .where('status', '==', 'approved')
                                            .get()
                                            .then((reviewsResult) => {
                                                reviewsCount = reviewsResult.size;
    
                                                const suggestionItem = document.createElement('div');
                                                suggestionItem.className = 'bg-white rounded-lg shadow-md p-4 mb-4';
                                                suggestionItem.innerHTML = `
                                                    <div class="flex justify-between items-center mb-2">
                                                        <div>
                                                            <h3 class="font-semibold">${suggestion.title}</h3>
                                                            <p class="text-sm text-gray-600 mb-1">by ${suggestion.author}</p>
                                                        </div>
                                                        <div class="flex items-center">
                                                            <span class="mr-2">
                                                                <svg class="w-5 h-5 text-red-500 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                                </svg>
                                                                ${likesCount}
                                                            </span>
                                                            <span>
                                                                <svg class="w-5 h-5 text-blue-500 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                                                </svg>
                                                                ${reviewsCount}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p class="text-sm mb-2">${suggestion.description}</p>
                                                    <div class="flex justify-between items-center">
                                                        <span class="text-sm ${suggestion.status === 'Pending' ? 'text-yellow-600' : 
                                                                              suggestion.status === 'Approved' ? 'text-green-600' : 'text-red-600'}">
                                                            Status: ${suggestion.status}
                                                        </span>
                                                        <span class="text-sm text-gray-500">
                                                            ${formatDate(suggestion.timestamp)}
                                                        </span>
                                                    </div>
                                                `;
                                                suggestionStatusElement.appendChild(suggestionItem);
                                            })
                                            .catch((error) => {
                                                console.error('Error fetching reviews count:', error);
                                            });
                                    })
                                    .catch((error) => {
                                        console.error('Error fetching likes count:', error);
                                    });
                            } else {
                                // Book not in library
                                const suggestionItem = document.createElement('div');
                                suggestionItem.className = 'bg-white rounded-lg shadow-md p-4 mb-4';
                                suggestionItem.innerHTML = `
                                    <h3 class="font-semibold">${suggestion.title}</h3>
                                    <p class="text-sm text-gray-600 mb-1">by ${suggestion.author}</p>
                                    <p class="text-sm mb-2">${suggestion.description}</p>
                                    <div class="flex justify-between items-center">
                                        <span class="text-sm ${suggestion.status === 'Pending' ? 'text-yellow-600' : 
                                                              suggestion.status === 'Approved' ? 'text-green-600' : 'text-red-600'}">
                                            Status: ${suggestion.status}
                                        </span>
                                        <span class="text-sm text-gray-500">
                                            ${formatDate(suggestion.timestamp)}
                                        </span>
                                    </div>
                                `;
                                suggestionStatusElement.appendChild(suggestionItem);
                            }
                        })
                        .catch((error) => {
                            console.error('Error checking book existence:', error);
                        });
                });
            })
            .catch((error) => {
                console.error('Error fetching suggestions:', error);
                suggestionStatusElement.innerHTML = `
                    <div class="text-center text-red-600 py-4">
                        Error loading suggestions. Please try again.
                    </div>
                `;
            });
    }

    function fetchReviews() {
        const reviewListElement = document.getElementById('review-list');
        if (!reviewListElement) return; // Skip if element doesn't exist
    
        reviewListElement.innerHTML = ''; // Clear current reviews
        
        db.collection('reviews')
            .orderBy('timestamp', 'desc')
            .get()
            .then((querySnapshot) => {
                if (querySnapshot.empty) {
                    reviewListElement.innerHTML = `
                        <div class="text-center text-gray-600 py-4">
                            No reviews to moderate.
                        </div>
                    `;
                    return;
                }
    
                querySnapshot.forEach((doc) => {
                    const review = doc.data();
                    
                    // Fetch book details for context
                    db.collection('books').doc(review.bookId).get()
                        .then((bookDoc) => {
                            const book = bookDoc.exists ? bookDoc.data() : null;
    
                            const reviewItem = document.createElement('div');
                            reviewItem.className = 'bg-white rounded-lg shadow-md p-4 mb-4';
                            reviewItem.innerHTML = `
                                <div class="flex justify-between items-center mb-2">
                                    <div>
                                        <h4 class="font-semibold">${review.userName}</h4>
                                        <p class="text-sm text-gray-600">
                                            Reviewed: ${book ? book.title : 'Book Deleted'}
                                        </p>
                                    </div>
                                    <div class="text-yellow-500">
                                        ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                                    </div>
                                </div>
                                <p class="mb-2">${review.reviewText}</p>
                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-gray-500">
                                        ${new Date(review.timestamp.toDate()).toLocaleString()}
                                    </span>
                                    <span class="text-sm ${
                                        review.status === 'pending' ? 'text-yellow-600' : 
                                        review.status === 'approved' ? 'text-green-600' : 'text-red-600'
                                    }">
                                        Status: ${review.status}
                                    </span>
                                </div>
                                <div class="flex space-x-2 mt-3">
                                    ${review.status === 'pending' ? `
                                        <button class="approve-review bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex-1">
                                            Approve
                                        </button>
                                    ` : ''}
                                    <button class="delete-review bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex-1">
                                        Delete
                                    </button>
                                </div>
                            `;
    
                            // Approve review handler
                            const approveBtn = reviewItem.querySelector('.approve-review');
                            if (approveBtn) {
                                approveBtn.addEventListener('click', () => {
                                    db.collection('reviews').doc(doc.id).update({
                                        status: 'approved'
                                    }).then(() => {
                                        fetchReviews(); // Refresh reviews
                                    }).catch((error) => {
                                        console.error('Error approving review:', error);
                                    });
                                });
                            }
    
                            // Delete review handler
                            const deleteBtn = reviewItem.querySelector('.delete-review');
                            deleteBtn.addEventListener('click', () => {
                                if (confirm('Are you sure you want to delete this review?')) {
                                    db.collection('reviews').doc(doc.id).delete()
                                        .then(() => {
                                            fetchReviews(); // Refresh reviews
                                        })
                                        .catch((error) => {
                                            console.error('Error deleting review:', error);
                                        });
                                }
                            });
    
                            reviewListElement.appendChild(reviewItem);
                        })
                        .catch((error) => {
                            console.error('Error fetching book details:', error);
                        });
                });
            })
            .catch((error) => {
                console.error('Error fetching reviews:', error);
                reviewListElement.innerHTML = `
                    <div class="text-center text-red-600 py-4">
                        Error loading reviews. Please try again.
                    </div>
                `;
            });
    }

    function fetchSystemStatistics() {
        Promise.all([
            db.collection('users').get(),
            db.collection('books').get(),
            db.collection('bookmarks').get(),
            db.collection('suggestions').get()
        ]).then(([users, books, bookmarks, suggestions]) => {
            const stats = {
                totalUsers: users.size,
                totalBooks: books.size,
                totalBookmarks: bookmarks.size,
                totalSuggestions: suggestions.size,
                totalDownloads: 0,
                totalViews: 0
            };

            // Calculate total downloads and views
            books.forEach(doc => {
                const book = doc.data();
                stats.totalDownloads += book.downloadCount || 0;
                stats.totalViews += book.viewCount || 0;
            });

            // Update statistics display
            userReportsElement.innerHTML = `
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div class="bg-white p-4 rounded-lg shadow">
                        <h3 class="text-lg font-semibold mb-2">Total Users</h3>
                        <p class="text-2xl text-blue-600">${stats.totalUsers}</p>
                    </div>
                    <div class="bg-white p-4 rounded-lg shadow">
                        <h3 class="text-lg font-semibold mb-2">Total Books</h3>
                        <p class="text-2xl text-blue-600">${stats.totalBooks}</p>
                    </div>
                    <div class="bg-white p-4 rounded-lg shadow">
                        <h3 class="text-lg font-semibold mb-2">Total Downloads</h3>
                        <p class="text-2xl text-blue-600">${stats.totalDownloads}</p>
                    </div>
                    <div class="bg-white p-4 rounded-lg shadow">
                        <h3 class="text-lg font-semibold mb-2">Total Views</h3>
                        <p class="text-2xl text-blue-600">${stats.totalViews}</p>
                    </div>
                    <div class="bg-white p-4 rounded-lg shadow">
                        <h3 class="text-lg font-semibold mb-2">Total Bookmarks</h3>
                        <p class="text-2xl text-blue-600">${stats.totalBookmarks}</p>
                    </div>
                    <div class="bg-white p-4 rounded-lg shadow">
                        <h3 class="text-lg font-semibold mb-2">Total Suggestions</h3>
                        <p class="text-2xl text-blue-600">${stats.totalSuggestions}</p>
                    </div>
                </div>
            `;
        }).catch((error) => {
            console.error('Error fetching statistics:', error);
            userReportsElement.innerHTML = `
                <div class="text-center text-red-600 py-4">
                    Error loading statistics. Please try again.
                </div>
            `;
        });
    }

    // Logout functionality
    document.getElementById('logout').addEventListener('click', () => {
        auth.signOut().then(() => {
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error('Error logging out:', error);
            alert('Error logging out. Please try again.');
        });
    });
});