let recognition;
let recognizing = false;

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'id-ID'; // Set language to Indonesian

    recognition.onstart = function() {
        recognizing = true;
        document.getElementById('voice-btn').textContent = '🛑';
    };

    recognition.onend = function() {
        recognizing = false;
        document.getElementById('voice-btn').textContent = '🎤';
    };

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById('chatbot-input').value = transcript;
        sendMessage();
    };
}

function toggleVoiceRecognition() {
    if (recognizing) {
        recognition.stop();
        return;
    }
    recognition.start();
}

function toggleChatbot() {
    const chatbot = document.getElementById('chatbot');
    const toggleButton = document.getElementById('chatbot-toggle');
    if (chatbot.style.display === 'none' || chatbot.style.display === '') {
        chatbot.style.display = 'flex';
        toggleButton.style.display = 'none';
    } else {
        chatbot.style.display = 'none';
        toggleButton.style.display = 'block';
    }
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function sendMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    if (!message) return;

    const chatBox = document.getElementById('chatbot-body');

    const userMessageWrapper = document.createElement('div');
    userMessageWrapper.className = 'message-wrapper user-wrapper';

    const userMessage = document.createElement('div');
    userMessage.className = 'message user';
    userMessage.innerHTML = `<div class="text">${message}</div>`;
    userMessageWrapper.appendChild(userMessage);

    const userTimestamp = document.createElement('div');
    userTimestamp.className = 'timestamp user-timestamp';
    userTimestamp.textContent = getCurrentTime();
    userMessageWrapper.appendChild(userTimestamp);

    chatBox.appendChild(userMessageWrapper);

    const loadingMessageWrapper = document.createElement('div');
    loadingMessageWrapper.className = 'message-wrapper bot-wrapper';

    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'message bot';
    loadingMessage.innerHTML = `
        <div class="loading-dots">
            <span></span><span></span><span></span>
        </div>`;
    loadingMessageWrapper.appendChild(loadingMessage);

    chatBox.appendChild(loadingMessageWrapper);

    input.value = '';

    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const botMessageWrapper = document.createElement('div');
        botMessageWrapper.className = 'message-wrapper bot-wrapper';

        const botMessage = document.createElement('div');
        botMessage.className = 'message bot';

        // Replace the Markdown link with an HTML anchor element
        const messageWithLink = data.message.replace(
            /\*\*(.*?)\*\*/g, '<strong>$1</strong>' // Bold
        ).replace(
            /\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>' // Links
        );

        botMessage.innerHTML = `<div class="text">${messageWithLink}</div>`;
        botMessageWrapper.appendChild(botMessage);

        // Add product cards if products are available
        if (data.products && data.products.length > 0) {
            data.products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';

                productCard.innerHTML = `
                    <div class="product-image">
                        <img src="assets/images/products/${product.image}" alt="${product.name}" />
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p>${product.price}</p>
                        <a href="${product.link}" class="product-link">Visit Product</a>
                    </div>
                `;

                botMessageWrapper.appendChild(productCard);
            });
        }

        loadingMessageWrapper.replaceWith(botMessageWrapper); // Replace loading animation with bot message

        const botTimestamp = document.createElement('div');
        botTimestamp.className = 'timestamp bot-timestamp';
        botTimestamp.textContent = getCurrentTime();
        botMessageWrapper.appendChild(botTimestamp);

        chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom

        saveChatHistory(); // Save chat history after receiving bot response
    } catch (error) {
        console.error('Error:', error);
        const errorMessageWrapper = document.createElement('div');
        errorMessageWrapper.className = 'message-wrapper bot-wrapper';
        const errorMessage = document.createElement('div');
        errorMessage.className = 'message bot';
        errorMessage.innerHTML = `<div class="text">Sorry, something went wrong. Please try again later.</div>`;
        errorMessageWrapper.appendChild(errorMessage);

        const errorTimestamp = document.createElement('div');
        errorTimestamp.className = 'timestamp bot-timestamp';
        errorTimestamp.textContent = getCurrentTime();
        errorMessageWrapper.appendChild(errorTimestamp);

        loadingMessageWrapper.replaceWith(errorMessageWrapper); // Replace loading animation with error message

        chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
    }
}

function resetChat() {
    localStorage.removeItem('chatHistory');
    document.getElementById('chatbot-body').innerHTML = '<div class="timestamp today">Today</div>';
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

document.getElementById('chatbot-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadChatHistory();
    document.getElementById('chatbot').style.display = 'none'; // Ensure the chatbot starts hidden
    document.getElementById('chatbot-toggle').style.display = 'block'; // Ensure the toggle button starts visible
});
