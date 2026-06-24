import { Window } from "happy-dom";
import assert from "node:assert";
import { afterEach, beforeEach, describe, it } from "node:test";
import { extractContent } from "../src/index.ts";

describe("Test Suite", () => {
  let window: Window;
  let document: Document;

  beforeEach(() => {
    window = new Window();
    // @ts-ignore for this task, happy-dom's Document is compatible with DOM's Document interface.
    document = window.document;
  });

  afterEach(() => {
    window.close();
  });

  it("should parse titles and paragraphs", () => {
    document.write(`
      <body>
        <h1>This is a title</h1>
        <h3>This is a subtitle</h3>
        <p>This is a paragraph with <b>bold</b> text.</p>
      </body>
    `);
    const expectedContent = [
      "# This is a title",
      "",
      "### This is a subtitle",
      "",
      "This is a paragraph with **bold** text.",
    ].join("\n");
    const { content } = extractContent(document);
    assert.equal(content.trim(), expectedContent);
  });

  it("should correctly parse multiline html", () => {
    document.write(`
      <body>
        <p>
          This is
          a paragraph
          <span>written across</span>
          multiple lines
        </p>
      </body>
    `);
    const expectedContent = "This is a paragraph written across multiple lines";
    const { content } = extractContent(document);
    assert.equal(content.trim(), expectedContent);
  });

  it("should extract lists", () => {
    document.write(`
      <body>
        <ul>
          <li>This is a list item</li>
          <li>This is <b>another</b> list item</li>
        </ul>
        <ol>
          <li>This is an ordered list item</li>
          <li>This is <b>another</b> ordered list item</li>
        </ol>
      </body>
    `);
    const expectedContent = [
      "- This is a list item",
      "- This is **another** list item",
      "",
      "1. This is an ordered list item",
      "2. This is **another** ordered list item",
    ].join("\n");
    const { content } = extractContent(document);
    assert.equal(content.trim(), expectedContent);
  });

  it("should extract tables", () => {
    document.write(`
      <body>
        <table>
          <tr>
            <th>header 1</th>
            <th>header 2</th>
          </tr>
          <tr>
            <td>cell 1</td>
            <td>cell 2</td>
          </tr>
          <tr>
            <td>cell 3</td>
            <td>cell 4</td>
          </tr>
        </table>
      </body>
    `);
    const expectedContent = [
      "| header 1 | header 2 |",
      "| --- | --- |",
      "| cell 1 | cell 2 |",
      "| cell 3 | cell 4 |",
    ].join("\n");
    const { content } = extractContent(document);
    assert.equal(content.trim(), expectedContent);
  });

  it("should ignore hidden and non-content elements", () => {
    document.write(`
      <head>
        <title>Ignored body noise</title>
      </head>
      <body>
        <p>Visible text.</p>
        <p style="display: none;">Hidden text.</p>
        <div hidden>Also hidden.</div>
        <script>document.write("script output")</script>
        <style>body { color: red; }</style>
        <form>
          <input value="secret" />
        </form>
      </body>
    `);

    const { title, content } = extractContent(document);
    assert.equal(title, "Ignored body noise");
    assert.equal(content.trim(), "Visible text.");
  });

  it("should preserve inline markdown formatting", () => {
    document.write(`
      <body>
        <p>
          A <em>gentle</em> <strong>warning</strong> with
          <del>old</del> and <code>code()</code>.
        </p>
      </body>
    `);

    const { content } = extractContent(document);
    assert.equal(
      content.trim(),
      "A _gentle_ **warning** with ~old~ and `code()`.",
    );
  });

  it("should extract media labels and fenced code blocks", () => {
    document.write(
      `
        <body>
          <p><img alt="Preview image" /></p>
          <p><button>Submit</button></p>
          <select multiple>
            <option selected>First</option>
            <option>Second</option>
            <option selected>Third</option>
          </select>
          <pre>const snippet = "${"```nested```"}";</pre>
        </body>
      `,
    );

    const expectedContent = [
      "(IMG: Preview image)",
      "",
      "(BUTTON: Submit)",
      "",
      "First,Third",
      "",
      "````",
      'const snippet = "```nested```";',
      "````",
    ].join("\n");

    const { content } = extractContent(document);
    assert.equal(content.trim(), expectedContent);
  });

  describe("main content", () => {
    it("should extract content from main tag", () => {
      document.write(`
        <body>
          <main>
            <p>Main content.</p>
          </main>
          <footer>
            <p>Footer content.</p>
          </footer>
        </body>
      `);
      const expectedContent = "Main content.";
      const { content } = extractContent(document);
      assert.equal(content.trim(), expectedContent);
    });

    it("should extract content from article tag if main is not present", () => {
      document.write(`
        <body>
          <article>
            <p>Main content.</p>
          </article>
          <footer>
            <p>Footer content.</p>
          </footer>
        </body>
      `);
      const expectedContent = "Main content.";
      const { content } = extractContent(document);
      assert.equal(content.trim(), expectedContent);
    });

    it("should fallback to body if there are multiple main or article tags", () => {
      document.write(`
        <body>
          <main>
            <article>
              <p>Main content.</p>
            </article>
          </main>
          <main>
            <article>
              <p>Another content.</p>
            </article>
          </main>
          <footer>
            <p>Footer content.</p>
          </footer>
        </body>
      `);
      const expectedContent = [
        "Main content.",
        "",
        "Another content.",
        "",
        "Footer content.",
      ].join("\n");
      const { content } = extractContent(document);
      assert.equal(content.trim(), expectedContent);
    });
  });
});
