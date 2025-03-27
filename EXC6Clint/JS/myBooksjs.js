$(document).ready(function () {
    let port = "7127";
    userID = getCurrentUserId();
    updateNavbar();
    //let api = `https://localhost:${port}/api/User/GetAllBooksForUser/${userID}`;
    let api = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/GetAllBooksForUser/${userID}`;
    ajaxCall("GET", api, "", successCallBackFunction, errorCallBackFunction);

    function successCallBackFunction(books) {
        console.log(books);
        $("#readed-books").empty();
        $("#want-to-read-books").empty();
        $("#bought-books").empty();
        $("#bought-empty").empty();
        $("#readed-empty").empty();
        $("#wantToRead-empty").empty();

        let allBooks = books;
        let readedBooks = allBooks.filter(book => book.readed);
        let wantToReadBooks = allBooks.filter(book => book.wantToRead);
        let boughtBooks = allBooks.filter(book => book.bought);

        // Check and display message for want-to-read books
        if (wantToReadBooks.length === 0) {
            $("#wantToRead-empty").append('<h3>You don\'t have books that you want to read.</h3>');
        } else {
            wantToReadBooks.forEach(function (book) {
                renderBook(book, "#want-to-read-books");
            });
        }

        // Check and display message for bought books
        if (readedBooks.length === 0) {
            $("#readed-empty").append('<h3>You don\'t have books that have finished reading.</h3>');
        } else {
            readedBooks.forEach(function (book) {
                renderBook(book, "#readed-books");
            });
        }

        // Check and display message for bought books
        if (boughtBooks.length === 0) {
            $("#bought-empty").append('<h3>You didn\'t buy any books from another user.</h3>');
        } else {
            boughtBooks.forEach(function (book) {
                renderBook(book, "#bought-books");
            });
        }
    }

    function errorCallBackFunction(err) {
        console.error("Error fetching Books: ", err);
        $("#my-books-list").html("<p>Error fetching Books. You dont have any books.</p>");
        alert("You have no Books in you library! Add Books and Enjoy Reading Now.");
    }

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
        if (password.length < 4) {
            $("#registerPassword").before('<div class="error-message">Password must be at least 4 characters.</div>');
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

        // Append each property of updated book individually
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
                    $('#userImage').attr('src', user.image);
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


    function renderBooks(books, sectionId) {
        $(sectionId).empty();
        books.forEach(book => {
            renderBook(book, sectionId);
        });
    }

    // Search functionality
    $('#search-button').on('click', function () {
        const criteria = $('#search-criteria').val();
        const query = $('#search-input').val().toLowerCase();

        // Fetch books again to search through them
        ajaxCall("GET", api, "", function (books) {
            const filteredBooks = books.filter(book => {
                if (criteria === 'any') {
                    return (book.name && book.name.toLowerCase().includes(query)) ||
                        (book.authorName && book.authorName.toLowerCase().includes(query)) ||
                        (book.categories && book.categories.toLowerCase().includes(query)) ||
                        (book.language && book.language.toLowerCase().includes(query)) ||
                        (book.description && book.description.toLowerCase().includes(query))
                }
                if (criteria === 'title') {
                    return book.name.toLowerCase().includes(query);
                }
                if (criteria === 'author') {
                    return book.authorName.toLowerCase().includes(query);
                }
                if (criteria === 'description') {
                    return book.description.toLowerCase().includes(query);
                }
                return false;
            });

            // Update the UI with the filtered results
            let readedBooks = filteredBooks.filter(book => book.readed);
            let wantToReadBooks = filteredBooks.filter(book => book.wantToRead);
            let boughtBooks = filteredBooks.filter(book => book.bought);

            renderBooks(readedBooks, "#readed-books");
            renderBooks(wantToReadBooks, "#want-to-read-books");
            renderBooks(boughtBooks, "#bought-books");
        }, errorCallBackFunction);
    });

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

    // Reset search
    $('#reset-button').on('click', function () {
        $('#search-input').val('');
        $('#search-criteria').val('any');
        ajaxCall("GET", api, "", successCallBackFunction, errorCallBackFunction);
    });


    function getCurrentUserId() {
        let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (loggedInUser && loggedInUser.id) {
            return loggedInUser.id;
        } else {
            console.log("No user is currently logged in or user ID is undefined.");
            return null;
        }
    }

    $(document).on("click", "#adminPage", function () {
        if (loggedInUser && loggedInUser.isActive && loggedInUser.isAdmin) {
            window.location.href = `Admin.html`;
        } else {
            alert("sign in as an admin to visit this page!");
            openLoginModal(); // Open login modal if the user is not logged in as an admin
        }
    });

    // Log out function
    $("#logOutBtn").click(function () {
        localStorage.removeItem('loggedInUser');
        loggedInUser = null;
        updateNavbar();
        window.location.href = "index.html"; // Reload to the main page after logout
    });

    $(document).on("click", "#QuizPage", function () {
        if (loggedInUser && loggedInUser.isActive) {
            window.location.href = `Quiz.html`;
        } else {
            alert("Sign in to see your Quizzes and try them!");
            openLoginModal(); // Open login modal if the user is not logged in
        }
    });

    function errorCallBackFunction(err) {
        console.error("Error fetching Books: ", err);
        $("#my-books-list").html("<p>Error fetching Books. Please try again later.</p>");
    }

    $('#delete-by-id').on('click', function () {
        let bookId = parseInt($('#delete-id').val());
        if (!isNaN(bookId)) {
            deleteBookById(userID,bookId);
        } else {
            alert('Please enter a valid book ID.');
        }
    });

    $(document).on('click', '.delete-book', function () {
        let bookId = $(this).data('id');
        if (confirm('Are you sure you want to delete this Book?')) {
            deleteBookById(userID,bookId);
        }
    });

    function deleteBookById(userId, bookId) {
        let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/RemoveBookFromUser/${userId}/${bookId}`;
        //let url = `https://localhost:${port}/api/User/RemoveBookFromUser/${userId}/${bookId}`;

        ajaxCall("DELETE", url, "", deleteSuccessCallBackFunction, deleteErrorCallBackFunction);
    }

    function deleteSuccessCallBackFunction(response) {
        console.log(response); // Display the response message from the server
        alert("The Book has been deleted seccessfuly");
        ajaxCall("GET", api, "", successCallBackFunction, errorCallBackFunction);
    }

    function deleteErrorCallBackFunction(err) {
        console.log(err);
        alert("The Book with this id has been not found!");
    }

    $(document).on('click', '#reset', function () {
        ajaxCall("GET", api, "", successCallBackFunction, errorCallBackFunction);
    });

    // Function to render each book
    function renderBook(book, sectionId) {
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
                WebReaderLink: book.webReaderLink,
                WantToRead: book.wantToRead,
                Readed: book.readed,
                Bought: book.bought,
                IsDigital: book.isDigital,
                IsActive: book.isActive
            };

            var readedChecked = book.readed ? "checked" : "";

            var bookHtml = `
        <div class="book">
            <h2>${book.name}</h2>
            <h4>
                ${book.isDigital ? 'Online book' : `Physical book | ${book.isOwned ? 'Owned' : 'Available'}`}
            </h4>
            <h4>ID: ${book.id}</h4>
            ${book.authorName ? `<h4>Author Name: ${book.authorName}</h4>` : ''}
            ${book.language ? `<h4>Language: ${book.language}</h4>` : ''}
            ${book.categories ? `<h4>Categories: ${book.categories}</h4>` : ''}
            <h4>Price: ${book.price}₪</h4>
            <h4>Rating: ${book.rating}</h4>
            ${book.authorName ? `<button class="show-more-books" data-author-id="${book.authorName}">Show more Books of this Author</button><br/>` : '<h4>This book does not have an Author name</h4>'}
            <button class="see-details" data-book='${JSON.stringify(bookData)}'>See Details</button><br/>
            <label>Readed: <input type="checkbox" class="book-readed" id="readedCheckbox_${book.id}" data-id="${book.id}" ${readedChecked}></label>
            <img src="${book.image}" alt="${book.name}">
            ${book.isDigital ? `<a href="${book.webReaderLink}" target="_blank"><button class="read-book">Read Book</button></a>` : ''}
            ${book.readed ? `<button class="add-review" data-id="${book.id}">Add Review</button>` : ''}
            <button class="delete-book" data-id="${book.id}">Delete</button>
        </div>
    `;
            $(sectionId).append(bookHtml);

            // Attach event listener for "Add Review" button
            $(`.add-review[data-id=${book.id}]`).click(function () {
                openModal(book.id, book.name);
            });
        }
    }

    // Function to open the review modal
    function openModal(bookID, bookName) {
        $('#modalTitle').text(`Review for ${bookName} By ${loggedInUser.name}`);
        $('#reviewCaption').val('');
        $('#reviewRating').val('5');
        $('#reviewModal').data('bookID', bookID);
        $('#reviewModal').show();
    }

    // Function to close the review modal
    function closeModal() {
        $('#reviewModal').hide();
    }

    // Attach event listener for "Post Review" button
    $(document).on('click', '#PostReview', function () {
        postReview();
    });

    // Function to post the review
    function postReview() {
        if (confirm('Are you sure you want to post this review?')) {
            let bookID = $('#reviewModal').data('bookID');
            let caption = $('#reviewCaption').val().trim();
            let rating = parseInt($('#reviewRating').val());

            if (caption && rating) {
                $.ajax({
                    //url: 'https://localhost:7127/api/Review/AddReview',
                    url: 'https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Review/AddReview',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        userID: loggedInUser.id,
                        bookID: bookID,
                        caption: caption,
                        rating: rating
                    }),
                    success: function () {
                        alert('Review posted successfully');
                        closeModal();
                        location.reload(); // Reload the page to show all reviews
                    },
                    error: function () {
                        alert('Failed to post review');
                    }
                });
            } else {
                alert('Please provide a caption and rating');
            }
        }
    } 

        // Event delegation for dynamically added content
    $(document).on('click', '.show-more-books', function () {
        let authorId = $(this).data('author-id');
        openAuthorBooksModal(authorId);
    });

    // Function to fetch and display instructor courses in a modal
    function openAuthorBooksModal(authorId) {
        // Clear the form completely
        $('#authorBooksForm').empty();

        // Set modal title with instructor's name
        let modalTitle = `<h1>More Books by Author ${authorId}:</h1><br>`;
        $('#authorBooksForm').append(modalTitle);

        // AJAX request to fetch instructor courses
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
                        let boodData = {
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
    $(document).on('click', '.modal .close', function () {
        $(this).closest('.modal').css('display', 'none');
    });

    // Close the modal when clicking outside of it
    $(window).on('click', function (e) {
        if ($(e.target).is('#authorBooksModal')) {
            $('#authorBooksModal').css('display', 'none');
        }
    });

    // Event listener for showing course details
    $(document).on('click', '.see-details', function () {
        const bookData = $(this).data('book');
        console.log('See Details button clicked:', bookData); // Debugging line
        showBookDetails(bookData);
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
        ${book.IsDigital ? `<p>Book Link: <a href="${book.WebReaderLink || '#'}" target="_blank">${book.WebReaderLink || 'No link available'}</a></p>` : ''}
        <h4>Digital: ${book.IsDigital ? 'Yes' : 'No'}</h4>
        <img src="${book.Image || ''}" alt="${book.Name || ' '}" style="max-width: 100%; height: auto;">
    `;
        $('#bookDetailsContent').html(bookHtml);
        $('#bookDetailsModal').show();
    }

    // Event listener for modal close
    $(document).on('click', '.close', function () {
        $('#bookDetailsModal').hide();
    });

    // Event listener for showing course details
    $(document).on('click', '.see-details', function () {
        const bookData = $(this).data('book');
        showBookDetails(bookData);
    });


    $(document).on('change', '.book-readed', function () {
        let bookId = $(this).data('id');
        let isReaded = $(this).is(':checked');
        let userId = getCurrentUserId();

        setBookAsReaded(userId, bookId, isReaded);
    });

    function setBookAsReaded(userId, bookId, readed) {
        let port = "7127";
        let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/setBookAsReaded?userId=${userId}&bookId=${bookId}&readed=${readed}`
        //let url = `https://localhost:${port}/api/User/setBookAsReaded?userId=${userId}&bookId=${bookId}&readed=${readed}`;

        let data = {
            userId: userId,
            bookId: bookId,
            readed: readed
        };

        ajaxCall("POST", url, JSON.stringify(data), function (response) {
            console.log(response);
            alert("Book read status updated successfully.");
            // Fetch courses again
            ajaxCall("GET", api, "", successCallBackFunction, errorCallBackFunction);
        }, function (err) {
            console.error("Error updating book read status: ", err);
            alert("Error updating book read status. Please try again later.");
        });
    }
});

let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

// Update navbar based on login status
function updateNavbar() {
    if (loggedInUser && loggedInUser.isActive) {
        $("#loginBtn").hide();
        $("#hiUser").show();
        $("#QuizPage").show();
        $("#FriendsChatPage").show();
        $("#ReviewsPage").show();
        $("#hiUser").text(`Hi ${loggedInUser.name}`);
        $("#bookRequestsPage").show();
        $("#userImage").show(); // Show the user image
        $("#userImage").attr("src", loggedInUser.image); // Set the image source
        $("#myBooksBtn").show();
        $("#logoutBtn").show();
        if (loggedInUser.isAdmin) {
            $('#adminPage').show();
        } else {
            $('#adminPage').hide();
        }
    } else {
        $("#loginBtn").show();
        $("#FriendsChatPage").hide();
        $("#ReviewsPage").hide();
        $("#QuizPage").hide();
        $("#bookRequestsPage").hide();
        $("#hiUser").hide();
        $("#userImage").hide();
        $("#logoutBtn").hide();
        $("#adminPage").hide();
    }
}

$(document).on("click", "#adminPage", function () {
    if (loggedInUser && loggedInUser.isActive && loggedInUser.isAdmin) {
        window.location.href = `Admin.html`;
    } else {
        alert("sign in as an admin to visit this page!");
        openLoginModal(); // Open login modal if the user is not logged in as an admin
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

$(document).on("click", "#FriendsChatPage", function () {
    if (loggedInUser && loggedInUser.isActive) {
        window.location.href = `FriendsChat.html`;
    } else {
        alert("Sign in to see your Friends and chat with them!");
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

function getCurrentUserId() {
    let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser && loggedInUser.id) {
        return loggedInUser.id;
    } else {
        console.log("No user is currently logged in or user ID is undefined.");
        return null;
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
            window.location.href = "index.html"; // Reload to the main page after logout
        },
        error: function (err) {
            console.log(err);
            alert("Error logging out. Please try again.");
        }
    });
}