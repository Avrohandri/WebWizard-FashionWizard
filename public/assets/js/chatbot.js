document.addEventListener('DOMContentLoaded', (event) => {
    loadChatHistory();
});

function sendMessage() {
    const userMessage = document.getElementById('chatbot-input').value;
    if (userMessage.trim() === '') return;

    addMessageToChat('user', userMessage);
    document.getElementById('chatbot-input').value = '';

    // Simulate bot response for example purposes
    const botMessage = 'This is a sample response from the bot.';
    setTimeout(() => {
        addMessageToChat('bot', botMessage);
    }, 1000);
}

function addMessageToChat(sender, message) {
    const chatBody = document.getElementById('chatbot-body');
    const messageElement = document.createElement('div');
    messageElement.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
    messageElement.innerText = message;
    chatBody.appendChild(messageElement);
    chatBody.scrollTop = chatBody.scrollHeight;
    saveChatHistory();
}

function saveChatHistory() {
    const chatBody = document.getElementById('chatbot-body');
    localStorage.setItem('chatHistory', chatBody.innerHTML);
}

function loadChatHistory() {
    const chatHistory = localStorage.getItem('chatHistory');
    if (chatHistory) {
        document.getElementById('chatbot-body').innerHTML = chatHistory;
    }
}

function resetChat() {
    localStorage.removeItem('chatHistory');
    document.getElementById('chatbot-body').innerHTML = '<div class="timestamp today">Today</div>';
}

function toggleChatbot() {
    const chatbot = document.getElementById('chatbot');
    chatbot.classList.toggle('open');
}

function toggleVoiceRecognition() {
    // Implement voice recognition toggle logic
}
