/* ============ Ilustraciones SVG de productos (generadas por código) ============ */
(function(){
const INK = DE.INK;
const S = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
const wrap = inner => `<svg class="art" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">${inner}</svg>`;
const shadow = (rx=70) => `<ellipse cx="100" cy="174" rx="${rx}" ry="9" fill="${INK}" opacity=".14"/>`;

/* Glaseado con borde ondulado */
function scallop(x, y, w, n){
  let d = `M${x} ${y+10} q0 -10 10 -10 h${w-20} q10 0 10 10 v4`;
  const st = w / n;
  for(let i=0;i<n;i++){
    d += ` q${-st/4} ${i%2?10:16} ${-st/2} 0 q${-st/4} ${i%2?16:10} ${-st/2} 0`;
  }
  return d + 'z';
}
const tier = (x,y,w,h,body,fr,n) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${body}" ${S}/>` +
  `<path d="${scallop(x,y,w,n)}" fill="${fr}" ${S}/>`;

const cherry = (cx,cy,col) =>
  `<path d="M${cx} ${cy-8} q4 -12 12 -14" fill="none" ${S}/><circle cx="${cx}" cy="${cy}" r="9" fill="${col}" ${S}/><circle cx="${cx-3}" cy="${cy-3}" r="2.5" fill="#fff" opacity=".75"/>`;

const types = {
  layer(c){
    let dots = '';
    for(let i=0;i<5;i++) dots += `<circle cx="${58+i*21}" cy="152" r="3.5" fill="${c[3]}" opacity=".9"/>`;
    return shadow() + tier(34,106,132,62,c[0],c[1],4) + dots + tier(60,66,80,44,c[0],c[1],3) + cherry(100,56,c[2]);
  },
  slice(c){
    return shadow(64) +
      `<rect x="46" y="128" width="108" height="26" rx="8" fill="${c[0]}" ${S}/>` +
      `<rect x="46" y="112" width="108" height="18" fill="${c[1]}" ${S}/>` +
      `<rect x="46" y="88" width="108" height="26" fill="${c[0]}" ${S}/>` +
      `<path d="M46 98 q0 -14 14 -14 h80 q14 0 14 14 v-2 q-8 12 -16 0 q-8 12 -16 0 q-8 12 -16 0 q-8 12 -16 0 q-8 12 -16 0 q-8 12 -16 0 z" fill="${c[1]}" ${S}/>` +
      `<circle cx="100" cy="76" r="13" fill="${c[2]}" ${S}/><circle cx="95" cy="71" r="3" fill="#fff" opacity=".7"/>` +
      `<path d="M100 63 q-4 -10 6 -14 M100 63 q8 -6 14 0" fill="none" stroke="#6f8f4e" stroke-width="3" stroke-linecap="round"/>`;
  },
  cupcake(c){
    let stripes = '';
    for(let i=0;i<5;i++) stripes += `<path d="M${68+i*16} 124 L${72+i*14} 168" stroke="${INK}" stroke-width="2" opacity=".35" fill="none"/>`;
    return shadow(58) +
      `<path d="M54 120 L146 120 L132 168 L68 168 Z" fill="${c[3]}" ${S}/>` + stripes +
      `<ellipse cx="100" cy="118" rx="54" ry="15" fill="${c[1]}" ${S}/>` +
      `<ellipse cx="100" cy="98" rx="42" ry="14" fill="${c[1]}" ${S}/>` +
      `<ellipse cx="100" cy="80" rx="30" ry="12" fill="${c[1]}" ${S}/>` +
      `<path d="M88 72 q12 -22 24 0" fill="${c[1]}" ${S}/>` +
      cherry(100,52,c[2]);
  },
  tart(c){
    let fl = '';
    for(let i=0;i<9;i++) fl += `<path d="M${42+i*14.5} 132 v22" stroke="${INK}" stroke-width="2" opacity=".3"/>`;
    let berries = '';
    [[78,108],[100,100],[122,108],[89,118],[111,118],[100,112]].forEach(([x,y],i)=>
      berries += `<circle cx="${x}" cy="${y}" r="9" fill="${i%2?c[3]:c[2]}" ${S}/><circle cx="${x-3}" cy="${y-3}" r="2" fill="#fff" opacity=".7"/>`);
    return shadow(70) +
      `<path d="M36 126 h128 l-10 34 q-2 6 -8 6 h-92 q-6 0 -8 -6 z" fill="${c[0]}" ${S}/>` + fl +
      `<ellipse cx="100" cy="124" rx="64" ry="18" fill="${c[1]}" ${S}/>` + berries +
      `<path d="M96 96 q-2 -12 8 -16 q6 8 -8 16z" fill="#8fb36a" ${S}/>`;
  },
  macarons(c){
    const mac = (cx,cy,col) =>
      `<path d="M${cx-34} ${cy-8} q0 -20 34 -20 q34 0 34 20 z" fill="${col}" ${S}/>` +
      `<rect x="${cx-37}" y="${cy-8}" width="74" height="9" rx="4.500" fill="#fff" ${S}/>` +
      `<path d="M${cx-34} ${cy+1} q0 20 34 20 q34 0 34 -20 z" fill="${col}" ${S}/>`;
    return shadow(76) + mac(66,150,c[0]) + mac(134,150,c[1]) + mac(100,108,c[2]);
  },
  flan(c){
    return shadow(76) +
      `<ellipse cx="100" cy="158" rx="76" ry="14" fill="#fff" ${S}/>` +
      `<path d="M50 154 q0 -64 50 -64 q50 0 50 64 q-50 14 -100 0z" fill="${c[0]}" ${S}/>` +
      `<path d="M58 118 q4 -28 42 -28 q38 0 42 28 q-8 8 -16 0 q-10 14 -20 0 q-10 14 -20 0 q-8 8 -16 0z" fill="${c[2]}" ${S}/>` +
      `<circle cx="84" cy="106" r="4" fill="#fff" opacity=".5"/>`;
  },
  brownie(c){
    const sq = (x,y,w) =>
      `<rect x="${x}" y="${y+14}" width="${w}" height="36" rx="7" fill="${c[0]}" ${S}/>` +
      `<rect x="${x}" y="${y}" width="${w}" height="22" rx="7" fill="${c[1]}" ${S}/>` +
      `<circle cx="${x+w*.28}" cy="${y+9}" r="5" fill="${c[2]}" ${S}/><circle cx="${x+w*.66}" cy="${y+11}" r="5" fill="${c[2]}" ${S}/>`;
    return shadow(74) + sq(44,116,112) + sq(54,82,92) +
      `<path d="M62 94 q10 -10 20 0 t20 0 t20 0" fill="none" stroke="${c[3]}" stroke-width="4" stroke-linecap="round"/>`;
  }
};

DE.art = (spec) => wrap((types[spec.type] || types.layer)(spec.c));

/* ---- Torta personalizada (reacciona a las opciones) ---- */
function flower(cx,cy,r,col){
  let p = '';
  for(let i=0;i<5;i++){
    const a = i*72*Math.PI/180;
    p += `<circle cx="${(cx+Math.cos(a)*r).toFixed(1)}" cy="${(cy+Math.sin(a)*r).toFixed(1)}" r="${r*.8}" fill="${col}" ${S.replace('stroke-width="3"','stroke-width="2"')}/>`;
  }
  return p + `<circle cx="${cx}" cy="${cy}" r="${r*.55}" fill="#f7cf9b" stroke="${INK}" stroke-width="2"/>`;
}
DE.customArt = function(o){
  const size = DE.cfg.sizes.find(s=>s.id===o.size) || DE.cfg.sizes[1];
  const body = (DE.cfg.flavors.find(f=>f.id===o.flavor) || DE.cfg.flavors[0]).color;
  const fr   = (DE.cfg.colors.find(c=>c.id===o.color)   || DE.cfg.colors[0]).hex;
  const dark = ['chocolate','redvelvet'].includes(o.flavor);
  let t, bottom;
  let inner = shadow(78);
  if(size.tiers === 3){
    inner += tier(24,118,152,52,body,fr,5) + tier(46,82,108,40,body,fr,4) + tier(70,52,60,34,body,fr,3);
    t = {x:70,y:52,w:60}; bottom = {x:24,y:118,w:152,h:52};
  } else {
    inner += tier(32,108,136,60,body,fr,4) + tier(58,68,84,44,body,fr,3);
    t = {x:58,y:68,w:84}; bottom = {x:32,y:108,w:136,h:60};
  }
  const cx = t.x + t.w/2;
  switch(o.design){
    case 'boda':
      inner += flower(cx, t.y-6, 9, '#fff') + flower(t.x+6, t.y+20, 6, '#ffd9e0') + flower(t.x+t.w-6, t.y+20, 6, '#ffd9e0');
      for(let i=0;i<9;i++) inner += `<circle cx="${bottom.x+14+i*((bottom.w-28)/8)}" cy="${bottom.y+bottom.h-8}" r="3" fill="#fff" stroke="${INK}" stroke-width="1.5"/>`;
      break;
    case 'infantil': {
      const cols = ['#e0708f','#f7cf9b','#9a82c9','#6fb5e0','#8fb36a'];
      for(let i=0;i<16;i++) inner += `<circle cx="${bottom.x+12+((i*37)%(bottom.w-24))}" cy="${bottom.y+30+((i*23)%(bottom.h-40))}" r="3.200" fill="${cols[i%5]}"/>`;
      inner += `<path d="M${cx} ${t.y-30} l5 11 12 1.500 -9 8 3 12 -11 -6 -11 6 3 -12 -9 -8 12 -1.500z" fill="#f7cf9b" ${S}/>`;
      break; }
    case 'minimal':
      inner += `<circle cx="${cx-10}" cy="${t.y-4}" r="8" fill="#d9456a" ${S}/><circle cx="${cx+8}" cy="${t.y-6}" r="8" fill="#7a4fb3" ${S}/><circle cx="${cx}" cy="${t.y-15}" r="8" fill="#d9456a" ${S}/>` +
               `<path d="M${cx+14} ${t.y-12} q14 -10 20 4 q-14 8 -20 -4z" fill="#8fb36a" ${S}/>`;
      break;
    default: { // cumpleaños
      const cols = ['#e0708f','#9a82c9','#f7cf9b'];
      [.25,.5,.75].forEach((f,i)=>{
        const x = t.x + t.w*f;
        inner += `<rect x="${x-3}" y="${t.y-22}" width="6" height="20" rx="2" fill="${cols[i]}" ${S.replace('stroke-width="3"','stroke-width="2"')}/>` +
                 `<path d="M${x} ${t.y-38} q7 8 0 14 q-7 -6 0 -14z" fill="#ffb347" stroke="${INK}" stroke-width="2"/>`;
      });
      for(let i=0;i<10;i++) inner += `<circle cx="${bottom.x+12+((i*29)%(bottom.w-24))}" cy="${bottom.y+34+((i*17)%(bottom.h-44))}" r="2.800" fill="${['#e0708f','#f7cf9b','#9a82c9'][i%3]}"/>`;
    }
  }
  if(o.msg){
    const m = o.msg.length > 20 ? o.msg.slice(0,20) : o.msg;
    const esc = m.replace(/[&<>]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[ch]));
    inner += `<text x="100" y="${bottom.y+bottom.h*.66}" text-anchor="middle" font-family="Lora,Georgia,serif" font-style="italic" font-weight="700" font-size="${size.tiers===3?10:11.5}" fill="${dark?'#fff':INK}">${esc}</text>`;
  }
  return wrap(inner);
};
})();
