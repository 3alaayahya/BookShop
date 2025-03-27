let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
let likedReviews = [];
let allReviews = [];

$(document).ready(function () {
    // Fetch the reviews liked by the current user
    $.ajax({
        //url: 'https://localhost:7127/api/Review/GetReviewsILiked?userID=' + loggedInUser.id,
        url: 'https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Review/GetReviewsILiked?userID=' + loggedInUser.id,
        method: 'GET',
        success: function (data) {
            likedReviews = data.map(review => review.reviewID);
            loadAllReviews();
        }
    });
});

function loadAllReviews() {
    $.ajax({
        //url: 'https://localhost:7127/api/Review/GetAllReviews',
        url: 'https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Review/GetAllReviews',
        method: 'GET',
        success: function (data) {
            allReviews = data; // Save all reviews for later use
            data.sort((a, b) => new Date(b.reviewDate) - new Date(a.reviewDate));
            $('#reviews-container').html(''); // Clear existing reviews
            data.forEach(review => renderReview(review));
        }
    });
}

function renderReview(review) {
    let isLiked = likedReviews.includes(review.reviewID);
    let likeButtonText = isLiked ? 'Liked' : 'Like';
    let likeButtonClass = isLiked ? 'liked' : '';
    let deleteButton = review.userName === loggedInUser.name ?
        `<button class="delete-review-btn" onclick="confirmDeleteReview(${review.reviewID})">Delete Review</button>` : '';

    // Format the review date to show only the date part (no time)
    let formattedDate = new Date(review.reviewDate).toLocaleDateString();

    let reviewHTML = `
        <div class="review-container">
            <div class="review-header">
                <img src="${review.userImage}" class="user-image" />
                <h2 class="user-name">${review.userName}</h2>
                <span class="review-date">${formattedDate}</span>
            </div>
            <div class="review-details">
                <h2>${review.userName} posted a review about <strong>${review.bookName}</strong></h2>
                <h3>Rating: ${review.rating}/5</h3>
                <h3>Caption: ${review.caption}</h3>
                <img src="${review.bookImage}" class="book-image" />
            </div>
            <div class="review-actions">
                <button class="like-btn ${likeButtonClass}" onclick="toggleLike(${review.reviewID})">
                    ${likeButtonText} (${review.likeCount})
                </button>
                <button class="comment-btn" onclick="toggleComments(${review.reviewID})">
                    Comments (${review.commentCount})
                </button>
                ${deleteButton}
            </div>
            <div class="comment-section" id="comments-${review.reviewID}" style="display: none;">
                <!-- Comments will be loaded here -->
            </div>
        </div>
    `;

    $('#reviews-container').append(reviewHTML);
}


function showLikedReviews() {
    let likedReviewsData = allReviews.filter(review => likedReviews.includes(review.reviewID));
    $('#reviews-container').html(''); // Clear existing reviews
    likedReviewsData.forEach(review => renderReview(review));
}

function showMyReviews() {
    let myReviews = allReviews.filter(review => review.userID === loggedInUser.id);
    $('#reviews-container').html(''); // Clear existing reviews
    myReviews.forEach(review => renderReview(review));
}

function searchReviews() {
    let searchText = $('#search-input').val().trim().toLowerCase();
    if (searchText) {
        let filteredReviews = allReviews.filter(review =>
            review.bookName.toLowerCase().includes(searchText) ||
            review.userName.toLowerCase().includes(searchText)
        );
        $('#reviews-container').html(''); // Clear existing reviews
        filteredReviews.forEach(review => renderReview(review));
    }
}

function resetReviews() {
    $('#search-input').val(''); // Clear the search input
    loadAllReviews(); // Reload all reviews
}

function confirmDeleteReview(reviewID) {
    if (confirm("Are you sure you want to delete this review?")) {
        deleteReview(reviewID);
    }
}

function deleteReview(reviewID) {
    $.ajax({
        //url: `https://localhost:7127/api/Review/DeleteReview/${reviewID}`,
        url: `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Review/DeleteReview/${reviewID}`,
        method: 'DELETE',
        success: function () {
            alert('Review deleted successfully');
            loadAllReviews(); // Reload all reviews after deletion
        },
        error: function () {
            alert('Failed to delete review');
        }
    });
}

function toggleLike(reviewID) {
    let isLiked = likedReviews.includes(reviewID);
    let url = isLiked
        ? 'https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Review/RemoveLike?userID=' + loggedInUser.id + '&reviewID=' + reviewID
        : 'https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Review/AddLike?userID=' + loggedInUser.id + '&reviewID=' + reviewID;
        //? 'https://localhost:7127/api/Review/RemoveLike?userID=' + loggedInUser.id + '&reviewID=' + reviewID
        //: 'https://localhost:7127/api/Review/AddLike?userID=' + loggedInUser.id + '&reviewID=' + reviewID;

    $.ajax({
        url: url,
        method: 'POST',
        success: function () {
            let reviewElement = $(`#comments-${reviewID}`).parent();
            let likeButton = reviewElement.find('.like-btn');
            let likeCount = parseInt(likeButton.text().match(/\d+/)[0]); // Extract the current like count

            if (isLiked) {
                likedReviews = likedReviews.filter(id => id !== reviewID);
                likeButton.removeClass('liked').text('Like (' + (likeCount - 1) + ')');
            } else {
                likedReviews.push(reviewID);
                likeButton.addClass('liked').text('Liked (' + (likeCount + 1) + ')');
            }
        }
    });
}

function toggleComments(reviewID) {
    let commentsContainer = $(`#comments-${reviewID}`);
    if (commentsContainer.is(':visible')) {
        commentsContainer.hide();
    } else {
        $.ajax({
            url: 'https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Review/GetReviewComments/' + reviewID,
            //url: 'https://localhost:7127/api/Review/GetReviewComments/' + reviewID,
            method: 'GET',
            success: function (data) {
                commentsContainer.html('');
                data.forEach(comment => {
                    let displayedName = comment.userName === loggedInUser.name ? 'You' : comment.userName;
                    let deleteButton = displayedName === 'You' ?
                        `<button class="delete-btn" onclick="confirmDeleteComment(${reviewID}, '${comment.commentText}')">Delete</button>` : '';

                    let commentHTML = `
                        <li class="comment-list-item">
                            <div class="comment-header">
                                <img src="${comment.userImage}" class="comment-user-image" />
                                <span class="comment-user-name">${displayedName}</span>
                                <span class="comment-date">${new Date(comment.commentDate).toLocaleDateString()}</span>
                            </div>
                            <p class="comment-text">${comment.commentText}</p>
                            ${deleteButton}
                        </li>
                    `;
                    commentsContainer.append(commentHTML);
                });
                commentsContainer.append('<input type="text" id="new-comment-text-' + reviewID + '" class="comment-input" placeholder="Add a comment..." />');
                commentsContainer.append(`<button onclick="addComment(${reviewID})" class="comment-btn">Add Comment</button>`);
                commentsContainer.show();

                // Update the comments count
                let commentCountButton = commentsContainer.siblings('.review-actions').find('.comment-btn');
                let commentCount = data.length; // Update with the new comment count
                commentCountButton.text('Comments (' + commentCount + ')');
            }
        });
    }
}

function confirmDeleteComment(reviewID, commentText) {
    if (confirm("Are you sure you want to delete this comment?")) {
        deleteComment(reviewID, commentText);
    }
}

function deleteComment(reviewID, commentText) {
    $.ajax({
        url: `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Review/RemoveComment?userID=${loggedInUser.id}&reviewID=${reviewID}&commentText=${encodeURIComponent(commentText)}`,
        //url: `https://localhost:7127/api/Review/RemoveComment?userID=${loggedInUser.id}&reviewID=${reviewID}&commentText=${encodeURIComponent(commentText)}`,
        method: 'DELETE',
        success: function () {
            alert('Comment deleted successfully');
            toggleComments(reviewID); // Reload comments
            updateCommentCount(reviewID, -1); // Decrement comment count
        },
        error: function () {
            alert('Failed to delete comment');
        }
    });
}

function addComment(reviewID) {
    let commentText = $(`#new-comment-text-${reviewID}`).val().trim();
    if (commentText) {
        $.ajax({
            url: `https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Review/AddComment?userID=${loggedInUser.id}&reviewID=${reviewID}&comment=${encodeURIComponent(commentText)}`,
            //url: `https://localhost:7127/api/Review/AddComment?userID=${loggedInUser.id}&reviewID=${reviewID}&comment=${encodeURIComponent(commentText)}`,
            method: 'POST',
            success: function () {
                alert('Comment added successfully');
                toggleComments(reviewID); // Reload comments
                updateCommentCount(reviewID, 1); // Increment comment count
            },
            error: function () {
                alert('Failed to add comment');
            }
        });
    } else {
        alert('Comment cannot be empty');
    }
}

function updateCommentCount(reviewID, countChange) {
    let reviewElement = $(`#comments-${reviewID}`).parent();
    let commentCountButton = reviewElement.find('.comment-btn');
    let currentCount = parseInt(commentCountButton.text().match(/\d+/)[0]); // Extract the current comment count
    commentCountButton.text('Comments (' + (currentCount + countChange) + ')');
}