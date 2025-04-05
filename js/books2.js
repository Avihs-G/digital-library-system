
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
        const toggleReviews = document.getElementById('toggle-reviews');
        const reviewsContent = document.getElementById('reviews-content');
        if (toggleReviews && reviewsContent) {
            toggleReviews.addEventListener('click', () => {
                const isExpanded = reviewsContent.classList.toggle('hidden');
                const toggleIcon = toggleReviews.querySelector('span:last-child');
                if (toggleIcon) {
                    toggleIcon.textContent = isExpanded ? '+' : '−';
                }
            });
        }
        // Add collapsible reviews functionality - improved version
        try {
            const reviewsSection = document.querySelector('.p-6.border-t');
            if (reviewsSection) {
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
                    // Insert toggle button at the start of reviews section
                    reviewsSection.insertBefore(toggleButton, contentToCollapse);

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
