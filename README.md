# extract-content

A utility library to extract web page content optimized for RAG workflows. Converts HTML DOM into clean, structured Markdown text.

## Installation

Install directly from GitHub:

```bash
npm install github:lamartinecabral/extract-content
```

## Usage with Happy DOM

Install [`happy-dom`](https://github.com/capricorn86/happy-dom) to provide a DOM environment in Node.js:

```bash
npm install happy-dom
```

```ts
import { Window } from "happy-dom";
import { extractContent } from "@lamartinecabral/extract-content";

const window = new Window();
const document = window.document;

document.write(`<html><body><!-- your HTML here --></body></html>`);
document.close();

const { title, content } = extractContent(document);

console.log(title);
console.log(content);
```

## Usage with Puppeteer

Install [`puppeteer`](https://pptr.dev) to run a real browser and evaluate the extractor in the page context:

```bash
npm install puppeteer
```

```ts
import puppeteer from "puppeteer";
import { extractContent } from "@lamartinecabral/extract-content";

const browser = await puppeteer.launch();
const page = await browser.newPage();

await page.goto("https://example.com");

const result = await page.evaluate(extractContent);

await browser.close();

console.log(result.title);
console.log(result.content);
```

This pattern serializes the extractor into the page context before running it.

## API

### `extractContent(document?)`

| Parameter  | Type       | Description                          |
| ---------- | ---------- | ------------------------------------ |
| `document` | `Document` | Optional page document object        |

**Returns** `{ title: string, content: string }`:

| Field     | Description                                              |
| --------- | -------------------------------------------------------- |
| `title`   | The page title (`document.title`)                        |
| `content` | Main page content converted to Markdown                  |

The extractor targets the most specific semantic element available: `<main>`, then `<article>`, then `<body>`.

Ignored elements and content:

- `<script>`
- `<noscript>`
- `<style>`
- `<form>`
- `<iframe>`
- `<svg>`
- hidden elements

## HTML to Markdown Conversion

| HTML element        | Markdown output          |
| ------------------- | ------------------------ |
| `<h1>` – `<h6>`     | `#` – `######`           |
| `<strong>`, `<b>`   | `**bold**`               |
| `<em>`, `<i>`       | `_italic_`               |
| `<code>`            | `` `code` ``             |
| `<del>`             | `~strikethrough~`        |
| `<pre>`             | ` ```code block``` `     |
| `<blockquote>`      | `> quote`                |
| `<ul>`              | `- item`                 |
| `<ol>`              | `1. item`                |
| `<table>`           | Markdown table           |
| `<img>`, `<video>`  | `(IMG: alt text)`        |
| `<hr>`              | `---`                    |

## Notes

- Ordered lists are normalized to `1.` entries.
- Images and videos are represented from their `alt` or `title` text when available.
- If extraction fails, the implementation falls back to `document.body.innerText`.

## License

MIT
