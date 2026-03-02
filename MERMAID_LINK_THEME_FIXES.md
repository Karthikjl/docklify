# Mermaid & Link Fixes + Theme Improvements

## Issues Fixed

### 1. Mermaid Diagram Rendering
**Problem**: Mermaid diagrams were not rendering properly. The detection logic was trying to parse code content after HTML escaping, which failed.

**Solution**:
- Modified `markdownParser.js` to detect mermaid language tag in markdown code blocks (`` ```mermaid ``)
- Added special class `mermaid-code` to identify mermaid blocks during parsing
- Updated `Preview.jsx` to look for `pre.mermaid-code > code.language-mermaid` instead of trying to parse code content
- Added proper styling for mermaid containers in both light and dark themes

### 2. Magnet Link Support
**Problem**: Magnet links (and other non-standard protocols) were not being rendered as clickable links.

**Solution**:
- Added `magnet:` protocol support to markdown-it's linkify plugin
- Enhanced link renderer to preserve all link protocols including magnet, ftp, etc.

### 3. Theme Standardization

#### Light Theme Improvements:
- **Code Blocks**: Changed from dark gradient to light gradient (`#f8fafc` to `#f1f5f9`)
- **Inline Code**: Added indigo-tinted background (`rgba(99, 102, 241, 0.1)`) with darker purple text
- **Mermaid Containers**: Light subtle background with proper borders
- **Better Visibility**: All text elements now have proper contrast against light backgrounds

#### Dark Theme Improvements:
- **Maintained**: All existing premium dark aesthetics
- **Consistency**: Ensured all components follow the glassmorphism design system

#### Unified Improvements:
- **Mermaid Diagrams**: Proper container styling with padding and borders in both themes
- **Error Messages**: Added theme-appropriate backgrounds for error display
- **Code Syntax**: Both themes now have readable, attractive code blocks

## Code Changes

### markdownParser.js
- Added mermaid language detection in highlight function
- Added magnet protocol support to linkify
- Enhanced link renderer for all protocols

### Preview.jsx  
- Simplified mermaid detection using CSS class selector
- Improved error display with theme-aware backgrounds

### index.css
- Added `.light-theme .markdown-preview pre` with light gradient
- Added `.light-theme .markdown-preview pre code` with dark text
- Added `.light-theme .markdown-preview :not(pre)>code` with indigo background
- Added `.mermaid-container` styling for both themes
- Enhanced error message backgrounds

## Testing

To test:
1. Create a markdown file with mermaid diagrams using `` ```mermaid `` syntax
2. Add magnet links in markdown
3. Toggle between light and dark themes
4. Verify code blocks, inline code, and mermaid diagrams look good in both themes
