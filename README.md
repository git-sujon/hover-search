Quick Search

A Chrome extension that shows a floating search icon when you select text on any webpage. Click the icon to open a modal with Google search results for the selected text.

Install

1. Open Chrome and go to chrome://extensions
2. Enable Developer mode
3. Click "Load unpacked" and select this project folder (`quick-search`)

Google Custom Search API Setup

To show results inside the tab, you need a Google Custom Search API key and a Search Engine ID:

1. Go to https://developers.google.com/custom-search/v1/overview and follow the steps to get an API key.
2. Create a Custom Search Engine (CSE) at https://cse.google.com/cse/all and get your Search Engine ID (CX).
3. In `content.js`, replace the empty `API_KEY` and `CX` values with your credentials.

How it works

- Select any text on a webpage and a search icon will appear next to your selection.
- Click the search icon to open a modal panel with Google search results including thumbnails, ratings, and rich metadata when available.
- Switch between modal and sidebar view using the toggle button.
- Close the panel by clicking the × button, pressing Escape, or clicking outside the modal.
