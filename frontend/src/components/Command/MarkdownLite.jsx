// Responsibility: render the markdown subset Gemini emits (bold, italic,
//   inline code, headings, nested bullet/numbered lists) as React elements —
//   no dangerouslySetInnerHTML, no library (per ADL-008 "no new deps" spirit).
// Layer: Command Center UI (Layer 4) presentational helper.
// Depends on: React only. Used by AdjutantConsole message bubbles.
// Must never be depended on by: backend code or non-Command UI.

import React from "react";

/** Split a line into inline elements: `code`, **bold**, *italic*. */
function renderInline(text, keyBase) {
  const pattern = /(`[^`\n]+`|\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g;
  const out = [];
  let last = 0;
  let match;
  let i = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyBase}-i${i++}`;
    if (token.startsWith("`")) {
      out.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("**")) {
      out.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else {
      out.push(<em key={key}>{token.slice(1, -1)}</em>);
    }
    last = match.index + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Build nested <ul>/<ol> from flat items [{depth, ordered, text}]. */
function renderList(items, keyBase) {
  let i = 0;
  const build = (depth) => {
    const ordered = items[i].ordered;
    const lis = [];
    while (i < items.length && items[i].depth >= depth) {
      if (items[i].depth > depth) {
        // Deeper run nests inside the previous <li> (or its own if list
        // starts over-indented).
        const nested = build(items[i].depth);
        const prev = lis.pop();
        lis.push(
          <li key={`${keyBase}-n${i}`}>
            {prev ? prev.props.children : null}
            {nested}
          </li>
        );
        continue;
      }
      const item = items[i];
      i += 1;
      lis.push(
        <li key={`${keyBase}-li${i}`}>{renderInline(item.text, `${keyBase}-li${i}`)}</li>
      );
    }
    const Tag = ordered ? "ol" : "ul";
    return <Tag key={`${keyBase}-t${depth}-${i}`}>{lis}</Tag>;
  };
  const nodes = [];
  while (i < items.length) nodes.push(build(items[i].depth));
  return nodes;
}

/**
 * Markdown-lite block renderer. Handles the constructs the Adjutant actually
 * produces; anything unrecognised falls through as a plain paragraph line.
 */
export default function MarkdownLite({ text }) {
  const lines = String(text || "").split("\n");
  const blocks = [];
  let listBuf = [];
  let paraBuf = [];

  const flushPara = () => {
    if (!paraBuf.length) return;
    const key = `p${blocks.length}`;
    blocks.push(
      <p key={key}>
        {paraBuf.map((ln, j) => (
          <React.Fragment key={`${key}-f${j}`}>
            {j > 0 && <br />}
            {renderInline(ln, `${key}-f${j}`)}
          </React.Fragment>
        ))}
      </p>
    );
    paraBuf = [];
  };
  const flushList = () => {
    if (!listBuf.length) return;
    blocks.push(...renderList(listBuf, `l${blocks.length}`));
    listBuf = [];
  };

  for (const raw of lines) {
    const bullet = raw.match(/^(\s*)[-*•]\s+(.*)$/);
    const numbered = raw.match(/^(\s*)\d+[.)]\s+(.*)$/);
    const heading = raw.match(/^\s*(#{1,4})\s+(.*)$/);

    if (bullet || numbered) {
      flushPara();
      const m = bullet || numbered;
      listBuf.push({
        depth: Math.min(2, Math.floor(m[1].length / 2)),
        ordered: Boolean(numbered),
        text: m[2],
      });
    } else if (heading) {
      flushPara();
      flushList();
      blocks.push(
        <h4 key={`h${blocks.length}`}>{renderInline(heading[2], `h${blocks.length}`)}</h4>
      );
    } else if (!raw.trim()) {
      flushPara();
      flushList();
    } else {
      flushList();
      paraBuf.push(raw);
    }
  }
  flushPara();
  flushList();

  return <div className="aj-md">{blocks}</div>;
}
