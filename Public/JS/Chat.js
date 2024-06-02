const friendList = document.getElementById("friendList");
const chatPanelContainer = document.getElementById("chatPanelContainer");
const searchForm = document.getElementById("search-friend");

const token = document.cookie.split("=")[1];
const socket = io();
let registeredUsers = new Set();

//Search Friend
searchForm.addEventListener("submit", (Event) => {
    Event.preventDefault();
    const serachInput = document.getElementById("searchFriendInput");

    if (serachInput.value) {
        socket.emit("search friend", { query: serachInput.value, token });
        serachInput.value = "";
    }
})

friendList.addEventListener("click", (Event) => {
    const clickedFriend = Event.target;
    if (clickedFriend.classList.contains("friend")) {
        const username = clickedFriend.getAttribute("data-username");
        openChatPanel(username);
    }
});

async function openChatPanel(username) {

    let chatPanel = document.getElementById(`chatPanel_${username}`);
    if (!chatPanel) {

        if (!registeredUsers.has(username)) {
            socket.emit("register", username);
            registeredUsers.add(username)
        }

        chatPanel = document.createElement("div");
        chatPanel.id = `chatPanel_${username}`;
        chatPanel.classList.add('chat-messages');
        chatPanel.innerHTML = `
            <h2>Chat with ${username}</h2>
            <div id="messages_${username}" class="messages"></div>
            <form id="messageForm_${username}" action="#" class="input-container">
                <input type="text" id="messageInput_${username}" placeholder="Type your message...">
                <button type="submit">Send</button>
            </form>
        `;
        chatPanelContainer.appendChild(chatPanel);

        const messageForm = document.getElementById(`messageForm_${username}`);
        messageForm.addEventListener('submit', (Event) => {
            Event.preventDefault();
            sendMessage(username);
        });
    }

    try {
        const respose = await fetch(`/messages?user=${username}`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await respose.json();

        if (data.success) {
            const messagesDiv = document.getElementById(`messages_${username}`);
            messagesDiv.innerHTML = '';
            data.message.forEach((message) => {
                const messageElement = document.createElement('div');
                messageElement.classList.add('message', message.username !== username ? 'me' : 'friend');
                messageElement.innerHTML = `
                    <span class="sender">${message.username !== username ? 'Me' : message.username}:</span>
                    <div class="message-body">${message.message}</div>
                `;

                messagesDiv.appendChild(messageElement);
            });

            messagesDiv.scrollTop = messagesDiv.scrollHeight;

        } else {
            console.log("Error While Fatching Messages", error);
        }

    } catch (error) {
        console.error('Error fetching messages:', error);
    }
}

socket.on("search friend output", (data) => {

    if (data.success) {
        const friend = data.friend;

        friendList.innerHTML = "";
        const friendElement = document.createElement('div');
        friendElement.classList.add('friend');
        friendElement.setAttribute('data-username', friend.username);
        friendElement.textContent = friend.username;
        friendList.appendChild(friendElement);

        friendElement.addEventListener('click', () => {
            openChatPanel(friend.username);
        });

    } else {
        friendList.innerHTML = "No Match Found !"
    }
});

function sendMessage(username) {
    const messageInput = document.getElementById(`messageInput_${username}`);
    const message = messageInput.value.trim();

    if (message !== '') {
        const messagesDiv = document.getElementById(`messages_${username}`);
        const newMessage = document.createElement('div');
        newMessage.classList.add('message', 'me');
        newMessage.innerHTML = `
            <span class="sender">Me:</span>
            <div class="message-body">${message}</div>
        `;
        messagesDiv.appendChild(newMessage);

        socket.emit("message", {
            to: username,
            message: message,
            token: token
        });
        messageInput.value = '';
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

}

socket.on("new Message", (data) => {
    const username = data.from;
    const chatPanel = document.getElementById(`chatPanel_${username}`);

    if (chatPanel) {
        const messagesDiv = document.getElementById(`messages_${username}`);
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'friend');
        messageElement.innerHTML = `
            <span class="sender">${username}:</span>
            <div class="message-body">${data.message}</div>
        `;
        messagesDiv.appendChild(messageElement);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

    }
});