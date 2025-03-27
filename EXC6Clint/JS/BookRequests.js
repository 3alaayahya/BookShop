$(document).ready(function () {
    // Initial check for user login status
    let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    updateNavbar();
    cuurentUserId = getCurrentUserId();
    let port = "7127";
    fetchMyBookRequestsFromOthers();
    // Update navbar based on login status
    function updateNavbar() {
        $("#loginBtn").hide();
        $("#QuizPage").show();
        $("#hiUser").show();
        $("#hiUser").text(`Hi ${loggedInUser.name}`);
        $("#bookRequestsPage").hide();
        $("#userImage").show(); // Show the user image
        $("#userImage").attr("src", loggedInUser.image); // Set the image source
        $("#myBooksBtn").show();
        $("#logoutBtn").show();
    }

    function getCurrentUserId() {
        let loggedInUser = JSON.parse(localStorage.getItem('currentUser'));
        if (loggedInUser && loggedInUser.id) {
            return loggedInUser.id;
        } else {
            console.log("No user is currently logged in or user ID is undefined.");
            return null;
        }
    }

    // Button click events
    $('#booksRequestedFromMeBtn').click(function () {
        $('#request-list').empty();
        fetchOthersBookRequestsFromMe();
    });

    $('#booksIRequestedBtn').click(function () {
        $('#request-list').empty();
        fetchMyBookRequestsFromOthers();
    });

    // Function to fetch Active Books from the server
    function fetchMyBookRequestsFromOthers() {
        $.ajax({
            url: `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/getMyBookRequests?askerId=${loggedInUser.id}`,
            //url: `https://localhost:${port}/api/User/getMyBookRequests?askerId=${loggedInUser.id}`,
            type: 'GET',
            success: function (requestsData) {
                if (requestsData.length > 0) {
                    $('#request-list').append('<h1>My Requests From Other Users:</h1>');
                    requestsData.forEach(request => renderRequest(request));
                } else {
                    $('#request-list').append('<h2>No requests found.</h2>');
                }
            },
            error: function (err) {
                console.log("Error fetching Requests:", err);
            }
        });
    }

    // Function to fetch Active Books from the server
    function fetchOthersBookRequestsFromMe() {
        $.ajax({
            url: `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/ownerBookRequests?ownerId=${loggedInUser.id}`,
            //url: `https://localhost:${port}/api/User/ownerBookRequests?ownerId=${loggedInUser.id}`,
            type: 'GET',
            success: function (requestsData) {
                if (requestsData.length > 0) {
                    $('#request-list').append('<h1>Users Requests From Me:</h1>');
                    requestsData.forEach(request => renderRequest(request));
                } else {
                    $('#request-list').append('<h2>No requests found.</h2>');
                }
            },
            error: function (err) {
                console.log("Error fetching Requests:", err);
            }
        });
    }

    // Function to render each course
    function renderRequest(request) {
        let requestData = {};

        if (request.AskerId == loggedInUser.id) {
            requestData = {
                AskerId: request.AskerId,
                OwnerId: request.OwnerId,
                OwnerName: request.OwnerName,
                OwnerEmail: request.OwnerEmail,
                OwnerImage: request.OwnerImage,
                BookId: request.BookId,
                BookName: request.BookName,
                BookAuthor: request.BookAuthor,
                BookPublishDate: request.BookPublishDate,
                BookPageCount: request.BookPageCount,
                BookPrice: request.BookPrice,
                BookRating: request.BookRating,
                BookCategories: request.BookCategories,
                BookLanguage: request.BookLanguage,
                BookImage: request.BookImage,
                BookDescription: request.BookDescription,
                Message: request.Message,
                RequestDate: request.RequestDate,
                Approved: request.Approved,
                Waiting: request.Waiting
            };

            let requestDate = new Date(request.RequestDate).toLocaleDateString();

            // Generate HTML for the request
            var requestHtml = `
        <div class="book">
            <h2>From: ${loggedInUser.name}</h2>
            <h2>Email: ${loggedInUser.email}</h2>
            <h2>To: ${request.OwnerName}<img class="profile-image" src="${request.AskerImage}" alt="${request.AskerName}"></h2>
            <h2>Email: ${request.OwnerEmail}</h2>
            <h2>Message: ${request.Message}</h2>
            <h2>Request Date: ${requestDate}</h2>
            <h2>Book requested: ${request.BookName}</h2>
        <h2>Status: ${request.Waiting
                    ? "Pending"
                    : request.Approved
                        ? '<span style="color: green;">Approved</span>'
                        : '<span style="color: red;">Denied</span>'
                }</h2>            
            <img src="${request.BookImage}" alt="${request.BookName}">
            <button class="cancel-request" data-asker-id="${request.AskerId}" data-owner-id="${request.OwnerId}" data-book-id="${request.BookId}">Cancel My Request</button>

        </div>
    `;

            $('#request-list').append(requestHtml);
        } else {
            requestData = {
                AskerId: request.AskerId,
                AskerName: request.AskerName,
                AskerImage: request.AskerImage,
                BookId: request.BookId,
                BookName: request.BookName,
                BookAuthor: request.BookAuthor,
                BookPublishDate: request.BookPublishDate,
                BookPageCount: request.BookPageCount,
                BookCategories: request.BookCategories,
                BookLanguage: request.BookLanguage,
                BookImage: request.BookImage,
                BookDescription: request.BookDescription,
                BookPrice: request.BookPrice,
                BookRating: request.BookRating,
                Message: request.Message,
                RequestDate: request.RequestDate,
                Approved: request.Approved,
                Waiting: request.Waiting
            };

            let requestDate = new Date(request.RequestDate).toLocaleDateString();

            // Generate HTML for the request
            var requestHtml = `
        <div class="book">
            <h2>From: ${request.AskerName}<img src="${request.AskerImage}" alt="${request.AskerName}"></h2>
            <h2>Email: ${request.AskerEmail}</h2>
            <h2>To: ${loggedInUser.name}</h2>
            <h2>Email: ${loggedInUser.email}</h2>
            <h2>Message: ${request.Message}</h2>
            <h2>Request Date: ${requestDate}</h2>
            <h2>Book requested: ${request.BookName}</h2>
        <h2>Status: ${request.Waiting
                    ? "Pending"
                    : request.Approved
                        ? '<span style="color: green;">You approved this request</span>'
                        : '<span style="color: red;">You denied this request</span>'
                }</h2>            
        <img src="${request.BookImage}" alt="${request.BookName}">
        ${request.Waiting ? `
            <button class="approve-request" data-request-id="${request.RequestId}" data-asker-id="${request.AskerId}" data-owner-id="${loggedInUser.id}" data-book-id="${request.BookId}">Approve</button>
            <button class="deny-request" data-request-id="${request.RequestId}">Deny</button>
        ` : ''}
        </div>
    `;

            $('#request-list').append(requestHtml);
        }

    }

    // Event listener for the cancel button
    $('#request-list').on('click', '.cancel-request', function () {
        // Confirm with the user before proceeding
        if (confirm("Are you sure you want to cancel this request?")) {
            let askerId = $(this).data('asker-id');
            let ownerId = $(this).data('owner-id');
            let bookId = $(this).data('book-id');

            $.ajax({
                url: `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/RemoveBookRequest?askerId=${askerId}&ownerId=${ownerId}&bookId=${bookId}`,
                /*url: `https://localhost:7127/api/User/RemoveBookRequest?askerId=${askerId}&ownerId=${ownerId}&bookId=${bookId}`,*/
                type: 'DELETE',
                success: function (response) {
                    alert("The request has been canceled.");
                    fetchOthersBookRequestsFromMe();
                    // Optionally, remove the canceled request from the DOM
                    $(this).closest('.book').remove();
                }.bind(this), // Bind the `this` context to the current element
                error: function (err) {
                    console.log("Error canceling request:", err);
                    alert("There was an error canceling the request. Please try again.");
                }
            });
        }
    });

    // Event listener for the approve button
    $('#request-list').on('click', '.approve-request', function () {
        if (confirm("Are you sure? Once you approve, the book will be in the asker’s library and you will not have access to it.")) {
            let requestId = $(this).data('request-id');
            let askerId = $(this).data('asker-id');
            let ownerId = $(this).data('owner-id');
            let bookId = $(this).data('book-id');

            $.ajax({
                //url: `https://localhost:7127/api/User/AnswerRequest?requestId=${requestId}&approved=true`,
                url: `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/AnswerRequest?requestId=${requestId}&approved=true`,
                type: 'POST',
                success: function (response) {
                    $.ajax({
                        //url: `https://localhost:7127/api/User/ChangeBookOwner?askerId=${askerId}&currentOwnerId=${ownerId}&bookId=${bookId}`,
                        url: `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/ChangeBookOwner?askerId=${askerId}&currentOwnerId=${ownerId}&bookId=${bookId}`,
                        type: 'POST',
                        success: function () {
                            alert("The request has been approved and the book has been transferred to the asker.");
                            fetchOthersBookRequestsFromMe();
                        },
                        error: function (err) {
                            console.log("Error changing book owner:", err);
                            alert("There was an error transferring the book. Please try again.");
                        }
                    });
                },
                error: function (err) {
                    console.log("Error approving request:", err);
                    alert("There was an error approving the request. Please try again.");
                }
            });
        }
    });

    // Event listener for the deny button
    $('#request-list').on('click', '.deny-request', function () {
        if (confirm("Are you sure you want to deny this request?")) {
            let requestId = $(this).data('request-id');

            $.ajax({
                url: `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/AnswerRequest?requestId=${requestId}&approved=false`,
                //url: `https://localhost:7127/api/User/AnswerRequest?requestId=${requestId}&approved=false`,
                type: 'POST',
                success: function (response) {
                    alert("The request has been denied.");
                },
                error: function (err) {
                    console.log("Error denying request:", err);
                    alert("There was an error denying the request. Please try again.");
                }
            });
        }
    });


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

    $(document).on("click", "#QuizPage", function () {
        if (loggedInUser && loggedInUser.isActive) {
            window.location.href = `Quiz.html`;
        } else {
            alert("Sign in to see your Quizzes and try them!");
            openLoginModal(); // Open login modal if the user is not logged in
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
                localStorage.removeItem('currentUser');
                loggedInUser = null;
                window.location.href = "index.html"; // Reload to the main page after logout
            },
            error: function (err) {
                console.log(err);
                alert("Error logging out. Please try again.");
            }
        });
    }
});

