

import type {EditorThemeClasses} from 'lexical';

import './StickyEditorTheme.css';

import baseTheme from './BulletinEditorTheme';

const theme: EditorThemeClasses = {
  ...baseTheme,
  paragraph: 'StickyEditorTheme__paragraph',
};

export default theme;
