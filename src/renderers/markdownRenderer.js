import { parseMarkdown } from '../utils/markdownParser';

export function renderMarkdown(text) {
    return parseMarkdown(text);
}
