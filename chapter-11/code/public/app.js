// app.js
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const uploadBtn = document.getElementById('uploadBtn');
const uploadStatus = document.getElementById('uploadStatus');
const fileInfo = document.getElementById('fileInfo');
const questionInput = document.getElementById('questionInput');
const askBtn = document.getElementById('askBtn');
const chatMessages = document.getElementById('chatMessages');

let selectedFile = null;

// Handle file selection
fileInput.addEventListener('change', function () {
  if (this.files.length > 0) {
    selectedFile = this.files[0];
    fileInfo.textContent = selectedFile.name
      + ' (' + formatSize(selectedFile.size) + ')';
    uploadBtn.disabled = false;
  }
});

// Handle drag and drop
uploadArea.addEventListener('dragover', function (e) {
  e.preventDefault();
  this.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', function () {
  this.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', function (e) {
  e.preventDefault();
  this.classList.remove('drag-over');

  if (e.dataTransfer.files.length > 0) {
    selectedFile = e.dataTransfer.files[0];
    fileInfo.textContent = selectedFile.name
      + ' (' + formatSize(selectedFile.size) + ')';
    uploadBtn.disabled = false;
  }
});

// Upload button click handler
uploadBtn.addEventListener('click', async function () {
  if (!selectedFile) return;

  showStatus('processing', 'Processing document... This may take a moment.');
  uploadBtn.disabled = true;

  const formData = new FormData();
  formData.append('document', selectedFile);

  try {
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      showStatus('success',
        'Document processed: ' + data.chunks + ' chunks created and stored.');
      questionInput.disabled = false;
      askBtn.disabled = false;
      questionInput.focus();
    } else {
      showStatus('error', 'Error: ' + data.error);
      uploadBtn.disabled = false;
    }
  } catch (error) {
    showStatus('error', 'Failed to upload. Check if the server is running.');
    uploadBtn.disabled = false;
  }
});

// Ask button click handler
askBtn.addEventListener('click', sendQuestion);

// Handle Enter key in question input
questionInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    sendQuestion();
  }
});

async function sendQuestion() {
  const question = questionInput.value.trim();
  if (!question) return;

  // Show user message
  addMessage('user', question);
  questionInput.value = '';
  askBtn.disabled = true;

  // Show typing indicator
  const typingId = addMessage('assistant', 'Thinking...');

  try {
    const response = await fetch('/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: question }),
    });

    const data = await response.json();

    // Remove typing indicator
    removeMessage(typingId);

    if (response.ok) {
      addMessage('assistant', data.answer, data.sources);
    } else {
      addMessage('assistant', 'Error: ' + data.error);
    }
  } catch (error) {
    removeMessage(typingId);
    addMessage('assistant', 'Failed to get answer. Please try again.');
  }

  askBtn.disabled = false;
  questionInput.focus();
}

function addMessage(role, text, sources) {
  const id = 'msg-' + Date.now();
  const div = document.createElement('div');
  div.className = 'message ' + role;
  div.id = id;

  const label = document.createElement('div');
  label.className = 'label';
  label.textContent = role === 'user' ? 'You' : 'Assistant';
  div.appendChild(label);

  const content = document.createElement('div');
  content.textContent = text;
  div.appendChild(content);

  // Add source references if available
  if (sources && sources.length > 0) {
    const sourcesDiv = document.createElement('div');
    sourcesDiv.className = 'sources';

    const sourcesLabel = document.createElement('strong');
    sourcesLabel.textContent = 'Sources:';
    sourcesDiv.appendChild(sourcesLabel);

    sources.forEach(function (source, i) {
      const item = document.createElement('div');
      item.className = 'source-item';
      item.textContent = 'Chunk ' + source.chunkIndex
        + ' (relevance: ' + (source.score * 100).toFixed(1) + '%): '
        + source.preview;
      sourcesDiv.appendChild(item);
    });

    div.appendChild(sourcesDiv);
  }

  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  return id;
}

function removeMessage(id) {
  const msg = document.getElementById(id);
  if (msg) msg.remove();
}

function showStatus(type, message) {
  uploadStatus.className = 'status ' + type;
  uploadStatus.textContent = message;
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
