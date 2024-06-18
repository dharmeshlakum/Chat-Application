const socket = io();
let activePanel = null;
const token = getCookieValue("Login");
const usernameSpan = document.getElementById("username-span");
const username = usernameSpan.getAttribute("data-username");

// ! Connection event ! //
socket.on("connect", () => {
    socket.emit("register", username);
});

// * Back Button Event For Friends * //
let originalFriendListHTML;
const backBTN = document.getElementById("back-btn");

document.addEventListener("DOMContentLoaded", function () {
    const friendListContainer = document.getElementById("friends-list");
    originalFriendListHTML = friendListContainer.innerHTML;
});

backBTN.addEventListener("click", function (event) {
    const panel = document.querySelector(".chat-pannel-container");

    if (panel.children.length > 0) {
        while (panel.firstChild) {
            panel.firstChild.remove();
        }
    }

    const friendList = document.getElementById("friends-list");
    friendList.innerHTML = originalFriendListHTML;
})

// ? Open chat panel onclick ? //
const friendListContainer = document.getElementById("friends-list");

friendListContainer.addEventListener("click", function (event) {
    const clickedFriend = event.target.closest(".friend");

    if (clickedFriend) {
        const name = clickedFriend.getAttribute("data-username");
        const image = clickedFriend.getAttribute("data-image");
        const displayName = clickedFriend.getAttribute("data-fullName");
        const id = clickedFriend.getAttribute("data-id");

        socket.emit("online", name);
        socket.on("online result", (data) => {
            const onlineStatus = data.success;
            openChatPanel(name, image, displayName, id, onlineStatus);
        })
    }
})

// ! Search Friend Socket Event ! //

const searchForm = document.getElementById("search-friend");

searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const inputField = document.getElementById("search-friend-input");

    if (inputField.value) {
        socket.emit("search friend", {
            input: inputField.value,
            token
        });
        inputField.value = ""
    }
});

socket.on("search result", (data) => {
    if (friendListContainer.children.length === 0) {
        originalFriendListHTML = friendListContainer.innerHTML;
    }

    friendListContainer.innerHTML = ""
    const friendElement = document.createElement("div");

    if (data.success) {
        friendElement.classList.add("friend")
        friendElement.setAttribute("data-fullName", data.fullName);
        friendElement.setAttribute("data-username", data.username)
        friendElement.setAttribute("data-image", data.image);
        friendElement.setAttribute("data-id", data.id)

        const imgElement = document.createElement("img");
        imgElement.src = `/Assets/Profile/${data.image}`

        const usernameElement = document.createElement("p");
        usernameElement.textContent = data.fullName;

        const btnElement = document.createElement("button");
        btnElement.type = "button";
        btnElement.setAttribute("id", "add-btn");
        btnElement.innerHTML = `<button type="button" id="add-btn"><i class="fa-solid fa-plus"></i>`

        friendElement.appendChild(imgElement)
        friendElement.appendChild(usernameElement)


        if (!data.exist) {
            friendElement.appendChild(btnElement);
            btnElement.addEventListener("click", function () {
                socket.emit("add friend", {
                    token,
                    id: data.id
                });
            })
            // ! Event To Add Friend ! //

            socket.on("friend add", (data) => {

                if (data.success) {
                    document.getElementById("add-btn").remove();
                }
            })
        }

    }else{
        const noMatchElement = document.createElement("h3");
        noMatchElement.classList.add("No-Match")
        noMatchElement.textContent = "No Match Found !";    
        friendListContainer.appendChild(noMatchElement);
    }

    friendListContainer.appendChild(friendElement);

});

// * Function To Get Token Value * //
function getCookieValue(cookieName) {
    const name = cookieName + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(";");

    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i].trim();
        if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length, cookie.length);
        }
    }

    return null;
}

// * Function to open chat panel * //
async function openChatPanel(name, image, displayName, id, online) {
    let chatPanel = document.getElementById(`chatPanel_${name}`);

    if (!chatPanel) {
        const existingPanels = document.querySelectorAll('.chat-panel');
        existingPanels.forEach(panel => panel.remove());

        chatPanel = document.createElement("div");
        chatPanel.classList.add("chat-panel");
        chatPanel.setAttribute("id", `chatPanel_${name}`);
        chatPanel.setAttribute("data-username", name);
        chatPanel.setAttribute("data-id", id)
        chatPanel.setAttribute("data-fullName", displayName);

        const friendData = document.createElement("div");
        friendData.classList.add("friend-data");

        const friendImg = document.createElement("img");
        friendImg.src = `/Assets/Profile/${image}`;
        friendImg.alt = "";

        const friendName = document.createElement("a");
        friendName.href = `/user/${name}`;
        friendName.innerText = displayName;

        const onlineStatus = document.createElement("i");
        onlineStatus.classList.add("fa-solid", "fa-circle-dot");

        if (online === true) {
            onlineStatus.classList.add("online");
        }

        friendData.appendChild(friendImg);
        friendData.appendChild(friendName);
        friendData.appendChild(onlineStatus);

        const messages = document.createElement("div");
        messages.classList.add("messages");
        messages.setAttribute("id", `messages_${name}`);

        const chatForm = document.createElement("form");
        chatForm.setAttribute("id", `chat-message-${name}`);

        const chatInput = document.createElement("input");
        chatInput.setAttribute("type", "text");
        chatInput.setAttribute("name", "message");
        chatInput.setAttribute("id", `message-input-${name}`);
        chatInput.setAttribute("placeholder", "Type something here......");

        const chatButton = document.createElement("button");
        chatButton.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';

        chatForm.appendChild(chatInput);
        chatForm.appendChild(chatButton);

        chatPanel.appendChild(friendData);
        chatPanel.appendChild(messages);
        chatPanel.appendChild(chatForm);

        const chatContainer = document.querySelector(".chat-pannel-container");
        if (chatContainer) {
            chatContainer.appendChild(chatPanel);
        }

        // ! Sending Message Event ! //
        chatForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const input = document.getElementById(`message-input-${name}`);

            if (input.value) {

                const type = await isGroupChat(id);
                if (type === "User") {
                    socket.emit("send message", {
                        token,
                        receiver: id,
                        type,
                        message: input.value
                    });
                    input.value = ""

                } else {
                    socket.emit("send message", {
                        token,
                        receiver: id,
                        type,
                        message: input.value
                    })
                    input.value = ""
                }
            }
        });

        activePanel = name;
        await fetchAndDisplayMessages(name);

    } else {
        if (activePanel !== name) {
            activePanel = name;
            await fetchAndDisplayMessages(name)
        }
    }
}

// * Function to fetch message  * //
async function fetchAndDisplayMessages(username) {
    const response = await fetch(`/message?input=${username}`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();

    if (data.success) {
        const messagesDiv = document.getElementById(`messages_${username}`);
        if (!messagesDiv) return;

        messagesDiv.innerHTML = "";
        data.message.forEach((message) => {
            const messageElement = document.createElement("div");
            messageElement.setAttribute("data-message_id", message.id);
            messageElement.classList.add("message-body", message.senderUsername !== username ? "me" : "not");
            messageElement.innerHTML = `
                    <p id="user-message-name">${message.senderUsername === username ? message.senderFullName : "me"}</p>
                    <p id="msg-text">${message.message}</p>
                    <span>${message.time}<i class="fa-solid fa-check"></i></span>
                    <button type="button" class="delete-msg-btn" data-msgID = "${message.id}"><i class="fa-solid fa-trash-can"></i></button>

                `;
            messagesDiv.appendChild(messageElement);
        });
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        // ! Delete message event ! //
        document.querySelectorAll('.delete-msg-btn').forEach(button => {
            button.addEventListener('click', function () {
                const messageId = this.getAttribute('data-msgID');
                socket.emit("delete message", { messageId });
            });
        });

        socket.on("delete success", (data) => {

            if (data.success) {
                const messageElement = document.querySelector(`[data-message_id="${data.messageId}"]`);
                if (messageElement) {
                    messageElement.remove();
                }
            } else {
                console.log("Message delete error");
            }
        })
    } else {
        console.log("Fail to fetch previous message -->", data);
    }
}

// * Function To Check Receiver Type * //
async function isGroupChat(id) {
    const response = await fetch(`/chatType?id=${id}`, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    if (data.success) {
        return data.type;

    } else {
        console.log("Error while finding chat type -->", data.error);
    }
}

// * Client-side code to handle receiving messages * //
socket.on("save message", (data) => {
    if (data.success) {
        const { payload } = data;

        // Determine the correct panel ID
        let panelId;
        if (username === payload.senderUsername) {
            panelId = `messages_${payload.receiverUsername}`;
            console.log(panelId);
        } else if (username === payload.receiverUsername) {
            panelId = `messages_${payload.senderUsername}`;
        }

        const messagesDiv = document.getElementById(panelId);
        if (messagesDiv) {
            const messageElement = document.createElement("div");
            messageElement.setAttribute("data-message_id", payload.id);
            messageElement.classList.add("message-body", username === payload.senderUsername ? "me" : "not");
            messageElement.innerHTML = `
                <p id="user-message-name">${username === payload.senderUsername ? "me" : payload.fullName}</p>
                <p>${payload.message}</p>
                <span>${payload.time}<i class="fa-solid fa-check"></i></span>
                <button type="button" class="delete-msg-btn" data-msgID="${payload.id}"><i class="fa-solid fa-trash-can"></i></button>
            `;
            messagesDiv.appendChild(messageElement);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;

            document.querySelectorAll('.delete-msg-btn').forEach(button => {
                button.addEventListener('click', function () {
                    const messageId = this.getAttribute('data-msgID');
                    socket.emit("delete message", { messageId });
                });
            });

            socket.on("delete success", (data) => {
                if (data.success) {
                    const messageElement = document.querySelector(`[data-message_id="${data.messageId}"]`);
                    if (messageElement) {
                        messageElement.remove();
                    }
                } else {
                    console.log("Message delete error");
                }
            });
        }
    }
});