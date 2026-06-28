import { textToHtml } from './file-import.util';

describe('textToHtml', () => {
  it('converts text blocks to safe html paragraphs', () => {
    expect(textToHtml('Hello <team>\n\nSecond line')).toBe(
      '<p>Hello &lt;team&gt;</p><p>Second line</p>',
    );
  });
});
