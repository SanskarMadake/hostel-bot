document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const typingIndicator = document.getElementById('typing-indicator');

    // Generate a unique session ID for the user conversation
    let sessionId = sessionStorage.getItem('dialogflow_session_id');
    if (!sessionId) {
        // basic fallback UUID if no uuid library on frontend
        sessionId = crypto.randomUUID ? crypto.randomUUID() : 'session-' + Math.random().toString(36).substring(2);
        sessionStorage.setItem('dialogflow_session_id', sessionId);
    }

    function appendMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message-box ${sender === 'user' ? 'msg-user' : 'msg-bot'}`;
        
        // Basic bold/italic parsing from dialogflow response
        let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedText = formattedText.replace(/\n/g, '<br>');
        
        msgDiv.innerHTML = formattedText;
        chatMessages.insertBefore(msgDiv, typingIndicator);
        scrollToBottom();
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTyping() {
        typingIndicator.style.display = 'inline-flex';
        scrollToBottom();
    }

    function hideTyping() {
        typingIndicator.style.display = 'none';
    }

    async function sendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;

        // Show user message
        appendMessage(text, 'user');
        messageInput.value = '';
        messageInput.focus();

        // Show typing indicator
        showTyping();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: text,
                    sessionId: sessionId
                })
            });

            const data = await response.json();

            hideTyping();

            if (data.reply) {
                appendMessage(data.reply, 'bot');
            } else if (data.error) {
                appendMessage("Sorry, I encountered an error: " + data.error, 'bot');
            } else {
                appendMessage("Sorry, I didn't get that.", 'bot');
            }
        } catch (err) {
            console.error("Error communicating with backend:", err);
            hideTyping();
            appendMessage("Network error. Please try again later.", 'bot');
        }
    }

    sendBtn.addEventListener('click', sendMessage);

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Give focus to input on load
    messageInput.focus();
});
