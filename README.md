Hover Search

A small Chrome extension that shows a floating search icon when you hover a word. Click the icon to open a popup window with Google search results for that word.

Install

1. Open Chrome and go to chrome://extensions
2. Enable Developer mode
3. Click "Load unpacked" and select this project folder (`hover-search`)

Google Custom Search API Setup

To show results inside the tab, you need a Google Custom Search API key and a Search Engine ID:

1. Go to https://developers.google.com/custom-search/v1/overview and follow the steps to get an API key.
2. Create a Custom Search Engine (CSE) at https://cse.google.com/cse/all and get your Search Engine ID (CX).
3. In `content.js`, replace `YOUR_API_KEY_HERE` and `YOUR_SEARCH_ENGINE_ID_HERE` with your values.

How it works

- Hover a word, click the search icon, and a modal panel will appear inside the tab with Google search results.
- Results are fetched using the Google Custom Search API and rendered in the panel.
- Click the × button or press Escape to close the panel.
