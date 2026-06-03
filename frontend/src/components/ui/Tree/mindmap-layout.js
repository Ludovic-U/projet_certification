/**
 * mindmap-layout.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Algorithme de disposition d'un arbre en style MindMeister
 *
 * Principe général :
 *   1. Les enfants directs de la racine sont répartis gauche / droite (alternés)
 *   2. Chaque sous-arbre est mesuré (hauteur totale) avant d'être placé
 *   3. Les sous-arbres sont empilés verticalement sans jamais se croiser
 *   4. Les arêtes sont tracées avec des courbes de Bézier cubiques
 *
 * Usage :
 *   const layout = new MindmapLayout(canvas);
 *   layout.setTree(rootNode);   // voir structure ci-dessous
 *   layout.render();
 *
 * Structure d'un nœud :
 *   { id, label, children: [] }
 *   → les champs x, y, w, h, side sont ajoutés automatiquement par le layout
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── 1. CONSTANTES DE MISE EN PAGE ───────────────────────────────────────────

const LAYOUT = {
  NODE_W:   120,   // largeur d'un nœud (px, espace de coordonnées)
  NODE_H:    36,   // hauteur d'un nœud
  H_GAP:     64,   // espace horizontal entre un parent et ses enfants
  V_GAP:     14,   // espace vertical entre deux sous-arbres frères
  FONT_ROOT: 'bold 13px system-ui',
  FONT_NODE: '12px system-ui',
};

// ─── 2. MESURE DES SOUS-ARBRES ───────────────────────────────────────────────
//
// subtreeHeight() parcourt l'arbre de bas en haut (post-order).
// La hauteur d'un nœud feuille est simplement NODE_H.
// La hauteur d'un nœud interne est la somme des hauteurs de ses enfants
// plus les espaces entre eux — ou NODE_H si c'est plus grand.
//
// ┌──────────┐  ← sous-arbre A  (height = 86)
// │  enfant1 │
// │  enfant2 │  ← deux feuilles : 2×NODE_H + 1×V_GAP
// │  enfant3 │
// └──────────┘

function subtreeHeight(node) {
  if (!node.children || node.children.length === 0) {
    return LAYOUT.NODE_H;
  }

  const childrenTotal =
    node.children.reduce((sum, child) => sum + subtreeHeight(child), 0) +
    LAYOUT.V_GAP * (node.children.length - 1);

  return Math.max(LAYOUT.NODE_H, childrenTotal);
}

// ─── 3. PLACEMENT D'UN SOUS-ARBRE ────────────────────────────────────────────
//
// layoutSubtree() place récursivement tous les nœuds d'un sous-arbre.
//
// @param node   nœud courant
// @param x      position X du coin supérieur-gauche du nœud
// @param topY   sommet de la zone verticale allouée à ce sous-arbre
// @param side   'left' | 'right'
//
// Idée clé : chaque nœud est centré verticalement dans la zone allouée
// à son sous-arbre (topY … topY + subtreeHeight).
// Ses enfants se voient attribuer des tranches verticales consécutives,
// garantissant l'absence de chevauchement.
//
//                  ┌─────────┐
//   topY  →        │ nœud A  │──────┬── enfant1  (tranche 0..h1)
//                  └─────────┘      ├── enfant2  (tranche h1+gap..h1+gap+h2)
//   topY+height →                   └── enfant3  (tranche ...)

function layoutSubtree(node, x, topY, side) {
  node.side = side;
  node.w    = LAYOUT.NODE_W;
  node.h    = LAYOUT.NODE_H;

  const totalH = subtreeHeight(node);

  // Centre le nœud verticalement dans sa zone allouée
  node.x = x;
  node.y = topY + totalH / 2 - node.h / 2;

  // Positionne les enfants : X avance (right) ou recule (left)
  const childX = side === 'right'
    ? x + node.w + LAYOUT.H_GAP
    : x - LAYOUT.H_GAP - LAYOUT.NODE_W;

  let curY = topY;
  (node.children || []).forEach(child => {
    const childH = subtreeHeight(child);
    layoutSubtree(child, childX, curY, side);
    curY += childH + LAYOUT.V_GAP;
  });
}

// ─── 4. LAYOUT GLOBAL (racine + côtés gauche/droite) ─────────────────────────
//
// layout() orchestre l'ensemble :
//   - Place la racine au centre (cx, cy)
//   - Répartit ses enfants alternativement droite (indices pairs) / gauche (impairs)
//   - Centre chaque groupe verticalement par rapport à la racine
//
// Pourquoi alterner et non couper en deux blocs contigus ?
// → Cela équilibre visuellement le poids des deux côtés au fur et à mesure
//   que l'utilisateur ajoute des branches.

function layout(root, cx, cy) {
  root.w    = LAYOUT.NODE_W;
  root.h    = LAYOUT.NODE_H;
  root.x    = cx - root.w / 2;
  root.y    = cy - root.h / 2;
  root.side = 'root';

  const children = root.children || [];

  // Sépare les enfants en deux groupes en alternant
  const rightKids = children.filter((_, i) => i % 2 === 0);
  const leftKids  = children.filter((_, i) => i % 2 === 1);

  // ── Côté droit ────────────────────────────────────────────────────────────
  const rightH = rightKids.reduce((s, c) => s + subtreeHeight(c), 0)
               + LAYOUT.V_GAP * Math.max(0, rightKids.length - 1);

  let ry = cy - rightH / 2;
  rightKids.forEach(child => {
    const ch = subtreeHeight(child);
    layoutSubtree(child, cx + root.w / 2 + LAYOUT.H_GAP, ry, 'right');
    ry += ch + LAYOUT.V_GAP;
  });

  // ── Côté gauche ───────────────────────────────────────────────────────────
  const leftH = leftKids.reduce((s, c) => s + subtreeHeight(c), 0)
              + LAYOUT.V_GAP * Math.max(0, leftKids.length - 1);

  let ly = cy - leftH / 2;
  leftKids.forEach(child => {
    const ch = subtreeHeight(child);
    layoutSubtree(child, cx - root.w / 2 - LAYOUT.H_GAP - LAYOUT.NODE_W, ly, 'left');
    ly += ch + LAYOUT.V_GAP;
  });
}

// ─── 5. RENDU CANVAS ─────────────────────────────────────────────────────────

class MindmapLayout {
  constructor(canvas) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext('2d');
    this.root    = null;
    this.scale   = 1;
    this.offsetX = 0;
    this.offsetY = 0;
  }

  setTree(rootNode) {
    this.root = rootNode;
  }

  // ── 5a. Collecte tous les nœuds (DFS) ─────────────────────────────────────
  _allNodes(node = this.root, acc = []) {
    acc.push(node);
    (node.children || []).forEach(c => this._allNodes(c, acc));
    return acc;
  }

  // ── 5b. Calcule l'emprise totale de l'arbre (en coordonnées logiques) ──────
  _bounds(nodes) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(n => {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + n.w);
      maxY = Math.max(maxY, n.y + n.h);
    });
    return { minX, minY, maxX, maxY };
  }

  // ── 5c. Courbe de Bézier cubique entre parent et enfant ───────────────────
  //
  // Point de départ  : milieu droit  (ou gauche) du parent
  // Point d'arrivée  : milieu gauche (ou droit)  de l'enfant
  // Points de contrôle : même X que la moitié horizontale, même Y que les extrémités
  //
  //   parent ──── cp1          cp2 ──── enfant
  //                 \          /
  //                  ╰────────╯
  //
  // Cette formule produit une courbe en S douce, typique des mind maps.
  _drawEdge(parent, child) {
    const ctx = this.ctx;

    // Point de départ : côté droit ou gauche du parent selon direction
    const x1 = child.side === 'right' ? parent.x + parent.w : parent.x;
    const y1 = parent.y + parent.h / 2;

    // Point d'arrivée : côté opposé de l'enfant
    const x2 = child.side === 'right' ? child.x : child.x + child.w;
    const y2 = child.y + child.h / 2;

    // Point médian horizontal → donne la forme en S
    const mx = (x1 + x2) / 2;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(
      mx, y1,   // cp1 : même Y que le départ, X médian
      mx, y2,   // cp2 : même Y que l'arrivée, X médian
      x2, y2    // arrivée
    );
    ctx.strokeStyle = this._edgeColor(child);
    ctx.lineWidth   = 1.5;
    ctx.stroke();
  }

  // ── 5d. Couleurs (personnalisables) ───────────────────────────────────────
  _edgeColor(node) {
    const palettes = {
      right: ['#7F77DD','#1D9E75','#D85A30','#D4537E','#378ADD'],
      left:  ['#534AB7','#0F6E56','#993C1D','#993556','#185FA5'],
    };
    const rootChild = this._rootChild(node);
    if (!rootChild) return '#888';
    const idx = this.root.children.indexOf(rootChild);
    const side = node.side === 'right' ? 'right' : 'left';
    return palettes[side][idx % palettes[side].length] + 'bb';
  }

  _nodeColor(node) {
    const palettes = {
      right: ['#7F77DD','#1D9E75','#D85A30','#D4537E','#378ADD'],
      left:  ['#534AB7','#0F6E56','#993C1D','#993556','#185FA5'],
    };
    if (node.side === 'root') return { bg: '#534AB7', text: '#fff' };
    const rootChild = this._rootChild(node);
    const idx = this.root.children.indexOf(rootChild);
    const side = node.side === 'right' ? 'right' : 'left';
    const c = palettes[side][idx % palettes[side].length];
    // Feuilles : fond très léger de la même couleur
    if (!node.children || node.children.length === 0) {
      return { bg: c + '22', text: c };
    }
    return { bg: c, text: '#fff' };
  }

  // Remonte jusqu'à l'enfant direct de la racine
  _rootChild(node) {
    let cur = node;
    while (cur.parent && cur.parent !== this.root) cur = cur.parent;
    return cur.parent === this.root ? cur : null;
  }

  // ── 5e. Dessine un nœud ───────────────────────────────────────────────────
  _drawNode(node) {
    const ctx   = this.ctx;
    const { bg, text } = this._nodeColor(node);
    const r = 8;

    ctx.beginPath();
    ctx.roundRect(node.x, node.y, node.w, node.h, r);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = bg.length > 7 ? bg.slice(0, 7) : bg; // couleur sans alpha
    ctx.lineWidth = 0.75;
    ctx.stroke();

    ctx.fillStyle    = text;
    ctx.font         = node.side === 'root' ? LAYOUT.FONT_ROOT : LAYOUT.FONT_NODE;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    const maxChars = 15;
    const label = node.label.length > maxChars
      ? node.label.slice(0, maxChars - 1) + '…'
      : node.label;
    ctx.fillText(label, node.x + node.w / 2, node.y + node.h / 2);
  }

  // ── 5f. Attache les références parent (nécessaire pour _rootChild) ─────────
  _linkParents(node, parent = null) {
    node.parent = parent;
    (node.children || []).forEach(c => this._linkParents(c, node));
  }

  // ── 5g. Point d'entrée principal ──────────────────────────────────────────
  render() {
    if (!this.root) return;

    const W = this.canvas.width;
    const H = this.canvas.height;
    const ctx = this.ctx;

    // 1. Attache les parents
    this._linkParents(this.root);

    // 2. Calcule le layout (coordonnées logiques, centré sur 0,0)
    layout(this.root, 0, 0);

    // 3. Calcule le zoom pour tenir dans le canvas
    const nodes  = this._allNodes();
    const bounds = this._bounds(nodes);
    const treeW  = bounds.maxX - bounds.minX + 40;
    const treeH  = bounds.maxY - bounds.minY + 40;
    this.scale   = Math.min(1, Math.min(W / treeW, H / treeH));
    this.offsetX = (W - treeW * this.scale) / 2 - bounds.minX * this.scale + 20 * this.scale;
    this.offsetY = (H - treeH * this.scale) / 2 - bounds.minY * this.scale + 20 * this.scale;

    // 4. Efface et applique la transformation
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.scale, this.scale);

    // 5. Arêtes en premier (sous les nœuds)
    nodes.forEach(n => { if (n.parent) this._drawEdge(n.parent, n); });

    // 6. Nœuds
    nodes.forEach(n => this._drawNode(n));

    ctx.restore();
  }

  // ── 5h. Conversion canvas → coordonnées logiques (pour les clics) ─────────
  toWorld(canvasX, canvasY) {
    return {
      x: (canvasX - this.offsetX) / this.scale,
      y: (canvasY - this.offsetY) / this.scale,
    };
  }

  // ── 5i. Hit-test : quel nœud est sous le pointeur ? ───────────────────────
  hitTest(canvasX, canvasY) {
    const { x, y } = this.toWorld(canvasX, canvasY);
    return this._allNodes().find(
      n => x >= n.x && x <= n.x + n.w && y >= n.y && y <= n.y + n.h
    ) || null;
  }
}

// ─── 6. EXEMPLE D'UTILISATION ─────────────────────────────────────────────────

/*
const canvas = document.getElementById('my-canvas');
canvas.width  = canvas.parentElement.clientWidth;
canvas.height = 520;

// Construction de l'arbre (structure simple, sans positions)
let idCounter = 0;
function node(label, ...children) {
  return { id: idCounter++, label, children };
}

const tree = node('Idée centrale',
  node('Branche A',
    node('Sous-thème 1'),
    node('Sous-thème 2'),
    node('Sous-thème 3'),
  ),
  node('Branche B',
    node('Concept X'),
    node('Concept Y'),
  ),
  node('Branche C',
    node('Élément 1'),
    node('Élément 2'),
  ),
  node('Branche D',
    node('Note alpha'),
  ),
);

const mindmap = new MindmapLayout(canvas);
mindmap.setTree(tree);
mindmap.render();

// Ajout interactif d'un nœud au clic
canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const hit  = mindmap.hitTest(e.clientX - rect.left, e.clientY - rect.top);
  if (hit) {
    hit.children.push({ id: idCounter++, label: 'Nouveau', children: [] });
    mindmap.render();
  }
});

window.addEventListener('resize', () => {
  canvas.width = canvas.parentElement.clientWidth;
  mindmap.render();
});
*/

export { MindmapLayout, layout, layoutSubtree, subtreeHeight, LAYOUT };
