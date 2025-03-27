$(document).ready(function () {
    let port = "7127";
    let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    let currentPage = 1;
    let totalPages = 1;
    const authorsPerPage = 12;
    let allAuthors = [];

    updateNavbar();
    fetchAndRenderAuthors();
    $('#searchBtn').click(searchAuthors);
    $('#prevPageBtn').click(() => changePage(-1));
    $('#nextPageBtn').click(() => changePage(1));

    document.getElementById('resetBtn').addEventListener('click', function () {
        location.reload();  // Reloads the current page
    });

    // Function to update the navbar based on login status
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
        }  else {
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

    fetchAndRenderAuthors();

    function fetchAndRenderAuthors() {
        $.ajax({
            type: "GET",
            //url: `https://localhost:${port}/api/Author/GetAllAuthors`,
            url: `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Author/GetAllAuthors`,
            success: function (authors) {
                allAuthors = authors;
                totalPages = Math.ceil(authors.length / authorsPerPage);
                renderAuthors();
            },
            error: function (err) {
                console.error("Error fetching Authors:", err);
                alert("Error fetching Authors. Please try again later.");
            }
        });
    }

    function renderAuthors(authors) {
        let $authorsList = $('#authors-list');
        $authorsList.empty();

        let startIndex = (currentPage - 1) * authorsPerPage;
        let endIndex = startIndex + authorsPerPage;
        let authorsToShow = allAuthors.slice(startIndex, endIndex);

        authorsToShow.forEach(function (author) {
            if (author.name != "") {
                let authorData = `
                <div class="Author">
                    <h2>Name: ${author.name}</h2>
                    <h4>Description: ${author.description}</h4>
                    <img src="${author.image}" alt="${author.name}">
                    <button class="show-books-btn" data-author-id="${author.name}">Show Books by this Author</button>
                </div>
            `;
                $authorsList.append(authorData);
            }
        });

        $('#pageInfo').text(`Page ${currentPage} of ${totalPages}`);
    }

    function searchAuthors() {
        let searchTerm = $('#searchInput').val().trim().toLowerCase();

        let filteredAuthors = allAuthors.filter(author =>
            (author.name && author.name.toLowerCase().includes(searchTerm)) ||
            (author.description && author.description.toLowerCase().includes(searchTerm))
        );

        currentPage = 1;
        totalPages = Math.ceil(filteredAuthors.length / authorsPerPage);
        allAuthors = filteredAuthors;
        renderAuthors();
    }

    function changePage(direction) {
        currentPage += direction;
        if (currentPage < 1) currentPage = 1;
        if (currentPage > totalPages) currentPage = totalPages;
        renderAuthors();
    }

    // Event delegation for dynamically added "Show Courses" button
    $('#authors-list').on('click', '.show-books-btn', function () {
        let authorId = $(this).data('author-id');
        openAuthorBooksModal(authorId);
    });

    // Function to fetch and display instructor courses in a modal
    function openAuthorBooksModal(authorId) {
        // Clear the form completely
        $('#authorBooksForm').empty();

        // Set modal title with instructor's name
        let modalTitle = `<h1>Books by Author ${authorId}:</h1><br>`;
        $('#authorBooksForm').append(modalTitle);

        // AJAX request to fetch instructor courses
        $.ajax({
            type: 'GET',
            /*url: `https://localhost:7127/api/Author/GetBooksByAuthor/${authorId}`,*/
            url: `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Author/GetBooksByAuthor/${authorId}`,
            success: function (books) {
                // Populate books in modal body
                books.forEach(function (book) {
                    let bookHtml = `
    <div class="book">
        <h2>${book.name}</h2>
        <h4>
            ${book.isDigital
                            ? 'Online book'
                            : `Physical book | ${book.isOwned ? 'Owned' : 'Available'}`
                        }
        </h4>
        ${book.authorName ? `<h4>Author Name: ${book.authorName}</h4>` : '<h4>This book does not have an Author name</h4>'}
        ${book.language ? `<h4>Language: ${book.language}</h4>` : ''}
        ${book.categories ? `<h4>Categories: ${book.categories}</h4>` : ''}
        <h4>Price: ${book.price}₪</h4>
        <h4>Rating: ${book.rating}</h4>
        <img src="${book.image}" alt="${book.name}">
    </div>
`;
                    $('#authorBooksForm').append(bookHtml);
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

    // My Courses button click handler
    $('#myBooksBtn').click(function () {
        if (loggedInUser && loggedInUser.isActive) {
            // Redirect to My Courses page
            window.location.href = 'MyBooks.html';
        } else {
            alert('Please log in to access your Books.');
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

    $("#logoutBtn").click(function () {
        let userId = loggedInUser.id;
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

    // Login button click handler
    $('#loginBtn').click(function () {
        alert('Please log in on the main page.');
        // Redirect to main page (index.html)
        window.location.href = 'index.html';
    });

    $(document).on("click", "#QuizPage", function () {
        if (loggedInUser && loggedInUser.isActive) {
            window.location.href = `Quiz.html`;
        } else {
            alert("Sign in to see your Quizzes and try them!");
            openLoginModal(); // Open login modal if the user is not logged in
        }
    });

    // Admin page click handler
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

    // Close modal function
    $('.modal .close').click(function () {
        $(this).closest('.modal').css('display', 'none');
    });

    // Close the modal when the close button or outside modal area is clicked
    $(window).on('click', function (e) {
        if (e.target == $('#authorBooksModal')[0]) {
            $('#authorBooksModal').css('display', 'none');
        }
    });
});
