// content script: show a small search icon when hovering words
(function(){
  const MIN_LENGTH = 2; // minimum chars to search
  const HOVER_DELAY = 300; // ms delay before showing button
  let lastWord = '';
  let hoverTimeout = null;
  let button = null;
  let hoveredWords = new Set(); // Use Set to avoid duplicates
  let wordIndicators = new Map(); // Track visual indicators for hovered words

  function createButton() {
    if (document.getElementById('hover-search-button-xyz')) {
      button = document.getElementById('hover-search-button-xyz');
      return;
    }
    button = document.createElement('button');
    button.id = 'hover-search-button-xyz';
    button.style.position = 'absolute';
    button.style.zIndex = 2147483647;
    button.style.width = '36px';
    button.style.height = '36px';
    button.style.borderRadius = '50%';
    button.style.border = 'none';
    button.style.background = 'linear-gradient(135deg, #4285f4, #34a853)';
    button.style.boxShadow = '0 4px 12px rgba(66, 133, 244, 0.3)';
    button.style.display = 'none';
    button.style.padding = '0';
    button.style.cursor = 'pointer';
    button.style.transition = 'all 0.2s ease';
    button.style.opacity = '0';
    button.style.transform = 'scale(0.8)';
    button.title = `Search: ${Array.from(hoveredWords).join(' ')}`;

    const img = document.createElement('img');
    img.src = chrome.runtime.getURL('icons/icon16.png');
    img.style.width = '20px';
    img.style.height = '20px';
    img.style.margin = '8px';
    img.style.filter = 'brightness(0) invert(1)';
    button.appendChild(img);

    // Add word count badge
    const badge = document.createElement('div');
    badge.id = 'word-count-badge';
    badge.style.position = 'absolute';
    badge.style.top = '-6px';
    badge.style.right = '-6px';
    badge.style.background = '#ea4335';
    badge.style.color = 'white';
    badge.style.borderRadius = '50%';
    badge.style.width = '18px';
    badge.style.height = '18px';
    badge.style.fontSize = '10px';
    badge.style.fontWeight = 'bold';
    badge.style.display = 'flex';
    badge.style.alignItems = 'center';
    badge.style.justifyContent = 'center';
    badge.style.fontFamily = 'sans-serif';
    button.appendChild(badge);

    document.documentElement.appendChild(button);

    // Hover effects
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.1)';
      button.style.boxShadow = '0 6px 16px rgba(66, 133, 244, 0.4)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 4px 12px rgba(66, 133, 244, 0.3)';
    });

    button.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      // Use all hovered words/phrases as a single search query
      const query = Array.from(hoveredWords).join(' ');
      if (query && query.length >= MIN_LENGTH) {
        showSearchPanel(query);
        hideButton();
        clearHoveredWords();
      }
    });

    // keyboard accessibility
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        button.click();
      }
    });
  }

  // --- Modal panel for search results ---
  // Show search panel in modal or sidebar mode
  function showSearchPanel(query) {
    removeSearchPanel();
    // Get mode from storage (default: modal)
    chrome.storage && chrome.storage.local.get({hoverSearchMode: 'modal'}, (data) => {
      const mode = data.hoverSearchMode || 'modal';
      renderSearchPanel(query, mode);
    });
  }

  function clearHoveredWords() {
    hoveredWords.clear();
    // Remove all word indicators
    wordIndicators.forEach(indicator => {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    });
    wordIndicators.clear();
  }

  function addWordIndicator(element, word) {
    if (wordIndicators.has(word)) return;
    
    const indicator = document.createElement('div');
    indicator.style.position = 'absolute';
    indicator.style.background = 'rgba(66, 133, 244, 0.2)';
    indicator.style.border = '1px solid #4285f4';
    indicator.style.borderRadius = '3px';
    indicator.style.pointerEvents = 'none';
    indicator.style.zIndex = '2147483646';
    indicator.style.transition = 'all 0.2s ease';
    
    const rect = element.getBoundingClientRect();
    indicator.style.left = (rect.left + window.scrollX) + 'px';
    indicator.style.top = (rect.top + window.scrollY) + 'px';
    indicator.style.width = rect.width + 'px';
    indicator.style.height = rect.height + 'px';
    
    document.body.appendChild(indicator);
    wordIndicators.set(word, indicator);
  }

  function renderSearchPanel(query, mode) {
    removeSearchPanel();
    const panel = document.createElement('div');
    panel.id = 'hover-search-modal-panel';
    panel.style.position = 'fixed';
    panel.style.zIndex = 2147483647;
    panel.style.background = 'white';
    panel.style.boxShadow = '0 2px 16px rgba(0,0,0,0.25)';
    panel.style.fontFamily = 'sans-serif';
    panel.style.overflow = 'auto';
    panel.style.padding = '0';

    if (mode === 'sidebar') {
      panel.style.top = '0';
      panel.style.right = '0';
      panel.style.width = '400px';
      panel.style.height = '100vh';
      panel.style.borderRadius = '10px 0 0 10px';
      panel.style.maxWidth = '96vw';
    } else {
      // modal
      panel.style.top = '10%';
      panel.style.left = '50%';
      panel.style.transform = 'translateX(-50%)';
      panel.style.width = '480px';
      panel.style.maxWidth = '96vw';
      panel.style.height = '60vh';
      panel.style.borderRadius = '10px';
    }

    // Header
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.padding = '12px 18px';
    header.style.borderBottom = '1px solid #eee';
    header.style.background = '#f7f7f7';

    // Title with search terms count
    const titleSpan = document.createElement('span');
    titleSpan.style.fontWeight = 'bold';
    titleSpan.style.fontSize = '1.1em';
    const wordCount = query.split(' ').filter(w => w.trim()).length;
    titleSpan.innerHTML = `Google Search (${wordCount} term${wordCount > 1 ? 's' : ''}): <span style='color:#4285f4'>${escapeHtml(query)}</span>`;
    header.appendChild(titleSpan);

    // Mode toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = mode === 'sidebar' ? '📱 Modal' : '📋 Sidebar';
    toggleBtn.title = 'Switch between modal and sidebar';
    toggleBtn.style.fontSize = '0.9em';
    toggleBtn.style.border = '1px solid #4285f4';
    toggleBtn.style.background = '#fff';
    toggleBtn.style.color = '#4285f4';
    toggleBtn.style.cursor = 'pointer';
    toggleBtn.style.marginLeft = '12px';
    toggleBtn.style.padding = '4px 8px';
    toggleBtn.style.borderRadius = '6px';
    toggleBtn.style.transition = 'all 0.2s ease';
    toggleBtn.addEventListener('mouseenter', () => {
      toggleBtn.style.background = '#4285f4';
      toggleBtn.style.color = '#fff';
    });
    toggleBtn.addEventListener('mouseleave', () => {
      toggleBtn.style.background = '#fff';
      toggleBtn.style.color = '#4285f4';
    });
    toggleBtn.onclick = () => {
      const newMode = mode === 'sidebar' ? 'modal' : 'sidebar';
      chrome.storage && chrome.storage.local.set({hoverSearchMode: newMode}, () => {
        renderSearchPanel(query, newMode);
      });
    };
    header.appendChild(toggleBtn);

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.title = 'Close';
    closeBtn.style.fontSize = '1.5em';
    closeBtn.style.border = 'none';
    closeBtn.style.background = 'transparent';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.marginLeft = '12px';
    closeBtn.onclick = removeSearchPanel;
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // Results container with loading animation
    const resultsDiv = document.createElement('div');
    resultsDiv.style.padding = '16px';
    resultsDiv.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; padding: 40px;">
        <div style="width: 20px; height: 20px; border: 2px solid #f3f3f3; border-top: 2px solid #4285f4; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <span style="margin-left: 12px; color: #666;">Searching...</span>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    panel.appendChild(resultsDiv);

    document.body.appendChild(panel);
    
    // Animate panel entrance
    panel.style.opacity = '0';
    panel.style.transform = mode === 'sidebar' ? 'translateX(100%)' : 'translateX(-50%) translateY(-20px)';
    setTimeout(() => {
      panel.style.transition = 'all 0.3s ease';
      panel.style.opacity = '1';
      panel.style.transform = mode === 'sidebar' ? 'translateX(0)' : 'translateX(-50%) translateY(0)';
    }, 10);

    // Fetch Google Custom Search results
    fetchGoogleResults(query, resultsDiv);
  }

  function removeSearchPanel() {
    const panel = document.getElementById('hover-search-modal-panel');
    if (panel) panel.remove();
  }

  // Escape HTML for safe rendering
  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function(tag) {
      const chars = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'};
      return chars[tag] || tag;
    });
  }

  // Fetch results from Google Custom Search API
  function fetchGoogleResults(query, container) {
    // TODO: Replace with your own API key and Search Engine ID
    const API_KEY = '';
    const CX = '';``
    if (API_KEY === 'YOUR_API_KEY_HERE' || CX === 'YOUR_SEARCH_ENGINE_ID_HERE') {
      container.innerHTML = `<div style='color:red'>Google Custom Search API key and Search Engine ID required.<br>See README for setup.</div>`;
      return;
    }
    const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&q=${encodeURIComponent(query)}`;
    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (!data.items || !data.items.length) {
          container.innerHTML = '<div>No results found.</div>';
          return;
        }
        container.innerHTML = data.items.map(item => `
          <div style='margin-bottom:18px;'>
            <a href='${item.link}' target='_blank' style='font-size:1.05em;color:#4285f4;text-decoration:none;font-weight:bold;'>${escapeHtml(item.title)}</a><br>
            <span style='color:#222;font-size:0.98em;'>${escapeHtml(item.snippet)}</span><br>
            <span style='color:#666;font-size:0.9em;'>${escapeHtml(item.displayLink)}</span>
          </div>
        `).join('');
      })
      .catch(err => {
        container.innerHTML = `<div style='color:red'>Error fetching results.<br>${escapeHtml(String(err))}</div>`;
      });
  }

  // Remove panel on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') removeSearchPanel();
  });

  function hideButton() {
    if (button) {
      button.style.opacity = '0';
      button.style.transform = 'scale(0.8)';
      setTimeout(() => {
        button.style.display = 'none';
      }, 200);
    }
  }

  function showButtonAt(x, y) {
    if (!button) createButton();
    
    // Add current word to collection if valid
    if (lastWord && lastWord.length >= MIN_LENGTH) {
      hoveredWords.add(lastWord.toLowerCase());
    }
    
    // Update button position and content
    button.style.left = `${x + 12}px`;
    button.style.top = `${y - 45}px`;
    button.style.display = 'block';
    
    // Update badge count
    const badge = button.querySelector('#word-count-badge');
    if (badge) {
      badge.textContent = hoveredWords.size;
      badge.style.display = hoveredWords.size > 1 ? 'flex' : 'none';
    }
    
    // Update tooltip
    button.title = `Search: ${Array.from(hoveredWords).join(' ')} (${hoveredWords.size} word${hoveredWords.size > 1 ? 's' : ''})`;
    
    // Animate button appearance
    setTimeout(() => {
      button.style.opacity = '1';
      button.style.transform = 'scale(1)';
    }, 10);
  }

  function getWordUnderCursor(event) {
    try {
      const range = document.caretRangeFromPoint
        ? document.caretRangeFromPoint(event.clientX, event.clientY)
        : (document.caretPositionFromPoint
            ? (function(p){ const r = document.createRange(); r.setStart(p.offsetNode, p.offset); return r;})(document.caretPositionFromPoint(event.clientX, event.clientY))
            : null);
      if (!range) return '';
      const node = range.startContainer;
      if (!node || node.nodeType !== Node.TEXT_NODE) return '';
      
      const text = node.textContent;
      const offset = range.startOffset;
      
      // Find word boundaries
      let start = offset;
      let end = offset;
      
      // Expand left to find start of word/phrase
      while (start > 0 && /[\w\s]/.test(text[start - 1])) {
        start--;
        // Stop at sentence boundaries
        if (/[.!?]/.test(text[start])) {
          start++;
          break;
        }
      }
      
      // Expand right to find end of word/phrase
      while (end < text.length && /[\w\s]/.test(text[end])) {
        end++;
        // Stop at sentence boundaries
        if (/[.!?]/.test(text[end - 1])) {
          end--;
          break;
        }
      }
      
      let phrase = text.slice(start, end).trim();
      
      // Clean up the phrase
      phrase = phrase.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
      
      // Limit to reasonable phrase length (max 5 words)
      const words = phrase.split(' ').filter(w => w.length > 0);
      if (words.length > 5) {
        // Find the word closest to cursor and take 2 words before and after
        const cursorWord = Math.floor((offset - start) / (end - start) * words.length);
        const startIdx = Math.max(0, cursorWord - 2);
        const endIdx = Math.min(words.length, cursorWord + 3);
        phrase = words.slice(startIdx, endIdx).join(' ');
      }
      
      return phrase.length >= MIN_LENGTH ? phrase : '';
    } catch (e) {
      return '';
    }
  }

  // Main hover event handler
  document.addEventListener('mousemove', (e) => {
    // Skip if hovering over button or panel
    if (e.target.closest('#hover-search-button-xyz') || e.target.closest('#hover-search-modal-panel')) {
      return;
    }

    // Skip input fields and editable content
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.target.contentEditable === 'true') {
      hideButton();
      return;
    }

    clearTimeout(hoverTimeout);
    hoverTimeout = setTimeout(() => {
      const word = getWordUnderCursor(e);
      if (word && word !== lastWord) {
        lastWord = word;
        showButtonAt(e.clientX, e.clientY);
      } else if (!word) {
        hideButton();
      }
    }, HOVER_DELAY);
  });

  // Hide button when mouse leaves the page
  document.addEventListener('mouseleave', () => {
    clearTimeout(hoverTimeout);
    hideButton();
  });

  // Clear words on double-click (reset)
  document.addEventListener('dblclick', () => {
    clearHoveredWords();
    hideButton();
  });

})();