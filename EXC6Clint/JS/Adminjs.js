let mode;
let booksLength = 0;
let booksData = [];
let allAuthors = [];
let bookInList;
let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

$(document).ready(function () {
    let port = "7127";
    getBooks();
    getAuthors();

    // Handle "Show All Users" button click
    $('#showAllUsersBtn').click(function () {
        $.ajax({
            //url: 'https://localhost:7127/api/User/GetAllUsers',
            url: 'https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/GetAllUsers',
            method: 'GET',
            success: function (data) {
                renderUsers(data);
            },
            error: function (error) {
                console.error('Error fetching users:', error);
                alert('Failed to fetch users.');
            }
        });
    });

    function getAuthors() {
        $.ajax({
            //url: 'https://localhost:7127/api/Author/GetAllAuthors',
            url: 'https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Author/GetAllAuthors',
            method: 'GET',
            success: function (data) {
                allAuthors = data;
            },
            error: function (error) {
                console.error('Error fetching authors:', error);
            }
        });
    }

    // Handle "Show All Authors" button click
    $('#showAllAuthorsBtn').click(function () {
        $.ajax({
            //url: 'https://localhost:7127/api/Author/GetAllAuthors',
            url: 'https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Author/GetAllAuthors',
            method: 'GET',
            success: function (data) {
                renderAuthors(data);
            },
            error: function (error) {
                console.error('Error fetching authors:', error);
                alert('Failed to fetch authors.');
            }
        });
    });

    function renderUsers(users) {
        let $booksList = $('#book-list');
        $booksList.empty();

        users.forEach(function (user) {
            if (user.name) {
                let userData = `
    <div class="book">
        <h2>Name: ${user.name}</h2>
        <h4>ID: ${user.id}</h4>
        <h4>Email: ${user.email}</h4>
        <h4>IsActive: ${user.isActive}</h4>
        <img src="${user.image}" alt="${user.name}">
        <button class="see-books-btn" data-user-id="${user.id}" data-user-name="${user.name}">See User Books</button>
    </div>
`;
                $booksList.append(userData);
            }
        });
        $('.see-books-btn').click(function () {
            let userId = $(this).data('user-id');
            let userName = $(this).data('user-name');
            showUserBooks(userId,userName);
        });
    }

    function showUserBooks(userId,userName) {
        $.ajax({
            //url: `https://localhost:7127/api/User/GetAllBooksForUser/${userId}`,
            url: `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/GetAllBooksForUser/${userId}`,
            method: 'GET',
            success: function (data) {
                booksLengh = data.length;
                let $userBooksContent = $('#userBooksContent');
                $userBooksContent.empty();
                if (booksLengh) {
                    let modalTitle = `
                <h1>${userName} has ${booksLengh} Books:</h1>`;
                    $userBooksContent.append(modalTitle);
                    renderUserBooks(data);
                    $('#userBooksModal').show();
                }
                else {
                    let modalTitle = `
                <h1>${userName} has no Books</h1>`;
                    $userBooksContent.append(modalTitle);
                }
            },
            error: function (error) {
                console.error('Error fetching user books:', error);
                alert(`${userName} has no Book in his Library...`);
            }
        });
    }

    function renderUserBooks(books) {
        let $userBooksContent = $('#userBooksContent');
        books.forEach(function (book) {
            if (book.name) {
                let bookData = `
                        <div class="book">
                            <h2>${book.name}</h2>
                            <h4>
                                ${book.isDigital ? 'Online book' : 'Physical book'}
                            </h4>
                            ${book.authorName ? `<h4>Author Name: ${book.authorName}</h4>` : ''}
                            ${book.language ? `<h4>Language: ${book.language}</h4>` : ''}
                            ${book.categories ? `<h4>Categories: ${book.categories}</h4>` : ''}
                            <h4>Price: ${book.price}₪</h4>
                            <h4>Rating: ${book.rating}</h4>
                            <img src="${book.image}" alt="${book.name}">
                        </div>
                    `;
                $userBooksContent.append(bookData);
            }
        });
    }

    // Close modal when clicking on close button
    $('.modal .close').click(function () {
        $(this).closest('.modal').hide();
    });

    // Hide modal when clicking outside of the modal content
    $(window).click(function (event) {
        if ($(event.target).hasClass('modal')) {
            $(event.target).hide();
        }
    });

    function renderAuthors(authors) {
        let $booksList = $('#book-list');
        $booksList.empty();

        authors.forEach(function (author) {
            if (author.name) {
                let authorData = `
                <div class="book">
                    <h2>Name: ${author.name}</h2>
                    <h4>ID: ${author.authorId}</h4>
                    <h4>Description: ${author.description}</h4>
                    <button class="see-users-btn" data-author-name="${author.name}">See Users That Have Books By This Author</button>
                    <img src="${author.image}" alt="${author.name}">
                </div>
            `;
                $booksList.append(authorData);
            }
        });

        // Attach click event to the buttons
        $('.see-users-btn').on('click', function () {
            let authorName = $(this).data('author-name');
            showUsersModal(authorName);
        });

        $('#closeModalBtn').on('click', function () {
            $('#showUsersModal').hide();
        });
    }

    function showUsersModal(authorName) {
        $.ajax({
            url: `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Author/GetUsersThatHaveThisAuthor/${authorName}`,
            //url: `https://localhost:${port}/api/Author/GetUsersThatHaveThisAuthor/${authorName}`,
            method: 'GET',
            success: function (users) {
                let $authorUsersList = $('#show-users-list');
                $authorUsersList.empty();
                if (users.length !== 0) {
                    let modalTitle = `
                <h1>${authorName} has ${users.length} Appearances in users library:</h1>`;
                    $authorUsersList.append(modalTitle);
                    renderUsersList(users);
                    $('#showUsersModal').show();
                }
                else {
                    let modalTitle = `
                <h1>${authorName} has no Appearances in users library</h1>`;
                    $authorUsersList.append(modalTitle);
                    $('#showUsersModal').show();
                }      
            },
            error: function (error) {
                console.error('Error fetching users:', error);
            }
        });
    }

    function renderUsersList(users) {
        let $authorUsersList = $('#show-users-list');

        users.forEach(function (user) {
            let userData = `
                <div class="book">
                    <h4>Name: ${user.name}</h4>
                    <h4>Email: ${user.email}</h4>
                    <img src="${user.image}" alt="${user.name}">
                </div>
            `;
            $authorUsersList.append(userData);
        });
    }


    // Handle "Show All Books" button click
    $('#showAllBooksBtn').click(function () {
        getBooks(); 
    });

    $('#quickEditBtn').on('click', function () {
        toggleDataList();
    });

    $('#editBookBtn').on('click', function () {
        mode = "edit";
        const bookId = $('#bookDatalist').val();
        console.log("Edit book button clicked, book ID: ", bookId);
        $('#bookID').prop('readonly', true);
        $('#bookAuthorName').prop('readonly', true);
        $('#bookRating').prop('readonly', true);
        if (bookId) {
            fetchBookDetails(bookId);
        } else {
            alert("Please enter a book ID.");
        }
    });

    $('#insertBookBtn').on('click', function () {
        mode = "insert";
        clearForm();
        $('#bookID').prop('readonly', true);
        $('#bookID').val(booksLength); // Set courseID to booksLength
        $('#bookAuthorName').prop('readonly', false);
        $('#bookRating').prop('readonly', false);
        $('#formMode').val('insert');
        showModal();
    });

    // Handle edit button click event to open edit modal
    $('#booksTable').on('click', '.edit-book-list', function () {
        event.preventDefault();
        var data = $('#booksTable').DataTable().row($(this).parents('tr')).data();
        bookInList = data;
        $('#editBookId').val(data.id);
        $('#editBookTitle').val(data.name);
        $('#editBookIsActive').prop('checked', data.isActive);
        $('#editbookFromList').show();
    });

    $(document).on('change', '#editBookIsActive', function () {
        event.preventDefault();
        let isActive = $(this).is(':checked');

        updateBookIsActive(bookInList.id , isActive);
    });

    // Handle close modal event
    $('.close').click(function () {
        $('#editbookFromList').hide();
        $('#editBookModal').hide();
    });

    // Handle save button click event
    $('#saveBtnFromList').click(function () {
        event.preventDefault();

        var updatedBook = {
            id: bookInList.id,
            name: $('#editBookTitle').val(),
            authorName: bookInList.authorName,
            publishDate: bookInList.publishDate,
            pageCount: bookInList.pageCount,
            categories: bookInList.categories,
            language: bookInList.language,
            image: bookInList.image,
            description: bookInList.description,
            webReaderLink: bookInList.webReaderLink,
            price: bookInList.price,
            rating: bookInList.rating,
            isDigital: bookInList.isDigital,
            isActive: $('#editBookIsActive').prop('checked'),
            isOwned: bookInList.isOwned
        };
        console.log(updatedBook);
        let port = "7127";
        let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Book/UpdateBookByID/${updatedBook.id}`
        //let url = `https://localhost:${port}/api/Book/UpdateBookByID/${updatedBook.id}`
        // API call to update course
        $.ajax({
            url: url,
            type: 'PUT',
            data: updatedBook,
            success: function (response) {
                console.log('Book updated successfully');
                alert('Book updated successfully');
                getBooks();
                $('#editbookFromList').hide();
                // You can add further logic here upon successful update
            },
            error: function (xhr, status, error) {
                alert('there is a Book with the same title!');
                console.error('Error updating Book:', error);
                // Handle error condition
            }
        });
    });
});

function toggleDataList() {
    let $dataList = $('#dataList');
    let $quickEditBtn = $('#quickEditBtn');
    if ($dataList.is(':visible')) {
        $dataList.hide();
        $quickEditBtn.text('Edit in dataList');
    } else {
        getBooks();
        $dataList.show();
        $quickEditBtn.text('Close list');
    }
}

function initializeDataTable(books) {
    console.log("Books data:", books);
    let $booksTable = $('#booksTable');
    if ($.fn.DataTable.isDataTable($booksTable)) {
        $booksTable.DataTable().clear().destroy();
    }
    $booksTable.DataTable({
        data: books,
        columns: [
            { data: null, defaultContent: '<button class="edit-book-list">Edit</button>' },
            { data: 'id' },
            { data: 'name' },
            { data: 'authorName' },
            { data: 'publishDate' },
            { data: 'pageCount' },
            { data: 'categories' },
            { data: 'language' },
            { data: 'image' },
            { data: 'description' },
            { data: 'webReaderLink' },
            { data: 'price' },
            { data: 'rating' },
            { data: 'isDigital', render: function (data) { return data ? '<input type="checkbox" checked disabled="disabled" />' : '<input type="checkbox" disabled="disabled"/>'; } },
            { data: 'isActive', render: function (data) { return data ? '<input type="checkbox" checked disabled="disabled" />' : '<input type="checkbox" disabled="disabled"/>'; } },
            { data: 'isOwned', render: function (data) { return data ? '<input type="checkbox" checked disabled="disabled" />' : '<input type="checkbox" disabled="disabled"/>'; } }
        ],
        responsive: true,
        autoWidth: false,
        order: [[1, 'asc']],
        lengthChange: true,
        searching: true,
        paging: true
    });
}

function clearForm() {
    $('#bookId').val('');
    $('#bookTitle').val('');
    $('#bookID').val('');
    $('#bookAuthorName').val('');
    $('#bookPublishDate').val('');
    $('#bookPageCount').val('');
    $('#bookCategories').val('');
    $('#bookLanguage').val('');
    $('#bookImageReference').val('');
    $('#bookImageUpload').val('');
    $('#bookDescription').val('');
    $('#bookWebReaderLink').val('');
    $('#bookPrice').val('');
    $('#bookRating').val('');
    $('#bookIsDigital').prop('checked', false);
    $('#bookIsActive').prop('checked', false);
    $('#bookIsOwned').prop('checked', false);
}

// Modal handling
var modal = document.getElementById("editBookModal");
var span = document.getElementsByClassName("close")[0];
span.onclick = function () {
    modal.style.display = "none";
}
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
function showModal() {
    modal.style.display = "block";
}

function getBooks() {
    let port = "7127";
    //let url = `https://localhost:${port}/api/Book/GetAllBooks`
    let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Book/GetAllBooks`

    ajaxCall("GET", url, "", getAllSCBF, getAllECBF);
}

function getAllSCBF(books) {
    renderBooks(books);
    populateDatalist(books);
    initializeDataTable(books)
    booksLength = books.length + 1;
}

function getAllECBF(err) {
    console.error("Error fetching Books: ", err);
    //alert("Error fetching courses. Please try again later.");
}

$(document).on('click', '.edit-book', function () {
    mode = "edit";
    const bookId = $(this).data('id');
    $('#bookID').prop('readonly', true);
    $('#bookAuthorName').prop('readonly', true);
    console.log("Edit Book button inside Book clicked, Book ID: ", bookId); // Debugging log
    fetchBookDetails(bookId);
});

function renderBooks(books) {
    let $booksList = $('#book-list');
    $booksList.empty();

    books.forEach(function (book) {
        let isActiveChecked = book.isActive ? 'checked' : '';

        let bookData = `
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
        <button class="see-users-btn2" data-book-id="${book.id}">See Users That Own This Book</button>
        <img src="${book.image}" alt="${book.name}">
                <label>Active: <input type="checkbox" class="book-active" id="isActiveCheckbox_${book.id}" data-id="${book.id}" ${isActiveChecked}></label>
                <button class="edit-book" data-id="${book.id}">Edit</button>
    </div>
`;
        $booksList.append(bookData);
    });
    // Attach event handler for the "See Users" button
    $('.see-users-btn2').on('click', function () {
        let bookId = $(this).data('book-id');
        showUsersModalForBooks(bookId);
    });

    // Attach event handler after rendering books
    attachActiveCheckboxHandler();
}

function showUsersModalForBooks(bookId) {
    let port = "7127";
    $.ajax({
        url: `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Book/GetUsersThatHaveThisBook/${bookId}`,
        //url: `https://localhost:${port}/api/Book/GetUsersThatHaveThisBook/${bookId}`,
        method: 'GET',
        success: function (users) {
            let $authorUsersList = $('#show-users-list');
            $authorUsersList.empty();
            if (users.length !== 0) {
                let modalTitle = `
                <h1>This book has ${users.length} Appearances in users library:</h1>`;
                $authorUsersList.append(modalTitle);
                renderUsersList(users);
                $('#showUsersModal').show();
            }
            else {
                let modalTitle = `
                <h1>This book has no Appearances in users library</h1>`;
                $authorUsersList.append(modalTitle);
                $('#showUsersModal').show();
            }
        },
        error: function (error) {
            console.error('Error fetching users:', error);
        }
    });
}

function renderUsersList(users) {
    let $authorUsersList = $('#show-users-list');

    users.forEach(function (user) {
        let userData = `
                <div class="book">
                    <h4>Name: ${user.name}</h4>
                    <h4>Email: ${user.email}</h4>
                    <img src="${user.image}" alt="${user.name}">
                </div>
            `;
        $authorUsersList.append(userData);
    });
}

function attachActiveCheckboxHandler() {
    // Event handler for Active checkboxes
    $(document).on('change', '.book-active', function () {
        let bookId = $(this).data('id');
        let isActive = $(this).is(':checked');

        updateBookIsActive(bookId, isActive);
    });
}

async function updateBookIsActive(bookId, isActive) {
    let port = "7127";
    let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Book/SetActive/${bookId}`;
    //let url = `https://localhost:${port}/api/Book/SetActive/${bookId}`;
    try {
        await $.ajax({
            type: 'PUT',
            url: url,
            data: JSON.stringify(isActive),
            contentType: 'application/json',
            success: function (result) {
                if (isActive) {
                    alert(`Book with id ${bookId} set to active`)
                } else {
                    alert(`Book with id ${bookId} updated to not active`)
                }
                console.log("Update isActive success response: ", result);
                // Optionally, update UI or notify user
            },
            error: function (err) {
                console.error("Error updating isActive status: ", err);
                alert("Error updating isActive status. Please try again later.");
            }
        });
    } catch (err) {
        console.error("Error updating isActive status: ", err);
        alert("Error updating isActive status. Please try again later.");
    }
}

function populateDatalist(books) {
    let $datalist = $('#books');
    $datalist.empty();

    books.forEach(function (book) {
        let option = `<option value="${book.id}">${book.name}</option>`;
        $datalist.append(option);
    });
}

function fetchBookDetails(bookId) {
    let port = "7127";
    //let url = `https://localhost:${port}/api/Book/GetBookByID/${bookId}`;
    let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Book/GetBookByID/${bookId}`;
    console.log("Fetching book details for Book ID: ", bookId); // Debugging log

    ajaxCall("GET", url, "", function (book) {
        if (!book) {
            alert("There is no Book with this ID");
        } else {
            console.log("Fetched Book details: ", book); // Debugging log
            populateEditForm(book);
            showModal();
        }
    }, function (err) {
        console.error("Error fetching Book details: ", err);
        //alert("Error fetching course details. Please enter a valid course ID");
    });
}

function populateEditForm(book) {
    $('#bookId').val(book.id);
    $('#bookTitle').val(book.name);
    $('#bookID').val(book.id);
    $('#bookAuthorName').val(book.authorName);
    $('#bookPublishDate').val(book.publishDate);
    $('#bookPageCount').val(book.pageCount);
    $('#bookCategories').val(book.categories);
    $('#bookLanguage').val(book.language);
    $('#bookWebReaderLink').val(book.webReaderLink);
    $('#bookImageReference').val(book.image);
    $('#bookDescription').val(book.description);
    $('#bookPrice').val(book.price);
    $('#bookRating').val(book.rating);
    $('#bookIsDigital').prop('checked', book.isDigital);
    $('#bookIsActive').prop('checked', book.isActive);
    $('#bookIsOwned').prop('checked', book.isOwned);
}

function showModal() {
    console.log("Showing modal"); // Debugging log
    var modal = document.getElementById("editBookModal");
    modal.style.display = "block";
}

async function updateBook() {
    let updatedBook = {
        Id: $('#bookID').val(),
        Name: $('#bookTitle').val(),
        AuthorName: $('#bookAuthorName').val(),
        PublishDate: $('#bookPublishDate').val(),
        PageCount: parseInt($('#bookPageCount').val()),
        Categories: $('#bookCategories').val(),
        Language: $('#bookLanguage').val(),
        Image: $('#bookImageReference').val() === '' ?
            'https://cdn.prod.website-files.com/64be2485b703f9575bd09a67/64f54aac6ef461a95e69a166_OG.png' :
            $('#bookImageReference').val(),
        Description: $('#bookDescription').val(),
        WebReaderLink: $('#bookWebReaderLink').val(),
        Price: $('#bookPrice').val(),
        Rating: $('#bookRating').val(),
        isDigital: $('#bookIsDigital').prop('checked'),
        isActive: $('#bookIsActive').prop('checked'),
        isOwned: $('#bookIsOwned').prop('checked')
    };

    let imageFile = $('#bookImageUpload')[0].files[0];
    let formData = new FormData();

    // Append each property of updatedBook individually
    for (let key in updatedBook) {
        formData.append(key, updatedBook[key]);
    }

    // Append image file if it exists
    if (imageFile) {
        formData.append('files', imageFile);
    }

    let port = "7127";
    let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Book/UpdateBookByID/${$('#bookID').val()}`;
    //let url = `https://localhost:${port}/api/Book/UpdateBookByID/${$('#bookID').val()}`;
    try {
        await $.ajax({
            type: 'PUT',
            url: url,
            data: formData,
            contentType: false,
            processData: false,
            success: function (result) {
                console.log("Update Book success response: ", result);
                getBooks();
                $('#editBookModal').hide();
                alert("The Book has been updated!");
            },
            error: function (res) {
                console.error("Error updating Book: ", res);
                alert("Error updating Book. Please try again later.");
            }
        });
    } catch (err) {
        console.error("Error uploading image: ", err.responseJSON?.message || err.statusText);
        alert("Error uploading image: " + (err.responseJSON?.message || "Please try again later."));
    }
}


async function insertBook() {
    let authorName = $('#bookAuthorName').val().trim();
    let bookRating = $('#bookRating').val();
    let isAuthorValid = allAuthors.some(author => author.name === authorName);

    if (!isAuthorValid) {
        alert("Please select an author from the list.");
        return;
    }

    if (bookRating > 5 || bookRating < 1) {
        alert("Please Enter a rating from 1 to 5.");
        return;
    }

    let newBook = {
        Id: $('#bookID').val(),
        Name: $('#bookTitle').val(),
        AuthorName: $('#bookAuthorName').val(),
        PublishDate: $('#bookPublishDate').val(),
        PageCount: parseInt($('#bookPageCount').val()),
        Categories: $('#bookCategories').val(),
        Language: $('#bookLanguage').val(),
        Image: $('#bookImageReference').val() === '' ?
            'https://cdn.prod.website-files.com/64be2485b703f9575bd09a67/64f54aac6ef461a95e69a166_OG.png' :
            $('#bookImageReference').val(),
        WebReaderLink: $('#bookWebReaderLink').val(),
        Description: $('#bookDescription').val(),
        Price: $('#bookPrice').val(),
        Rating: $('#bookRating').val(),
        isDigital: $('#bookIsDigital').prop('checked'),
        isActive: true,
        isOwned: false
    };

            //let url = `https://localhost:7127/api/Book/AddBook`;
    let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Book/AddBook`;

            let imageFile = $('#bookImageUpload')[0].files[0];
            let formData = new FormData();

            // Append each property of updatedCourse individually
            for (let key in newBook) {
                formData.append(key, newBook[key]);
            }

            // Append image file if it exists
            if (imageFile) {
                formData.append('files', imageFile);
            }

            try {
                await $.ajax({
                    type: 'POST',
                    url: url,
                    data: formData,
                    contentType: false,
                    processData: false,
                    success: function (result) {
                        console.log("Insert Book success response: ", result);
                        getBooks();
                        $('#editBookModal').hide();
                        alert("The new Book has been inserted successfully!");
                    },
                    error: function (err) {
                        console.error("Error inserting Book: ", err);
                        alert("Error inserting Book. Please try again later.");
                    }
                });
            } catch (err) {
                console.error("Error uploading image: ", err.responseJSON?.message || err.statusText);
                alert("Error uploading image: " + (err.responseJSON?.message || "Please try again later."));
            }
}

$(document).on('submit', '#editBookForm', function () {
    event.preventDefault();
    if (mode === "edit") {
        updateBook();
    } else if (mode === "insert") {
        insertBook();
    }
});

// Reusable AJAX call function
function ajaxCall(method, url, data, successCB, errorCB) {
    $.ajax({
        type: method,
        url: url,
        data: data,
        contentType: method === "GET" ? "application/json; charset=utf-8" : false,
        processData: method === "GET",
        success: successCB,
        error: errorCB
    });
}

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

$(document).on("click", "#QuizPage", function () {
    if (loggedInUser && loggedInUser.isActive) {
        window.location.href = `Quiz.html`;
    } else {
        alert("SigFriendsChatPagen in to see your Quizzes and try them!");
        openLoginModal(); // Open login modal if the user is not logged in
    }
});

$(document).on("click", "#myBooksBtn", function () {
    if (loggedInUser && loggedInUser.isActive) {
        window.location.href = `MyBooks.html`;
    } else {
        alert("Sign in to see your books!");
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
    //let url = `https://localhost:${port}/api/User/logout?userId=${userId}`;
    let url = `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/logout?userId=${userId}`;

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