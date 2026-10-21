# 🧪 Quick Test Guide for Doclify

## Overview
This guide helps you quickly test all features of Doclify.

---

## 📝 Markdown Testing

### What to Test:
1. **Headers** (H1-H6)
2. **Text Formatting** (bold, italic, strikethrough, code)
3. **Lists** (ordered, unordered, task lists)
4. **Code Blocks** (with syntax highlighting)
5. **Tables**
6. **Links & Images**
7. **Blockquotes**
8. **Math Equations** (KaTeX)
9. **Mermaid Diagrams**
10. **Emoji**

### Quick Sample:
```markdown
# Test Header 🚀
**Bold** *italic* ~~strikethrough~~ `code`

- List item 1
- [x] Checked task

| A | B |
|---|---|
| 1 | 2 |

$E = mc^2$
```

### Expected Results:
- All formatting renders correctly
- Diagrams display as graphics
- Math renders with KaTeX
- Syntax highlighted code

---

## 🌐 HTML Testing

### What to Test:
1. **Syntax Highlighting** (tags, attributes, values)
2. **Dual Preview** (code + rendered)
3. **Toolbars** (with gradient effects)
4. **Custom Styles** (embedded CSS)
5. **Form Elements**
6. **Interactive Elements**

### Quick Sample:
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { background: linear-gradient(45deg, #667eea, #764ba2); color: white; padding: 2rem; }
        .card { background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Hello Doclify! 👋</h1>
        <p>This is a <strong>styled</strong> HTML preview.</p>
    </div>
</body>
</html>
```

### Expected Results:
- **Top Section**: Formatted HTML code with colors
  - Blue tags
  - Purple attributes
  - Green values
- **Bottom Section**: Rendered output with styling applied
- **Toolbar**: Shows "📄 Formatted HTML Preview"

---

## 📋 JSON Testing

### Valid JSON Test:
```json
{
  "name": "Test",
  "version": 1.0,
  "active": true,
  "tags": ["demo", "test"],
  "metadata": {
    "author": "Doclify",
    "date": null
  }
}
```

### Expected Results:
- **Toolbar Stats**:
  - `X lines`
  - `Y keys`
  - `✓ Valid` badge (green)
- **Syntax Highlighting**:
  - Blue keys
  - Green strings
  - Orange numbers
  - Purple booleans
  - Gray null

### Invalid JSON Test 1 (Missing Quote):
```json
{
  "name": "Test,
  "value": 123
}
```

### Expected Results:
- Red error toolbar
- ⚠️ Warning icon
- **Error Title**: "JSON Syntax Error"
- **Error Message**: Shows the parse error
- **Suggestions Box**: Shows common JSON mistakes

### Invalid JSON Test 2 (Trailing Comma):
```json
{
  "item1": "value",
  "item2": "value",
}
```

### Expected Results:
- Same error display as above
- Different error message about trailing comma

---

## 🤖 AI Testing

### Markdown AI:
1. Enter plain text (unformatted)
2. Click **AI** toggle (top right)
3. Click **Convert** button
4. Should format text into proper Markdown

**Note**: Requires a Gemini API key

### HTML AI:
1. Switch to HTML tab
2. Enter messy HTML
3. Click **Format HTML** button
4. Should prettify and organize HTML

### JSON AI:
1. Switch to JSON tab
2. Enter unformatted JSON (all on one line)
3. Click **Format JSON** button
4. Should pretty-print with proper indentation

---

## 📤 Export Testing

### Test for Each Format:

#### Export HTML:
1. Click **Export HTML** button
2. Should download `.html` file
3. Open file in browser
4. Should display with Poppins font

#### Export PDF:
1. Click **Export PDF** button
2. Browser print dialog should open
3. Preview should show content
4. Save/print as PDF

#### Copy to Clipboard:
1. Click **Copy HTML** button
2. Alert should confirm success
3. Paste into text editor
4. Should paste HTML content

---

## 🎨 UI Testing

### Theme Toggle:
1. Click **sun/moon icon** (top right)
2. Should switch between light/dark
3. All panels should update
4. Colors should remain readable

### Font Size:
1. Click **-** button → text shrinks
2. Click **+** button → text grows
3. Should affect editor and preview

### Scroll Sync:
1. Toggle **scroll sync** button
2. When ON: scrolling editor scrolls preview
3. When OFF: scrolling is independent

### Resizable Panels:
1. Hover on divider between editor/preview
2. Cursor changes to resize
3. Drag left/right
4. Panels resize smoothly

---

## ✅ Checklist

### Markdown Page:
- [ ] All markdown syntax renders
- [ ] Mermaid diagrams display
- [ ] Math equations work
- [ ] Code has syntax highlighting
- [ ] Export HTML works
- [ ] Export PDF works
- [ ] AI Convert works (with key)

### HTML Page:
- [ ] Syntax highlighting in code view
- [ ] Rendered preview displays
- [ ] Toolbars show correctly
- [ ] Custom CSS applies
- [ ] Format HTML works
- [ ] Export functions work

### JSON Page:
- [ ] Valid JSON shows stats
- [ ] Syntax highlighting works
- [ ] Invalid JSON shows errors
- [ ] Error suggestions appear
- [ ] Format JSON works
- [ ] Export works

### Global Features:
- [ ] Theme toggle (light/dark)
- [ ] Font size controls
- [ ] Scroll sync
- [ ] Panel resizing
- [ ] Header navigation
- [ ] All fonts are Poppins
- [ ] No console errors

---

## 🐛 Common Issues

### Issue: "Module not found"
**Solution**: Run `npm install react-router-dom`

### Issue: "AI not working"
**Solution**: Click settings icon, add your Gemini API key and choose a model

### Issue: "Blank preview"
**Solution**: Check browser console for errors

### Issue: "PDF export blank"
**Solution**: Content might have transparency issues, check CSS

---

## 📊 Performance Checklist

- [ ] App loads in < 2 seconds
- [ ] Editor typing feels instant
- [ ] Preview updates smoothly
- [ ] No lag when switching tabs
- [ ] Smooth animations
- [ ] Panel resize is fluid

---

**Happy Testing! 🎉**

For detailed samples, see `TEST_SAMPLES.md`
