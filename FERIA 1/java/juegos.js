/* ═══════════ TARJETA PRINCIPAL ═══════════ */
.gx-card.featured{
  grid-column:1/-1;
  border-color:var(--c);
  box-shadow:8px 8px 0 var(--gx-shadow),0 0 30px color-mix(in srgb,var(--c) 32%,transparent);
}
.gx-card.featured .gx-art{height:210px}
.gx-card.featured .gx-art canvas{width:128px;height:128px}
.gx-card.featured .gx-body{padding:20px 22px 22px}
.gx-card.featured .gx-name{font-size:clamp(22px,3.6vw,36px)}
.gx-card.featured .gx-desc{font-size:15px;max-width:70ch}
.gx-badge{
  align-self:flex-start;
  font:700 11px 'Pixelify Sans',monospace;
  letter-spacing:.18em;
  background:var(--c);color:#1b1500;
  padding:3px 10px;border:2px solid #000;box-shadow:2px 2px 0 #000;
}
@media(min-width:820px){
  .gx-card.featured{display:grid;grid-template-columns:300px 1fr}
  .gx-card.featured .gx-art{
    height:100%;min-height:230px;
    border-bottom:0;border-right:4px solid var(--gx-line);
  }
  .gx-card.featured .gx-play{margin-top:auto}
}
