// app.js
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const chatMessages = document.getElementById('chatMessages');

// Generate a unique session ID for this conversation
const sessionId = 'session-' + Date.now() + '-'
  + Math.random().toString(36).substring(2, 8);

// Send message on button click
sendBtn.addEventListener('click', sendMessage);

// Send message on Enter key
messageInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

async function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;

  // Show user message
  addMessage('user', message);
  messageInput.value = '';
  sendBtn.disabled = true;

  // Show typing indicator
  const typingEl = showTyping();

  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionId,
        message: message,
      }),
    });

    const data = await response.json();

    // Remove typing indicator
    typingEl.remove();

    if (response.ok) {
      if (data.type === 'escalation') {
        addMessage('escalation', data.message);
      } else {
        addMessage('bot', data.message, data.sources);
      }
    } else {
      addMessage('bot', 'Sorry, something went wrong. '
        + 'Please try again.');
    }
  } catch (error) {
    typingEl.remove();
    addMessage('bot', 'Unable to reach the server. '
      + 'Please check your connection.');
  }

  sendBtn.disabled = false;
  messageInput.focus();
}

function addMessage(role, text, sources) {
  const div = document.createElement('div');
  div.className = 'message ' + role;

  const content = document.createElement('div');
  content.className = 'message-content';
  content.textContent = text;
  div.appendChild(content);

  // Add source references for bot messages
  if (sources && sources.length > 0) {
    const sourcesDiv = document.createElement('div');
    sourcesDiv.className = 'sources';

    const label = document.createElement('strong');
    label.textContent = 'Sources:';
    sourcesDiv.appendChild(label);

    sources.forEach(function (source) {
      const item = document.createElement('div');
      item.className = 'source-item';
      item.textContent = source.article
        + ' (relevance: '
        + (source.score * 100).toFixed(0) + '%)';
      sourcesDiv.appendChild(item);
    });

    div.appendChild(sourcesDiv);
  }

  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
  const div = document.createElement('div');
  div.className = 'message bot';

  const content = document.createElement('div');
  content.className = 'message-content';

  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  indicator.innerHTML = '<span></span><span></span><span></span>';

  content.appendChild(indicator);
  div.appendChild(content);
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  return div;
}
