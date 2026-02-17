const form = document.getElementById('chat-form');
const input = document.getElementById('message');
const chat = document.getElementById('chat');

const addMessage = (role, content) => {
  const el = document.createElement('p');
  el.className = `message ${role}`;
  el.textContent = content;
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
};

addMessage('bot', 'Hi! I can help you explore the universe. Ask me a question 🌠');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const message = input.value.trim();
  if (!message) return;

  addMessage('user', message);
  input.value = '';

  const button = form.querySelector('button');
  button.disabled = true;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    if (!response.ok) {
      addMessage('bot', `Error: ${data.error || 'Unknown error'}`);
      return;
    }

    addMessage('bot', data.reply);
  } catch (error) {
    addMessage('bot', 'Network error. Please try again.');
  } finally {
    button.disabled = false;
    input.focus();
  }
});
