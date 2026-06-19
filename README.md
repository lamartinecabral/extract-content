# extract-content

A utility library to extract web page content optimized for RAG workflows. Converts HTML DOM into clean, structured Markdown text.

## Installation

```bash
npm install github:lamartinecabral/extract-content
```

## Usage

The library is designed to run in a browser context (e.g. content scripts, browser extensions, or injected scripts) where the DOM globals are available.

```ts
import { extractContent } from "@lamartinecabral/extract-content";

const { title, content } = extractContent(document);

console.log(title);   // page title
console.log(content); // page content as Markdown
```

## API

### `extractContent(document)`

| Parameter  | Type       | Description                          |
| ---------- | ---------- | ------------------------------------ |
| `document` | `Document` | The page document object             |

**Returns** `{ title: string, content: string }`:

| Field     | Description                                              |
| --------- | -------------------------------------------------------- |
| `title`   | The page title (`document.title`)                        |
| `content` | Main page content converted to Markdown                  |

The extractor targets the most specific semantic element available — `<main>`, then `<article>`, then `<body>` — and ignores `<script>`, `<style>`, `<form>`, `<iframe>`, `<svg>`, and hidden elements.

## Server-side Usage (Node.js)

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

const { title, content } = extractContent(document);

console.log(title);
console.log(content);
```

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

## License

MIT
