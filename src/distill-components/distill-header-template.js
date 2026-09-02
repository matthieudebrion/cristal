import logo from '../assets/distill-logo.svg';

export const headerTemplate = `
<style>
distill-header {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 10px 20px;
  box-sizing: border-box;
  background: none;
  border-bottom: none;
  box-shadow: none;
  position: static;
  z-index: 2;
}

distill-header a.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
}

distill-header svg {
  width: 42px;
  height: 32px;
  display: block;
  overflow: visible;
}

distill-header svg polygon {
  stroke: #fff;
  stroke-width: 1.15;
  stroke-linejoin: miter;
  vector-effect: non-scaling-stroke;
}

distill-header svg .cube {
  pointer-events: bounding-box;
  transform-box: fill-box;
  transform-origin: center;
  transition: transform 0.12s ease;
}

distill-header svg .face-top { fill: #cfe0f4; }
distill-header svg .face-left { fill: #7a9ccc; }
distill-header svg .face-right { fill: #4568a4; }
distill-header svg .cube:nth-child(odd) .face-top { fill: #dce8f7; }
distill-header svg .cube:nth-child(3n) .face-left { fill: #6b8ec4; }
distill-header svg .cube:nth-child(3n+1) .face-right { fill: #3a5a96; }

distill-header svg .cube:hover {
  transform: translate(0, -1.2px);
}

distill-header svg .cube:hover .face-top { fill: #f2f7fd; }
distill-header svg .cube:hover .face-left { fill: #8aa8d6; }
distill-header svg .cube:hover .face-right { fill: #012169; }

distill-header a.home-link {
  font-size: 100%;
  color: #333;
  text-decoration: none;
}

distill-header a.home-link:hover {
  color: #012169;
}
</style>

<a class="logo" href="/" aria-label="Home">
  ${logo}
</a>
<a class="home-link" href="/cristal/">Cristal</a>
`;
