$(document).ready(function () {
    // Initial check for user login status
    let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    let registeredUser;
    let currentPage = 1;
    const itemsPerPage = 12;
    const booksPerPage = 12; // Number of items per page
    let allBooks = [];
    updateNavbar();
    getCurrentUserId();
    let port = "7127";

    // Function to populate form with current user info
    function populateProfileForm() {
        $('#editName').val(loggedInUser.name);
        $('#editEmail').val(loggedInUser.email);
        $('#editPassword').val(''); // Clear the password field
        $('#currentPassword').val(''); // Clear the current password field
        $('#editImage').val(loggedInUser.image);
    }

    // Open profile edit modal
    $('#userImage, #hiUser').click(function () {
        populateProfileForm(); // Populate form with current user info
        $('#profileEditModal').show();
    });

    // Close profile edit modal
    $('.close').click(function () {
        $('#profileEditModal').hide();
    });

    // Handle profile edit form submission
    $('#profileEditForm').submit(function (event) {
        event.preventDefault();

        var name = $('#editName').val();
        var email = $('#editEmail').val();
        var password = $('#editPassword').val();
        var currentPassword = $('#currentPassword').val();
        var image = $('#editImage').val();
        var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!email) {
            email = loggedInUser.email;
        }
        if (!password) {
            password = loggedInUser.password;
        }
        if (!image) {
            image = loggedInUser.image;
        }
        if (!name) {
            name = loggedInUser.name;
        }
        if (!email.match(emailPattern)) {
            $("#registerEmail").before('<div class="error-message">Email must be valid, Format: X@X.XX.</div>');
            isValid = false;
        }
        if (password.length < 3) {
            $("#registerPassword").before('<div class="error-message">Password must be at least 3 characters.</div>');
            isValid = false;
        }

        // Validate current password if email or password is being changed
        if ((email !== loggedInUser.email || password) && !currentPassword) {
            alert("Current password is required to update email or password.");
            return;
        }

        if (currentPassword !== loggedInUser.password) {
            alert("Current password inserted is wrong! ");
            return;
        }

        let updatedUser = {
            id: loggedInUser.id,
            name: name,
            email: email,
            password: password,
            image: image,
            isAdmin: loggedInUser.isAdmin,
            isActive: loggedInUser.isActive
        };

        let imageFile = $('#profileImageUpload')[0].files[0];
        let formData = new FormData();

        // Append each property of updated Book individually
        for (let key in updatedUser) {
            formData.append(key, updatedUser[key]);
        }

        // Append image file if it exists
        if (imageFile) {
            formData.append('files', imageFile);
        }

        $.ajax({
            //url: `https://localhost:${port}/api/User/UpdateUser`,
            url: `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/UpdateUser`,
            type: 'PUT',
            processData: false,
            contentType: false,
            data: formData,
            success: function (response) {
                alert("Profile updated successfully.");
                $('#profileEditModal').hide();
                // Fetch updated user data and update the navbar
                getUser(loggedInUser.id).then(user => {
                    $('#hiUser').text(user.name);
                    $('#userImage').attr('src', user.image)
                    loggedInUser.id = user.id;;
                    loggedInUser.name = user.name;
                    loggedInUser.email = user.email;
                    loggedInUser.password = user.password;
                    loggedInUser.image = user.image;
                    loggedInUser.isAdmin = user.isAdmin;
                    loggedInUser.isActive = user.isActive;
                    localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));

                    // Assuming updateNavbar is a function to refresh or update the navbar
                    updateNavbar();
                }).catch(error => {
                    console.error('Error fetching updated user data:', error);
                });
            },
            error: function (err) {
                console.log("Error updating profile:", err);
                alert("There was an error updating the profile. Please try again.");
            }
        });
    });

    function getUser(userId) {
        return $.ajax({
            //url: `https://localhost:7127/api/User/GetUserByID/${userId}`,
            url: `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/GetUserByID/${userId}`,
            method: 'GET',
            dataType: 'json'
        }).then(response => {
            return response; // Return the user data from the response
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.error('Failed to fetch user:', textStatus, errorThrown);
            throw new Error('Failed to fetch user'); // Optionally, throw an error to handle it elsewhere
        });
    }


    // Close modal when clicking outside of it
    $(window).click(function (event) {
        if ($(event.target).is('#profileEditModal')) {
            $('#profileEditModal').hide();
        }
    });

    const filterButton = $('#filter-button');
    const filterButtons = $('.filter-buttons');

    filterButton.click(function () {
        filterButtons.toggle();
        $('#price-options').hide();
        $('#page-options').hide();
        $('#publish-options').hide(); 
    });

    // Toggle visibility of high/low options for price
    $('#sort-price').click(function () {
        $('#price-options').toggle();
        $('#page-options').hide(); // Ensure other options are hidden
        $('#publish-options').hide(); // Ensure other options are hidden
    });

    // Toggle visibility of high/low options for page count
    $('#sort-page-count').click(function () {
        $('#page-options').toggle();
        $('#price-options').hide(); // Ensure other options are hidden
        $('#publish-options').hide(); // Ensure other options are hidden
    });

    // Toggle visibility of high/low options for publish date
    $('#sort-publish-date').click(function () {
        $('#publish-options').toggle();
        $('#price-options').hide(); // Ensure other options are hidden
        $('#page-options').hide(); // Ensure other options are hidden
    });

    $('#high-price').click(function () {
        sortBooksByPrice('desc');
        $('#price-options').hide();
    });

    $('#low-price').click(function () {
        sortBooksByPrice('asc');
        $('#price-options').hide();
    });

    $('#high-page').click(function () {
        sortBooksByPageCount('desc');
        $('#page-options').hide();
    });

    $('#low-page').click(function () {
        sortBooksByPageCount('asc');
        $('#page-options').hide();
    });

    $('#high-publish').click(function () {
        sortBooksByPublishDate('desc');
        $('#publish-options').hide();
    });

    $('#low-publish').click(function () {
        sortBooksByPublishDate('asc');
        $('#publish-options').hide();
    });

    $('#show-online-books').click(function () {
        filterBooksByDigital(true);
    });

    $('#show-physical-books').click(function () {
        filterBooksByDigital(false);
    });

    function sortBooksByPrice(order) {
        allBooks.sort((a, b) => {
            return order === 'asc' ? a.price - b.price : b.price - a.price;
        });
        renderBooks();
    }

    function sortBooksByPageCount(order) {
        allBooks.sort((a, b) => {
            return order === 'asc' ? a.pageCount - b.pageCount : b.pageCount - a.pageCount;
        });
        renderBooks();
    }

    function sortBooksByPublishDate(order) {
        allBooks.sort((a, b) => {
            return order === 'asc' ? new Date(a.publishDate) - new Date(b.publishDate) : new Date(b.publishDate) - new Date(a.publishDate);
        });
        renderBooks();
    }

    function filterBooksByDigital(isDigital) {
        const filteredBooks = allBooks.filter(book => book.isDigital === isDigital);
        renderBooks(filteredBooks);
    }

    // Event listener for search button
    $('#search-button').click(function () {
        const query = $('#search-input').val().toLowerCase();
        searchBooks(query);
    });

    // Event listener for reset button
    $('#reset-button').click(function () {
        $('#search-input').val(''); // Clear the search input
        searchCriteria.val('any');
        fetchBooksFromServer(); // Fetch and display all books
    });

    // Event listeners for pagination controls
    $('#prev-page').click(function () {
        if (currentPage > 1) {
            currentPage--;
            renderBooks();
        }
    });

    $('#next-page').click(function () {
        const totalPages = Math.ceil(allBooks.length / booksPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderBooks();
        }
    });

    // Event listener for modal close
    $(document).on('click', '.close', function () {
        $('#bookDetailsModal').hide();
    });

    // Event listener for showing book details
    $(document).on('click', '.see-details', function () {
        const bookData = $(this).data('book');
        showBookDetails(bookData);
    });

    // Call the function to fetch and render top books when the page loads
    fetchAndRenderTopBooks();
    // Fetch books data from the server
    fetchBooksFromServer();

    const searchInput = $('#search-input');
    const searchButton = $('#search-button');
    const micButton = $('#mic-button');
    const searchCriteria = $('#search-criteria');

    micButton.click(async function () {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
                let audioChunks = [];

                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    console.log('Audio Blob:', audioBlob);

                    try {
                        // Convert Blob to ArrayBuffer
                        const arrayBuffer = await audioBlob.arrayBuffer();

                        // Send audio data to the Hugging Face API
                        const response = await fetch("https://api-inference.huggingface.co/models/facebook/wav2vec2-base-960h", {
                            headers: {
                                Authorization: "Bearer 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",
                                "Content-Type": "application/octet-stream",
                            },
                            method: "POST",
                            body: arrayBuffer,
                        });

                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }

                        const result = await response.json();
                        console.log('API Response:', result);
                        const text = result.text || '';

                        // Clean and normalize text
                        const cleanText = text.trim().replace(/\s+/g, ' ');
                        searchInput.val(cleanText); // Update the search input with the recognized text
                    } catch (error) {
                        console.error('Error sending audio to Hugging Face API:', error);
                    }
                };

                mediaRecorder.start();
                setTimeout(() => {
                    mediaRecorder.stop();
                    stream.getTracks().forEach(track => track.stop());
                }, 3000); // Recording time of 3 seconds
            } catch (error) {
                console.error('Error accessing microphone:', error);
            }
        } else {
            console.error('getUserMedia not supported on your browser.');
        }
    });

    // Search functionality
    searchButton.click(function () {
        const query = searchInput.val().toLowerCase();
        const criteria = searchCriteria.val();

        if (criteria === 'title') {
            searchBooksByName(query);
        } else if (criteria === 'author') {
            searchBooksByAuthor(query);
        } else if (criteria === 'description') {
            searchBooksByWords(query);
        } else {
            searchBooks(query);
        }
    });

    // Function to search books based on query
    function searchBooks(query) {
        console.log('Searching by Any parameter:', query);
        if (!query) {
            fetchBooksFromServer(); // Reset to all books if query is empty
            return;
        }
        const filteredBooks = allBooks.filter(book => {
            return (
                (book.name && book.name.toLowerCase().includes(query)) ||
                (book.authorName && book.authorName.toLowerCase().includes(query)) ||
                (book.categories && book.categories.toLowerCase().includes(query)) ||
                (book.language && book.language.toLowerCase().includes(query)) ||
                (book.description && book.description.toLowerCase().includes(query))
            );
        });

        allBooks = filteredBooks;
        currentPage = 1; // Reset to page 1 after filtering
        renderBooks();
    }

    function searchBooksByName(query) {
        console.log('Searching by Title:', query);
        if (!query) {
            fetchBooksFromServer(); // Reset to all books if query is empty
            return;
        }
        const filteredBooks = allBooks.filter(book => {
            return (
                (book.name && book.name.toLowerCase().includes(query)) 
            );
        });

        allBooks = filteredBooks;
        currentPage = 1; // Reset to page 1 after filtering
        renderBooks();
    }

    function searchBooksByAuthor(query) {
        console.log('Searching by Author:', query);
        if (!query) {
            fetchBooksFromServer(); // Reset to all books if query is empty
            return;
        }
        const filteredBooks = allBooks.filter(book => {
            return (
                (book.authorName && book.authorName.toLowerCase().includes(query)) 
            );
        });

        allBooks = filteredBooks;
        currentPage = 1; // Reset to page 1 after filtering
        renderBooks();
    }
    
    function searchBooksByWords(query) {
        console.log('Searching by Books Words:', query);
        if (!query) {
            fetchBooksFromServer(); // Reset to all books if query is empty
            return;
        }
        const filteredBooks = allBooks.filter(book => {
            return (
                (book.description && book.description.toLowerCase().includes(query))
            );
        });

        allBooks = filteredBooks;
        currentPage = 1; // Reset to page 1 after filtering
        renderBooks();
    }


    // Function to fetch and render top 5 books
    function fetchAndRenderTopBooks() {
        $.ajax({
            type: "GET",
            //url: `https://localhost:${port}/api/Book/top3onlinebooks`,
            url: `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Book/top3onlinebooks`,
            success: function (books) {
                $("#top-book-list").empty(); // Clear previous content

                // Add the title for top books
                $("#top-book-list").append('<h2>Top 3 Online Books for Today!</h2>');

                // Iterate through each book and append its HTML
                books.forEach(function (book) {
                    if (book.isActive) {
                        let bookData = {
                            Id: book.id,
                            Name: book.name,
                            AuthorName: book.authorName,
                            PublishDate: book.publishDate,
                            PageCount: book.pageCount,
                            Categories: book.categories,
                            Language: book.language,
                            Image: book.image,
                            Description: book.description,
                            WebReaderLink: book.webReaderLink,
                            Price: book.price,
                            Rating: book.rating,
                            IsDigital: book.isDigital,
                            IsActive: book.isActive,
                            IsOwned: book.isOwned
                        };

                        var bookHtml = `
                        <div class="book">
                            <h2>${book.name}</h2>
                            <h4>
                                ${book.isDigital ? 'Online book' : `Physical book | ${book.isOwned ? 'Owned' : 'Available'}`}
                            </h4>
                            ${book.authorName ? `<h4>Author Name: ${book.authorName}</h4>` : ''}
                            ${book.language ? `<h4>Language: ${book.language}</h4>` : ''}
                            ${book.categories ? `<h4>Categories: ${book.categories}</h4>` : ''}
                            <h4>Price: ${book.price}₪</h4>
                            <h4>Rating: ${book.rating}</h4>
                            ${!book.isDigital && book.isOwned
                                ? `<button class="ask-owner" data-book='${JSON.stringify(bookData)}'>Ask owner for the book</button><br/>`
                                : `<button class="add-book" data-book='${JSON.stringify(bookData)}'>Add book</button><br/>`
                            }
                                <button class="see-details" data-book='${JSON.stringify(bookData)}'>See Details</button><br/>
                            <img src="${book.image}" alt="${book.name}">
                        </div>
                    `;
                        $("#top-book-list").append(bookHtml);
                    }
                });
            },
            error: function (err) {
                console.error("Error fetching top books:", err);
            }
        });
    }

    $(document).on("click", ".ask-owner", function () {
        if (loggedInUser && loggedInUser.isActive) {
            let bookData = JSON.parse($(this).attr("data-book"));
            let bookId = bookData.Id;

            // AJAX call to get the book owner
            $.ajax({
                type: "GET",
                //url: `https://localhost:7127/api/Book/getBookOwner/${bookId}`,
                url: `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Book/getBookOwner/${bookId}`,
                success: function (owner) {
                    if (owner == null) {
                        alert("The user did not finish reading the book yet.");
                    } else {
                        let ownerName = owner.name;
                        let askerId = getCurrentUserId(); // Replace this with the actual method to get the current user's ID
                        let ownerId = owner.id;
                        if (askerId != ownerId) {
                            if (confirm(`Do you want to send a book request to ${ownerName}?`)) {
                                // Prompt the user to enter a message
                                let message = prompt("Enter a message to send with your request:");

                                // AJAX call to send the book request
                                $.ajax({
                                    type: "POST",
                                    //url: `https://localhost:${port}/api/User/addBookRequest?askerId=${askerId}&ownerId=${ownerId}&bookId=${bookId}&message=${message}`,
                                    url: `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/addBookRequest?askerId=${askerId}&ownerId=${ownerId}&bookId=${bookId}&message=${message}`,
                                    data: {
                                        askerId: askerId,
                                        ownerId: ownerId,
                                        bookId: bookId,
                                        message: message
                                    },
                                    success: function () {
                                        alert("Book request sent successfully!");
                                    },
                                    error: function (err) {
                                        console.error("Error sending book request:", err);
                                        alert("Failed to send the book request. You already sent a request.");
                                    }
                                });
                            }
                        }
                        else {
                            alert("You own this book");
                        }
                    }
                },
                error: function (err) {
                    console.error("Error fetching book owner:", err);
                    alert("Failed to retrieve the book owner. Please try again.");
                }
            });
        }
        else {
            alert("You are not signed in! Sign in or register now");
            openLoginModal(); // Open login modal if the user is not logged in
        }
    });


    // Function to show book details in the modal
    function showBookDetails(book) {
        let bookHtml = `
        <h2>ID: ${book.Id || ' '}</h2>
        <h4>Name: ${book.Name || ' '}</h4>
        <h4>Author: ${book.AuthorName || ' '}</h4>
        <h4>Publish Date: ${book.PublishDate || ' '}</h4>
        <h4>Page Count: ${book.PageCount || ' '}</h4>
        <h4>Categories: ${book.Categories || ' '}</h4>
        <h4>Language: ${book.Language || ' '}</h4>
        <h4>Price: ${book.Price || ' '}${book.Price ? '₪' : ''}</h4>
        <h4>Rating: ${book.Rating || ' '}</h4>
        <h4>Description: ${book.Description || ' '}</h4>
        <h4>Digital: ${book.IsDigital ? 'Yes' : 'No'}</h4>
        <h4>Active: ${book.IsActive ? 'Yes' : 'No'}</h4>
        ${book.IsDigital ? '' : `<h4>Owned: ${book.IsOwned ? 'Yes' : 'No'}</h4>`}
        <img src="${book.Image || ''}" alt="${book.Name || ' '}" style="max-width: 100%; height: auto;">
    `;
        $('#bookDetailsContent').html(bookHtml);
        $('#bookDetailsModal').show();
    }


    // Function to fetch Active Books from the server
    function fetchBooksFromServer() {
        $.ajax({
            //url: `https://localhost:${port}/api/Book/GetAllBooks`,
            url: `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Book/GetAllBooks`,
            type: 'GET',
            success: function (booksData) {
                allBooks = booksData.filter(book => book.isActive);
                currentPage = 1; // Reset to page 1 when new data is fetched
                renderBooks();
            },
            error: function (err) {
                console.log("Error fetching Books:", err);
            }
        });
    }

    // Function to render each book
    function renderBook(book, containerSelector = '#book-list') {
        if (book.isActive) {
            let bookData = {
                Id: book.id,
                Name: book.name,
                AuthorName: book.authorName,
                PublishDate: book.publishDate,
                PageCount: book.pageCount,
                Categories: book.categories,
                Language: book.language,
                Image: book.image,
                Description: book.description,
                WebReaderLink: book.webReaderLink,
                Price: book.price,
                Rating: book.rating,
                IsDigital: book.isDigital,
                IsActive: book.isActive,
                IsOwned: book.isOwned
            };

            var bookHtml = `
                <div class="book">
                    <h2>${book.name}</h2>
                    <h4>${book.isDigital ? 'Online book' : `Physical book | ${book.isOwned ? 'Owned' : 'Available'}`}</h4>
                    ${book.authorName ? `<h4>Author Name: ${book.authorName}</h4>` : ''}
                    ${book.language ? `<h4>Language: ${book.language}</h4>` : ''}
                    ${book.categories ? `<h4>Categories: ${book.categories}</h4>` : ''}
                    <h4>Price: ${book.price}₪</h4>
                    <h4>Rating: ${book.rating}</h4>
                    ${!book.isDigital && book.isOwned ? `<button class="ask-owner" data-book='${JSON.stringify(bookData)}'>Ask owner for the book</button><br/>` : `<button class="add-book" data-book='${JSON.stringify(bookData)}'>Add book</button><br/>`}
                                <button class="see-details" data-book='${JSON.stringify(bookData)}'>See Details</button><br/>
                    <img src="${book.image}" alt="${book.name}">
                </div>
            `;
            $(containerSelector).append(bookHtml);
        }
    }

    // Function to render books based on current page
    function renderBooks(books = allBooks) {
        $('#book-list').empty();
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const currentBooks = books.slice(start, end);

        currentBooks.forEach(book => {
            renderBook(book);
        });

        updatePaginationControls(books.length);
    }

    // Function to render each book
    async function renderBook(book) {
        if (book.isActive) {
            let bookData = {
                Id: book.id,
                Name: book.name,
                AuthorName: book.authorName,
                PublishDate: book.publishDate,
                PageCount: book.pageCount,
                Categories: book.categories,
                Language: book.language,
                Image: book.image,
                Description: book.description,
                Price: book.price,
                Rating: book.rating,
                IsDigital: book.isDigital,
                IsActive: book.isActive,
                IsOwned: book.isOwned
            };

            var bookHtml = `
    <div class="book">
        <h2>${book.name}</h2>
        <h4>
            ${book.isDigital
                    ? 'Online book'
                    : `Physical book | ${book.isOwned ? 'Owned' : 'Available'}`
            }
        </h4>
        ${book.authorName ? `<h4>Author Name: ${book.authorName}</h4>` : ''}
        ${book.language ? `<h4>Language: ${book.language}</h4>` : ''}
        ${book.categories ? `<h4>Categories: ${book.categories}</h4>` : ''}
        <h4>Price: ${book.price}₪</h4>
        <h4>Rating: ${book.rating}</h4>
        ${book.authorName
                    ? `<button class="show-more-books" data-author-id="${book.authorName}">Show more Books of this Author</button><br/>`
                    : '<h4>This book does not have an Author name</h4>'
                }        
        ${
                !book.isDigital && book.isOwned
                    ? `<button class="ask-owner" data-book='${JSON.stringify(bookData)}'>Ask owner for the book</button><br/>`
                : `<button class="add-book" data-book='${JSON.stringify(bookData)}'>Add book</button><br/>`
        }
                                <button class="see-details" data-book='${JSON.stringify(bookData)}'>See Details</button><br/>
        <img src="${book.image}" alt="${book.name}">
    </div>
`;
            $("#book-list").append(bookHtml);

        }     
    }

    // Function to update pagination controls
    function updatePaginationControls() {
        const totalPages = Math.ceil(allBooks.length / itemsPerPage);
        $("#pagination-controls #current-page").text(`Page ${currentPage} of ${totalPages}`);
        $("#prev-page").prop("disabled", currentPage === 1);
        $("#next-page").prop("disabled", currentPage === totalPages);
    }

    // Event delegation for dynamically added content
    $('#book-list').on('click', '.show-more-books', function () {
        let authorId = $(this).data('author-id');

        // Call function to fetch author books and display modal
        openAuthorBooksModal(authorId);
    });

    // Function to fetch and display author books in a modal
    function openAuthorBooksModal(authorId) {
        // Clear the form completely
        $('#authorBooksForm').empty();

        // Set modal title with author's name
        let modalTitle = `<h1>More Books by Author ${authorId}:</h1><br>`;
        $('#authorBooksForm').append(modalTitle);

        // AJAX request to fetch author books
        $.ajax({
            type: 'GET',
            url: `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Author/GetBooksByAuthor/${authorId}`,
            //url: `https://localhost:${port}/api/Author/GetBooksByAuthor/${authorId}`,
            success: function (books) {
                // Clear the form again to make sure there's no duplication
                $('#authorBooksForm').find('.book').remove();

                // Populate books in modal body
                books.forEach(function (book) {
                    if (book.isActive) {
                        let bookData = {
                            Id: book.id,
                            Name: book.name,
                            AuthorName: book.authorName,
                            PublishDate: book.publishDate,
                            PageCount: book.pageCount,
                            Categories: book.categories,
                            Language: book.language,
                            Image: book.image,
                            Description: book.description,
                            WebReaderLink: book.webReaderLink,
                            Price: book.price,
                            Rating: book.rating,
                            IsDigital: book.isDigital,
                            IsActive: book.isActive,
                            IsOwned: book.isOwned
                        };

                        let bookHtml = `
                        <div class="book">
                            <h2>${book.name}</h2>
                            <h4>
                                ${book.isDigital
                                ? 'Online book'
                                : `Physical book | ${book.isOwned ? 'Owned' : 'Available'}`
                            }
                            </h4>
                            ${book.authorName ? `<h4>Author Name: ${book.authorName}</h4>` : ''}
                            ${book.language ? `<h4>Language: ${book.language}</h4>` : ''}
                            ${book.categories ? `<h4>Categories: ${book.categories}</h4>` : ''}
                            <h4>Price: ${book.price}₪</h4>
                            <h4>Rating: ${book.rating}</h4>
                            <img src="${book.image}" alt="${book.name}">
                        </div>
                    `;

                        $('#authorBooksForm').append(bookHtml);
                    }
                });

                // Show the modal
                $('#authorBooksModal').css('display', 'block');
            },
            error: function (err) {
                console.error('Error fetching Author Books:', err);
                // Handle error
            }
        });
    }


    // Close modal function
    $('.modal .close').click(function () {
        $(this).closest('.modal').css('display', 'none');
    });

    // Event delegation for opening modal
    $('#book-list').on('click', '.show-more-books', function () {
        let authorId = $(this).data('author-id');
        openAuthorBooksModal(authorId);
    });

    // Close the modal when the close button or outside modal area is clicked
    $('.close, .modal').on('click', function () {
        $('#authorBooksModal').css('display', 'none');
    });

    // Ensure the modal closes when the user clicks outside of it
    $(window).on('click', function (e) {
        if (e.target == $('#authorBooksModal')[0]) {
            $('#authorBooksModal').css('display', 'none');
        }
    });

    $(document).on("click", ".add-book", function () {
        let bookData = JSON.parse($(this).attr("data-book"));

        if (loggedInUser && loggedInUser.isActive) {
            // Show confirmation dialog
            let confirmationMessage = `Are you sure you want to add this book to your library for ${bookData.Price}₪?`;

            if (confirm(confirmationMessage)) {
                AddBookToUser(getCurrentUserId(), bookData.Id);
            }
        } else {
            alert("You are not signed in! Sign in or register now");
            openLoginModal(); // Open login modal if the user is not logged in
        }
    })


    $(document).on("click", "#adminPage", function () {
        if (loggedInUser && loggedInUser.isActive && loggedInUser.isAdmin) {
            window.location.href = `Admin.html`;
        } else {
            alert("Sign in as an admin to visit this page!");
            openLoginModal(); // Open login modal if the user is not logged in as an admin
        }
    }); 

    $(document).on("click", "#FriendsChatPage", function () {
        if (loggedInUser && loggedInUser.isActive) {
            window.location.href = `FriendsChat.html`;
        } else {
            alert("Sign in to see your Friends and chat with them!");
            openLoginModal(); // Open login modal if the user is not logged in
        }
    });

    $(document).on("click", "#myBooksBtn", function () {
        if (loggedInUser && loggedInUser.isActive) {
            window.location.href = `MyBooks.html`;
        } else {
            alert("Sign in to see your Books!");
            openLoginModal(); // Open login modal if the user is not logged in
        }
    });

    $(document).on("click", "#QuizPage", function () {
        if (loggedInUser && loggedInUser.isActive) {
            window.location.href = `Quiz.html`;
        } else {
            alert("Sign in to see your Quizzes and try them!");
            openLoginModal(); // Open login modal if the user is not logged in
        }
    });

    $(document).on("click", "#bookRequestsPage", function () {
        if (loggedInUser && loggedInUser.isActive) {
            window.location.href = `BookRequests.html`;
        } else {
            alert("Sign in to see your requests!");
            openLoginModal(); // Open login modal if the user is not logged in
        }
    }); 

    $(document).on("click", "#ReviewsPage", function () {
        if (loggedInUser && loggedInUser.isActive) {
            window.location.href = `Reviews.html`;
        } else {
            alert("Sign in to see your requests!");
            openLoginModal(); // Open login modal if the user is not logged in
        }
    });

    function AddBookToUser(userId, bookId) {
        let port = "7127";
        let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/AddBooksToUser/${userId}/${bookId}`;
        //let url = `https://localhost:7127/api/User/AddBooksToUser/${userId}/${bookId}`;
        ajaxCall("POST", url, null, postSCBF, postECBF);
    }

    function postSCBF(result) {
        console.log(result);
        if (result) {
            alert("The Book has been added!");
            fetchAndRenderTopBooks();f
        } else {
            alert("Error: This Book has already been added!");
        }
    }

    function postECBF(err) {
        alert("Error: This Book has already been added!");
        console.log(err);
    }

    // Function to open the login modal
    function openLoginModal() {
        $("#registerFormContainer").hide();
        $("#loginFormContainer").show();
        $("#loginModal").css("display", "block");
    }

    // Function to open the registration modal
    function openRegisterModal() {
        $("#loginFormContainer").hide();
        $("#registerFormContainer").show();
        $("#loginModal").css("display", "block");
    }

    // Get the modal
    var modal = document.getElementById("loginModal");

    // Get the button that opens the modal
    var loginBtn = document.getElementById("loginBtn");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks the login button, open the login modal
    loginBtn.onclick = openLoginModal;

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Toggle between login and registration forms
    $("#showRegisterForm").click(openRegisterModal);
    $("#showLoginForm").click(openLoginModal);

    // Validate forms
    $("#loginForm").submit(function (event) {
        event.preventDefault();
        var email = $("#loginEmail").val();
        var password = $("#loginPassword").val();
        var user = {
            Email: email,
            Password: password
        }
        if (email && password.length >= 3) {
            loginToServer(user);
        } else {
            alert("All fields are mandatory and password must be at least 3 characters.");
        }
    });

    $("#registerForm").submit(function (event) {
        event.preventDefault(); // Prevent form submission from reloading the page

        // Clear existing error messages
        $(".error-message").remove();

        var name = $("#registerName").val();
        var id = $("#registerId").val();
        var email = $("#registerEmail").val();
        var password = $("#registerPassword").val();
        var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        var user = {
            Name: name,
            Id: id,
            Email: email,
            Password: password,
            Image: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
            IsActive: true,
            IsAdmin : false
        };

        var isValid = true;

        if (!name) {
            $("#registerName").before('<div class="error-message">Name is required and must be at least 7 letters.</div>');
            isValid = false;
        }
        if (!email.match(emailPattern)) {
            $("#registerEmail").before('<div class="error-message">Email must be valid, Format: X@X.XX.</div>');
            isValid = false;
        }
        if (password.length < 3) {
            $("#registerPassword").before('<div class="error-message">Password must be at least 3 characters.</div>');
            isValid = false;
        }
        if (id.length != 9 || !/^\d+$/.test(id)) {
            $("#registerId").before('<div class="error-message">Id must be 9 numbers.</div>');
            isValid = false;
        }

        if (isValid) {
            registerToServer(user);
        }
    });

    function registerToServer(user) {
        let port = "7127";
        //let url = `https://localhost:${port}/api/User/register`;
        let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/register`;
        registeredUser = user;

        ajaxCall("POST", url, JSON.stringify(user), registerSCBF, registerECBF);
    }

    function registerSCBF(result) {
        console.log(result);
        if (result) {
            alert("The user has been registered successfully");
            loginToServer(registeredUser);
            alert(`Important! hey ${loggedInUser.name}, You can edit your profile by clicking on your prfile picture or on your name in the main page nav bar.`);
        }
    }

    function registerECBF(err) {
        console.log(err);
        alert("This email is already in use!");
    }

    function loginToServer(user) {
        let port = "7127";
        let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/login?email=${user.Email}&password=${user.Password}`;
        //let url = `https://localhost:${port}/api/User/login?email=${user.Email}&password=${user.Password}`;
        ajaxCall("POST", url, JSON.stringify(user), function (result) {
            if (result && result.user) {
                localStorage.setItem('loggedInUser', JSON.stringify(result.user));
                loggedInUser = result.user;
                updateNavbar();
                location.reload(); // Reload the page after login
            }
        }, function (err) {
            console.log(err);
            alert("The password or email is incorrect!");
        });
    }
    getCurrentUserId();
    function getCurrentUserId() {
        let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (loggedInUser && loggedInUser.id) {
            return loggedInUser.id;
        } else {
            console.log("No user is currently logged in or user ID is undefined.");
            return null;
        }
    }

    // Update navbar based on login status
    function updateNavbar() {
        if (loggedInUser && loggedInUser.isActive) {
            $("#loginBtn").hide(); 
            $("#hiUser").show(); 
            $("#hiUser").text(`Hi ${loggedInUser.name}`);
            $("#bookRequestsPage").show();
            $("#ReviewsPage").show();
            $("#FriendsChatPage").show();
            $("#userImage").show(); // Show the user image
            $("#userImage").attr("src", loggedInUser.image); // Set the image source
            $("#myBooksBtn").show();
            $("#QuizPage").show();
            $("#logoutBtn").show();
            if (loggedInUser.isAdmin) {
                $('#adminPage').show();
            } else {
                $('#adminPage').hide();
            }
        } else {
            $("#loginBtn").show();
            $("#QuizPage").hide();
            $("#FriendsChatPage").hide();
            $("#ReviewsPage").hide();
            $("#bookRequestsPage").hide();
            $("#hiUser").hide();
            $("#userImage").hide(); 
            $("#logoutBtn").hide();
            $("#adminPage").hide();
        }
    }

    // Log out function
    $("#logoutBtn").click(function () {
        let userId = getCurrentUserId();
        if (userId) {
            // Ask for confirmation
            if (confirm("Are you sure you want to logout?")) {
                logoutUser(userId);
            } else {
                // Cancel logout
                console.log("Logout canceled.");
            }
        } else {
            alert("No user is currently logged in.");
        }
    });

    function logoutUser(userId) {
        let port = "7127";
        let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/logout?userId=${userId}`;
        //let url = `https://localhost:${port}/api/User/logout?userId=${userId}`;

        $.ajax({
            type: "POST",
            url: url,
            success: function (response) {
                console.log(response);
                localStorage.removeItem('loggedInUser');
                loggedInUser = null;
                updateNavbar();
                location.reload();
            },
            error: function (err) {
                console.log(err);
                alert("Error logging out. Please try again.");
            }
        });
    }

    // Generic AJAX call function
    function ajaxCall(method, url, data, successCB, errorCB) {
        $.ajax({
            type: method,
            url: url,
            data: data,
            contentType: 'application/json',
            success: successCB,
            error: errorCB
        });
    }
});