let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
let port = "7127";
const container = document.getElementById('requestsContainer');
let friendsArray = [];
let friendRequestsSentArray = [];
let friendRequestsReceivedArray = [];
let allUsersArray = [];

window.onload = function () {
    // Load Friends
    loadFriends();
    // Load all users for search
    loadAllUsers();
};

function loadFriends() {
    fetch(`https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/GetAllUserFriends/${loggedInUser.id}`)
    //fetch(`https://localhost:${port}/api/User/GetAllUserFriends/${loggedInUser.id}`)
        .then(response => response.json())
        .then(data => {
            friendsArray = data;
            renderFriends();
        })
        .catch(error => console.error('Error:', error));
}

function renderFriends() {
    const container = document.getElementById('friendsContainer');
    container.innerHTML = '';
    if (friendsArray.length === 0) {
        container.innerHTML = '<p>You have no friends.</p>';
    } else {
        friendsArray.forEach(friend => {
            const friendCard = document.createElement('div');
            friendCard.classList.add('friend-card');
            friendCard.innerHTML = `
                                        <img src="${friend.image}" alt="User Image">
                                        <div class="name">Name: ${friend.name}</div>
                                        <div>Email: ${friend.email}</div>
                                        <div>Friends count: ${friend.friendsCount}</div>
                                        <div class="status"><span class="${friend.isActive ? 'online' : 'offline'}">${friend.isActive ? 'Online' : 'Offline'}</span></div>
                                        <button style="background-color: blue;" onclick="seeBooks(${friend.id}, '${friend.name}')">See ${friend.name}'s Books</button>
                                        <button style="background-color: blue;" onclick="openChat(${friend.id}, '${friend.name}')">Chat</button>
                                        <button onclick="removeFriend(${friend.id})">Remove Friend</button>
                                    `;
            container.appendChild(friendCard);
        });
    }
}

function openChat(friendId, friendName) {
    fetch(`https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Chat/GetAllMessagesBetweenUsers/${loggedInUser.id}/${friendId}`)
    //fetch(`https://localhost:${port}/api/Chat/GetAllMessagesBetweenUsers/${loggedInUser.id}/${friendId}`)
        .then(response => response.json())
        .then(messages => {
            if (messages.length === 0) {
                renderChatModal(friendName, friendId, [], `Start chatting with ${friendName}!`);
            } else {
                renderChatModal(friendName, friendId, messages);
            }
        })
        .catch(error => console.error('Error fetching messages:', error));
}

let friendName1;
let freindId1;
function renderChatModal(friendName, friendId, messages, placeholderText = '') {
    const modal = document.getElementById('chatModal');
    const modalContent = modal.querySelector('.Chatmodal-content');
    friendName1 = friendName;
    freindId1 = friendId;

    if (!modalContent) {
        console.error('Modal content element not found.');
        return;
    }

    const headerTitle = document.getElementById('chatHeaderTitle');

    if (!headerTitle) {
        console.error('Chat header title element not found.');
        return;
    }

    headerTitle.innerText = friendName;

    modalContent.innerHTML = `
        <div class="chat-header">
            <h2 id="chatHeaderTitle">${friendName}</h2>
            <button class="close-btn" onclick="closeModal('chatModal')">Close</button>
        </div>
        <div class="chat-body">
            ${messages.length === 0 ? `<p>${placeholderText}</p>` : messages.map(renderMessage).join('')}
        </div>
        <div class="chat-footer">
            <input type="text" id="messageInput" placeholder="Type a message...">
            <button onclick="sendMessage(${friendId})">Send</button>
        </div>
    `;

    modal.style.display = 'block';
}


function renderMessage(message) {
    const isSender = message.senderId === loggedInUser.id;
    const messageClass = isSender ? 'message-sent' : 'message-received';
    const messageDate = new Date(message.sentAt).toLocaleString();

    return `
        <div class="${messageClass}">
            <div class="message-content">
                <p>${message.messageText}</p>
                <span class="message-date">${messageDate}</span>
            </div>
            ${isSender ? `<button style="background-color:red" onclick="deleteMessage(${message.id})">Delete</button>` : ''}
        </div>
    `;
}


function deleteMessage(messageId) {
    if (confirm('Do you want to delete this message?')) {
        fetch(`https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Chat/DeleteMessage/${messageId}?userId=${loggedInUser.id}`, {
        //fetch(`https://localhost:7127/api/Chat/DeleteMessage/${messageId}?userId=${loggedInUser.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        })
            .then(response => {
                if (!response.ok) {
                    thrownewError('Network response was not ok.');
                }
            })
            .then(() => {
                openChat(freindId1, friendName1);
            })
            .catch(error => console.error('Error:', error));
    }
}


function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

//let socket;

//function initWebSocket() {
//    // Correct WebSocket constructor
//    socket = new WebSocket(`ws://localhost:${port}/ws/chat`);

//    socket.onmessage = function (event) {
//        const message = JSON.parse(event.data);
//        displayIncomingMessage(message);
//    };

//    socket.onclose = function () {
//        console.log('WebSocket connection closed');
//    };
//}

//window.onload = initWebSocket;

function sendMessage(receiverId) {
    const messageInput = document.getElementById('messageInput');
    const messageText = messageInput.value.trim();

    if (messageText) {
        const message = {
            senderId: loggedInUser.id,
            receiverId: receiverId,
            messageText: messageText
        };

        //fetch(`https://localhost:${port}/api/Chat/SendMessage?senderId=${message.senderId}&receiverId=${message.receiverId}&messageText=${message.messageText}`, {
        fetch(`https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/Chat/SendMessage?senderId=${message.senderId}&receiverId=${message.receiverId}&messageText=${message.messageText}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(message)
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { thrownewError(text); });
                }
                return response.text();  // Use text() to handle non-JSON responses
            })
            .then(data => {
                console.log('Message sent successfully:', data);

                openChat(receiverId, friendName1);
            })
            .catch(error => {
                console.error('Error sending message:', error);
            });

        // Clear the input field
        messageInput.value = '';
    }
}


//function displayIncomingMessage(message) {
//    const chatBody = document.querySelector('.chat-body');

//    // Add the new message to the chat body
//    chatBody.innerHTML += renderMessage(message);

//    // Scroll to the bottom of the chat
//    chatBody.scrollTop = chatBody.scrollHeight;  // Scroll to the bottom
//}


//function sendMessage(receiverId) {
//    const messageInput = document.getElementById('messageInput');
//    const messageText = messageInput.value.trim();

//    if (messageText) {
//        const message = {
//            senderId: loggedInUser.id,
//            receiverId: receiverId,
//            text: messageText
//        };

//        //socket.send(JSON.stringify(message));

//        messageInput.value = '';  // Clear the input
//    }
//}

//function displayIncomingMessage(message) {
//    const chatBody = document.querySelector('.chat-body');
//    chatBody.innerHTML += renderMessage(message);
//    chatBody.scrollTop = chatBody.scrollHeight;  // Scroll to the bottom
//}

function seeBooks(friendId, friendName) {
    fetch(`https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/GetAllBooksForUser/${friendId}`)
    //fetch(`https://localhost:${port}/api/User/GetAllBooksForUser/${friendId}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data)) {
                if (data.length === 0) {
                    showModal(`Books for ${friendName}`, []);
                } else {
                    showModal(`Books for ${friendName}`, data);
                }
            } else {
                console.error('Fetched data is not an array:', data);
                showModal(`Books for ${friendName}`, []);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showModal(`Books for ${friendName}`, []);
        });
}



function removeFriend(friendId) {
    if (confirm('Are you sure you want to remove this friend? You wont be able to chat with them or see their books!')) {
        //fetch(`https://localhost:${port}/api/User/RemoveFriend?userID=${loggedInUser.id}&removedUserID=${friendId}`, { method: 'DELETE' })
        fetch(`https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/RemoveFriend?userID=${loggedInUser.id}&removedUserID=${friendId}`, { method: 'DELETE' })
            .then(response => {
                if (response.ok) {
                    alert('Friend removed successfully.');
                    loadFriends();
                }
            })
            .catch(error => console.error('Error:', error));
    }
}

function loadAllUsers() {
    //fetch(`https://localhost:${port}/api/User/GetAllUsers`)
    fetch(`https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/GetAllUsers`)
        .then(response => response.json())
        .then(data => {
            allUsersArray = data;
        })
        .catch(error => console.error('Error:', error));
}

function searchUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const results = allUsersArray.filter(user => user.name.toLowerCase().includes(searchTerm));
    renderSearchResults(results);
}

function renderSearchResults(results) {
    const container = document.getElementById('friendsContainer');
    container.innerHTML = '';
    results.forEach(user => {
        if (user.name === loggedInUser.name) return;

        const userCard = document.createElement('div');
        userCard.classList.add('friend-card');
        let actionButton = '';

        if (friendsArray.some(friend => friend.id === user.id)) {
            actionButton = `<button onclick="removeFriend(${user.id})">Remove Friend</button>`;
        } else if (friendRequestsSentArray.some(request => request.receiverID === user.id)) {
            actionButton = `<button onclick="cancelFriendRequest(${user.id})">Cancel Request</button>`;
        } else if (friendRequestsReceivedArray.some(request => request.senderID === user.id)) {
            actionButton = `
                                <button class="accept-button" onclick="acceptFriendRequest(${user.id})">Accept Request</button>
                                <button class="deny-button" onclick="denyFriendRequest(${user.id})">Deny Request</button>
                                    `;
        } else {
            actionButton = `<button onclick="sendFriendRequest(${user.id})">Send Friend Request</button>`;
        }

        userCard.innerHTML = `
                                    <img src="${user.image}" alt="User Image">
                                    <div class="name">${user.name}</div>
                                    ${actionButton}
                                `;
        container.appendChild(userCard);
    });
}

function sendFriendRequest(receiverId) {
    fetch(`https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/SendFriendRequest?senderID=${loggedInUser.id}&receiverID=${receiverId}`, { method: 'POST' })
    //fetch(`https://localhost:${port}/api/User/SendFriendRequest?senderID=${loggedInUser.id}&receiverID=${receiverId}`, { method: 'POST' })
        .then(response => {
            if (response.ok) {
                alert('Friend request sent successfully.');
                // Update friendRequestsSentArray
                friendRequestsSentArray.push({ receiverID: receiverId });
                // Update UI
                updateUserInterface();
            }
        })
        .catch(error => console.error('Error:', error));
}

function updateUserInterface() {
    // Call renderSearchResults to update UI based on new arrays
    renderSearchResults(allUsersArray);
}

function acceptFriendRequest(senderId) {
    if (confirm('Are you sure you want to accept this friend request?')) {
        fetch(`https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/AcceptFriendRequest?senderID=${senderId}&receiverID=${loggedInUser.id}`, { method: 'POST' })
        //fetch(`https://localhost:${port}/api/User/AcceptFriendRequest?senderID=${senderId}&receiverID=${loggedInUser.id}`, { method: 'POST' })
            .then(response => {
                if (response.ok) {
                    alert('Friend request accepted.');
                    // Update friendsArray and remove from friendRequestsReceivedArray
                    friendsArray.push({ id: senderId }); // Or fetch updated friend data
                    friendRequestsReceivedArray = friendRequestsReceivedArray.filter(request => request.senderID !== senderId);
                    // Reload friends and received requests
                    loadFriends();
                    updateUserInterface();
                }
            })
            .catch(error => console.error('Error:', error));
    }
}

function cancelFriendRequest(receiverId) {
    if (confirm('Are you sure you want to cancel this friend request?')) {
        fetch(`https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/CancelFriendRequest?senderID=${loggedInUser.id}&receiverID=${receiverId}`, { method: 'DELETE' })
        //fetch(`https://localhost:${port}/api/User/CancelFriendRequest?senderID=${loggedInUser.id}&receiverID=${receiverId}`, { method: 'DELETE' })
            .then(response => {
                if (response.ok) {
                    alert('Friend request canceled.');
                    // Remove request from friendRequestsSentArray
                    friendRequestsSentArray = friendRequestsSentArray.filter(request => request.receiverID !== receiverId);
                    // Update UI
                    updateUserInterface();
                }
            })
            .catch(error => console.error('Error:', error));
    }
}

function denyFriendRequest(senderId) {
    if (confirm('Are you sure you want to deny this friend request?')) {
        fetch(`https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/DenyFriendRequest?senderID=${senderId}&receiverID=${loggedInUser.id}`, { method: 'POST' })
        //fetch(`https://localhost:${port}/api/User/DenyFriendRequest?senderID=${senderId}&receiverID=${loggedInUser.id}`, { method: 'POST' })
            .then(response => {
                if (response.ok) {
                    alert('Friend request denied.');
                    // Remove from friendRequestsReceivedArray
                    friendRequestsReceivedArray = friendRequestsReceivedArray.filter(request => request.senderID !== senderId);
                    // Update UI
                    updateUserInterface();
                }
            })
            .catch(error => console.error('Error:', error));
    }
}

function showModal(title, books) {
    const modal = document.getElementById('myModal');
    const modalContent = document.getElementById('modalContent');

    let contentHtml = `<h2>${title}</h2>`;

    if (books.length === 0) {
        contentHtml += '<p>No books available.</p>';
    } else {
        contentHtml += books.map(book => `
                <div class="book-details">
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
            `).join('');
    }

    modalContent.innerHTML = contentHtml;
    modal.style.display = 'block';

    const span = document.getElementsByClassName('close')[0];
    span.onclick = function () {
        modal.style.display = 'none';
    }
}

// Load friends when "Show All Friends" button is clicked
document.getElementById('btnShowAllFriends').onclick = function () {
    clearContainers();
    loadFriends();
};

// Load sent friend requests when "Friend Requests Sent" button is clicked
document.getElementById('btnFriendRequestsSent').onclick = function () {
    clearContainers();
    fetch(`https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/GetAllUserFriendRequestsSent/${loggedInUser.id}`)
    //fetch(`https://localhost:${port}/api/User/GetAllUserFriendRequestsSent/${loggedInUser.id}`)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                container.innerHTML = '<p>You have no Friend Requests Sent.</p>';
                return;
            }
            friendRequestsSentArray = data;
            renderSentRequests(friendRequestsSentArray);
        })
        .catch(error => console.error('Error:', error));
};

// Load received friend requests when "Friend Requests Received" button is clicked
document.getElementById('btnFriendRequestsReceived').onclick = function () {
    clearContainers();
    fetch(`https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/GetAllUserFriendRequests/${loggedInUser.id}`)
    //fetch(`https://localhost:${port}/api/User/GetAllUserFriendRequests/${loggedInUser.id}`)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                container.innerHTML = '<p>You have no Friend Requests Received.</p>';
                return;
            }
            friendRequestsReceivedArray = data;
            renderReceivedRequests(friendRequestsReceivedArray);
        })
        .catch(error => console.error('Error:', error));
};

function clearContainers() {
    document.getElementById('requestsContainer').innerHTML = '';
    document.getElementById('friendsContainer').innerHTML = '';
}

// Function to render sent friend requests
function renderSentRequests(requests) {
    const container = document.getElementById('requestsContainer');
    container.innerHTML = ''; // Clear previous content

    requests.forEach(request => {
        const requestDiv = document.createElement('div');
        requestDiv.className = 'request-item';

        // User image
        const img = document.createElement('img');
        img.src = request.receiverImage;
        img.alt = `${request.receiverName}'s profile picture`;
        img.className = 'small-circle';

        // User name
        const name = document.createElement('span');
        name.textContent = request.receiverName;

        // Cancel Request button
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel Request';
        cancelButton.className = 'cancel-button'; // Apply styling
        cancelButton.onclick = function () {
            if (confirm(`Are you sure you want to cancel the friend request to ${request.receiverName}?`)) {
                //fetch(`https://localhost:${port}/api/User/CancelFriendRequest?senderID=${loggedInUser.id}&receiverID=${request.receiverID}`, {
                fetch(`https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/CancelFriendRequest?senderID=${loggedInUser.id}&receiverID=${request.receiverID}`, {
                    method: 'DELETE'
                })
                    .then(response => {
                        if (response.ok) {
                            alert('Friend request canceled.');
                            // remove the request from the UI
                            requestDiv.remove();
                            // Remove request from friendRequestsSentArray
                            let request1 = request;
                            friendRequestsSentArray = friendRequestsSentArray.filter(request => request.receiverID !== request1.receiverId);
                            // Update UI
                            updateUserInterface();
                        } else {
                            console.error('Failed to cancel friend request:', response.statusText);
                        }
                    })
                    .catch(error => console.error('Error:', error));
            }
        };

        requestDiv.appendChild(img);
        requestDiv.appendChild(name);
        requestDiv.appendChild(cancelButton);
        container.appendChild(requestDiv);
    });
}


// Function to render received friend requests
function renderReceivedRequests(requests) {
    const container = document.getElementById('requestsContainer');
    container.innerHTML = ''; // Clear previous content

    requests.forEach(request => {
        const requestDiv = document.createElement('div');
        requestDiv.className = 'request-item';

        // User image
        const img = document.createElement('img');
        img.src = request.senderImage;
        img.alt = `${request.senderName}'s profile picture`;
        img.className = 'small-circle';

        // User name
        const name = document.createElement('span');
        name.textContent = request.senderName;

        // Accept button
        const acceptButton = document.createElement('button');
        acceptButton.className = 'accept-button';
        acceptButton.textContent = 'Accept';
        acceptButton.onclick = function () {
            if (confirm(`Are you sure you want to accept the friend request from ${request.senderName}?`)) {
                //fetch(`https://localhost:${port}/api/User/AcceptFriendRequest?senderID=${request.senderID}&receiverID=${loggedInUser.id}`, {
                fetch(`https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/AcceptFriendRequest?senderID=${request.senderID}&receiverID=${loggedInUser.id}`, {
                    method: 'POST'
                })
                    .then(() => {
                        alert('Friend request accepted.');
                        // Optionally remove the request from the UI
                        requestDiv.remove();
                    })
                    .catch(error => console.error('Error:', error));
            }
        };

        // Deny button
        const denyButton = document.createElement('button');
        denyButton.className = 'deny-button';
        denyButton.textContent = 'Deny';
        denyButton.onclick = function () {
            if (confirm(`Are you sure you want to deny the friend request from ${request.senderName}?`)) {
                //fetch(`https://localhost:${port}/api/User/DenyFriendRequest?senderID=${request.senderID}&receiverID=${loggedInUser.id}`, {
                fetch(`https://proj.ruppin.ac.il/cgroup88/test2/tar1/api/User/DenyFriendRequest?senderID=${request.senderID}&receiverID=${loggedInUser.id}`, {
                    method: 'POST'
                })
                    .then(() => {
                        alert('Friend request denied.');
                        // Optionally remove the request from the UI
                        requestDiv.remove();
                    })
                    .catch(error => console.error('Error:', error));
            }
        };

        requestDiv.appendChild(img);
        requestDiv.appendChild(name);
        requestDiv.appendChild(acceptButton);
        requestDiv.appendChild(denyButton);
        container.appendChild(requestDiv);
    });
}

document.getElementById('searchButton').onclick = function () {
    searchUsers();
};