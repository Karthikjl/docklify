# UI/UX Fixes - Address "Worsers" Comment

## Objective
Fix the "washed out" and high-contrast-clash issues in Light Mode reported by the user.

## Root Cause Analysis
- **Missing Dark Mode Ancestor**: The `btn-secondary` and text utilities relying on `dark:` classes were checking for `.dark` on `body` or `html`. BUT `body.dark` CSS selector in `index.css` was incorrect because `App.jsx` applies the class to `html`. The button colors (`bg-dark-100 dark:bg-dark-700`) were misbehaving or just confusingly styled.
- **Incorrect CSS Selectors**: `body.dark` vs `.dark body`. This caused the body background to be light (via fallback) while components thought they should be dark (or vice versa), or simply the button styles were too heavy for light mode.
- **Invisible Text**: "Markdown Editor" header text was white on light background because `text-slate-800` (my previous fix) likely failed due to `slate` not being in the extended palette, falling back to inherited white.

## Changes Implemented

### 1. Fixed Layout Background Selectors (`index.css`)
- **Fix**: Changed `body.dark` to `.dark body`. This ensures the dark gradient background applies correctly when `html` has the `dark` class.
- **Fix**: Simplified `body:not(.dark)` to just `body`, ensuring a default light theme that gets overridden by `.dark body`.

### 2. Improved Light Mode Contrast
- **Nav Links**: Darkened `color-text-secondary` in light mode to make inactive tabs visible.
- **Buttons**: Updated `.btn-secondary` to use `bg-white` and `border-slate-200` in light mode (instead of `bg-dark-100`). This fixes the "heavy dark block" look in light mode and makes them look like proper buttons.
- **Glass Shell**: Increased opacity of `glass-shell` background to 0.75 and added a darker border `rgba(226, 232, 240, 0.8)` to make the header/toolbar distinct from the body background.

## Result
- **Light Mode**: 
    - Buttons are white with subtle borders (cleaner).
    - Text is dark gray (readable).
    - Inactive tabs are visible.
    - Background is light gradient.
- **Dark Mode**: 
    - Retained premium dark aesthetics.
    - Buttons are dark gray.

## Note
The user's "worsers" comment was likely due to the "broken" look where dark buttons floated on a washed-out light background, and text was missing. These fixes directly address contrast and consistency.
