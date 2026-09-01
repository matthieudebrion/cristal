export const footerTemplate = `
<style>
:host, distill-footer {
  display: grid;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0.5);
  background: #fff;
  font-size: 0.8em;
  line-height: 1.7em;
  padding: 32px 0 48px;
  contain: content;
}

.footer-container {
  grid-column: text;
}

.footer-container a {
  color: rgba(0, 0, 0, 0.5);
  text-decoration: none;
  margin-right: 12px;
}

.footer-container a:hover {
  color: #012169;
  text-decoration: underline;
}
</style>

<div class="footer-container">
  <div class="nav">
    <a href="/rss.xml">RSS</a>
  </div>
</div>
`;
