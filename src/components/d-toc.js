// Copyright 2018 The Distill Template Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Numbered table of contents.
//
// renderTOC() also assigns section numbers to the headings it is given, so it
// has to stay usable under jsdom for the prerender transform: everything here
// works off the element's own ownerDocument and touches no browser globals.
// The interactive parts -- the floating drawer and the scroll-spy -- live in
// the custom element and only run in a real browser.

const SLUG_MAX = 60;

function slugify(text, taken) {
  let slug = text
    .toLowerCase()
    .replace(/[‘’“”]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX) || 'section';
  let candidate = slug;
  let n = 2;
  while (taken.has(candidate)) {
    candidate = slug + '-' + n++;
  }
  taken.add(candidate);
  return candidate;
}

function escapeHTML(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// A, B, ... Z, AA, AB, ...
function letterFor(index) {
  let n = index;
  let out = '';
  do {
    out = String.fromCharCode(65 + (n % 26)) + out;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return out;
}

// Walks the headings in document order and assigns each one a section number.
// An h2 carrying the `appendix` attribute switches numbering from digits to
// letters, and everything after it continues in letters.
export function numberSections(headings) {
  const taken = new Set();
  const entries = [];
  let major = 0;
  let minor = 0;
  let appendix = false;
  let appendixIndex = 0;

  for (const el of headings) {
    if (el.parentElement && el.parentElement.tagName === 'D-TITLE') continue;
    if (el.getAttribute('no-toc') !== null) continue;

    const isSection = el.tagName === 'H2';
    if (isSection && el.getAttribute('appendix') !== null) {
      appendix = true;
      appendixIndex = 0;
    }

    let num;
    if (isSection) {
      minor = 0;
      if (appendix) {
        num = letterFor(appendixIndex++);
      } else {
        num = String(++major);
      }
    } else {
      minor++;
      const parent = appendix
        ? letterFor(Math.max(appendixIndex - 1, 0))
        : String(major);
      num = parent + '.' + minor;
    }

    // Idempotent: a second pass over already-numbered headings is a no-op.
    if (el.getAttribute('data-secnum') !== null) {
      entries.push({
        level: isSection ? 2 : 3,
        num: el.getAttribute('data-secnum'),
        id: el.id,
        title: el.getAttribute('data-title') || el.textContent.trim(),
      });
      continue;
    }

    const title = el.textContent.trim();
    const id = el.id || slugify(title, taken);
    taken.add(id);

    el.id = id;
    el.setAttribute('data-secnum', num);
    el.setAttribute('data-title', title);
    el.innerHTML =
      '<a class="secnum" href="#' + id + '">' + num + '</a>' +
      '<a href="#' + id + '">' + escapeHTML(title) + '</a>';

    entries.push({ level: isSection ? 2 : 3, num, id, title });
  }

  return entries;
}

export function tocMarkup(entries, heading) {
  let html = '<nav role="navigation" class="table-of-contents">';
  html += '<h3>' + (heading || 'Contents') + '</h3>';

  let inList = false;
  for (const e of entries) {
    const link =
      '<a href="#' + e.id + '">' +
      '<span class="toc-num">' + e.num + '</span>' +
      '<span>' + escapeHTML(e.title) + '</span></a>';

    if (e.level === 2) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += '<div>' + link + '</div>';
    } else {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      html += '<li>' + link + '</li>';
    }
  }
  if (inList) html += '</ul>';

  html += '</nav>';
  return html;
}

export function renderTOC(element, headings) {
  const entries = numberSections(headings);
  element.innerHTML = tocMarkup(entries, element.getAttribute('heading'));
  return entries;
}

export class TOC extends HTMLElement {

  static get is() { return 'd-toc'; }

  connectedCallback() {
    const start = () => {
      const article = document.querySelector('d-article');
      if (!article) return;
      if (!this.getAttribute('prerendered')) {
        renderTOC(this, article.querySelectorAll('h2, h3'));
      }
      this.setupFloat();
      this.setupScrollSpy(article);
    };

    if (document.readyState === 'complete') {
      start();
    } else {
      window.addEventListener('load', start, { once: true });
    }
  }

  disconnectedCallback() {
    if (this._onScroll) window.removeEventListener('scroll', this._onScroll);
    if (this._onDocClick) document.removeEventListener('click', this._onDocClick);
    if (this._float && this._float.parentNode) {
      this._float.parentNode.removeChild(this._float);
    }
  }

  // A fixed button that mirrors the margin TOC, for viewports too narrow to
  // show it and for when the reader has scrolled past it.
  setupFloat() {
    const nav = this.querySelector('nav');
    if (!nav || this.getAttribute('no-float') !== null) return;

    const float = document.createElement('div');
    float.className = 'toc-float';
    float.innerHTML =
      '<button class="toc-float-btn" type="button" aria-expanded="false">' +
      '<span class="ico" aria-hidden="true">&#9776;</span>' +
      '<span class="lbl">Contents</span></button>' +
      '<div class="toc-float-menu"></div>';

    float.querySelector('.toc-float-menu').appendChild(nav.cloneNode(true));
    document.body.appendChild(float);

    const btn = float.querySelector('.toc-float-btn');
    btn.addEventListener('click', event => {
      event.stopPropagation();
      const open = float.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });

    this._onDocClick = event => {
      if (!float.contains(event.target)) {
        float.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    };
    document.addEventListener('click', this._onDocClick);

    float.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        float.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });

    this._float = float;
    this._floatLabel = float.querySelector('.lbl');
  }

  setupScrollSpy(article) {
    const headings = Array.prototype.slice.call(
      article.querySelectorAll('h2[data-secnum], h3[data-secnum]')
    );
    if (!headings.length) return;

    const heads = document.querySelectorAll('d-tochead');
    const links = {};
    this.querySelectorAll('nav a[href^="#"]').forEach(a => {
      links[a.getAttribute('href').slice(1)] = a;
    });

    let current = null;
    let ticking = false;

    const update = () => {
      ticking = false;

      // The heading nearest above the reading line wins.
      const line = 80;
      let active = headings[0];
      for (const h of headings) {
        if (h.getBoundingClientRect().top <= line) active = h;
        else break;
      }

      // The floating drawer is only for viewports too narrow for the
      // margin TOC. On desktop the margin list is sticky, so the chip
      // must not appear at the screen edge.
      if (this._float) {
        const narrow = window.innerWidth < 1200;
        this._float.classList.toggle('show', narrow);
      }

      if (active === current) return;
      current = active;

      const num = active.getAttribute('data-secnum');
      const title = active.getAttribute('data-title') || active.textContent.trim();

      heads.forEach(el => {
        el.innerHTML =
          '<span class="toc-num">' + num + '</span>' + escapeHTML(title);
      });

      if (this._floatLabel) {
        this._floatLabel.innerHTML =
          '<span class="num">' + num + '</span> ' + escapeHTML(title);
      }

      Object.keys(links).forEach(id => {
        links[id].classList.toggle('active', id === active.id);
      });
    };

    this._onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    window.addEventListener('scroll', this._onScroll, { passive: true });
    window.addEventListener('resize', this._onScroll);
    update();
  }

}
