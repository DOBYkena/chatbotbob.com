# Floating Chat Bot Widget

A lightweight, embeddable floating chat bot widget for company websites. Built with vanilla HTML, CSS, and JavaScript.

## Features

- Floating balloon icon in the bottom-right corner
- Responsive design for desktop and mobile
- Chat interface with message history, input field, and send button
- Rule-based responses for common queries (products, services, contact, etc.)
- Customizable company name, colors, and API key (for future AI integration)
- Typing indicators and timestamps
- Closes on outside click or close button

## Setup

### Backend (Required for AI Security)
1. Install Node.js if not already installed.
2. Run `npm install` in the project directory.
3. Create a `.env` file and add your OpenAI API key: `OPENAI_API_KEY=your-key-here`
4. Run `npm start` to start the backend server on port 3000.

### Frontend
1. Host `chat-bot.js` on your server (e.g., `https://your-domain.com/chat-bot.js`).
2. Add the embed code to your website (config must be defined before the script tag):

```html
<script>
  window.ChatBotConfig = {
    companyName: 'Your Company Name',
    backendUrl: 'https://your-backend.com', // Your hosted backend URL
    primaryColor: '#007bff',
    language: 'Bosnian' // default language for chat
  };
</script>
<script src="https://your-domain.com/chat-bot.js"></script>
```

The widget also includes a language selector so users can switch between Bosnian, English, and Croatian.

### Iframe Widget (recommended for clients)
If you want your client to embed the bot with minimal code, use the iframe widget route:

```html
<iframe
  src="https://your-domain.com/widget?companyName=Moja+Firma&primaryColor=%23007bff"
  width="400"
  height="600"
  style="border:none;"
></iframe>
```

If you need to pass the backend URL explicitly:

```html
<iframe
  src="https://your-domain.com/widget?companyName=Moja+Firma&backendUrl=https://your-domain.com&primaryColor=%23007bff"
  width="400"
  height="600"
  style="border:none;"
></iframe>
```

The iframe loads the chat widget from your server, so the client does not need your OpenAI key or the full source code.

## AI Integration
- The backend securely calls OpenAI's API with your key from `.env`.
- The bot can use company-specific data from `company-data.json` to answer questions about products, delivery, service, and FAQs.
- Use `companyName` in the API request to select the right company info.
- For production, host the backend on a server (e.g., Heroku, Vercel, or your own VPS).

## Testing company data
- Run `node test_api.js` to send a sample question about the demo electric devices company.
- The backend will include company-specific details from `company-data.json` in the AI prompt.

## Customization

- `companyName`: The name displayed in the chat header.
- `primaryColor`: Hex color code for the bot's theme (icon, header, buttons).
- `apiKey`: Currently not used; reserved for future AI integration.

## Demo

Open `index.html` in a browser to see the demo.

## Browser Compatibility

Tested on Chrome, Firefox, Safari, and Edge.

## Development

- `index.html`: Demo page
- `chat-bot.js`: Main script (includes inlined CSS)
- `chat-bot.css`: Styles (for reference, inlined in JS for embed)

## License

MIT License