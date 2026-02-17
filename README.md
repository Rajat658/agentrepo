# Universe Chatbot App

A simple OpenAI-powered chatbot app focused on questions about the universe (astronomy + cosmology).

## Features

- Universe-focused assistant behavior via system prompt
- Clean chat interface
- Lightweight Node.js backend + OpenAI API integration

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment:

   ```bash
   cp .env.example .env
   ```

   Add your `OPENAI_API_KEY` to `.env`.

3. Run the app:

   ```bash
   npm start
   ```

4. Open <http://localhost:3000>

## Notes

- You can change model with `OPENAI_MODEL`.
- Default model is `gpt-4o-mini`.
