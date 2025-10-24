(() => {
  const API_BASE = "http://localhost:4001/api/v1";
  const URL_PROD = `${API_BASE}/productos`;
  const URL_CATS = `${API_BASE}/productos/categorias`;

  const $ = (s, r=document) => r.querySelector(s);
  const elChips = $("#catChips");
  const elGrid  = $("#gridProducts");
  const elMsg   = $("#msg");
  const elSearch= $("#searchBox");
  const btnLogout = $("#btnLogout");

  const state = {
    categoria: "Todos",
    search: "",
    productos: [],
    allProducts: [],
    categorias: [],
    initializedChips: false,
  };

  const PEN = (n) => `S/ ${Number(n || 0).toFixed(2)}`;
  const ph  = (t) => `https://via.placeholder.com/600x420?text=${encodeURIComponent(t||"Producto")}`;

  async function fetchJSON(url){
    const token = localStorage.getItem("token");
    const headers = { "Content-Type":"application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async function loadCategorias(){ state.categorias = await fetchJSON(URL_CATS); }
  async function loadProductos(cat="Todos"){
    const qs = cat && cat!=="Todos" ? `?categoria=${encodeURIComponent(cat)}` : "";
    state.productos = await fetchJSON(`${URL_PROD}${qs}`);
    if (!state.allProducts.length) state.allProducts = await fetchJSON(URL_PROD);
  }

  /* ----------------------------- Chips estables ---------------------------- */
  function countsFromAll() {
    return state.allProducts.reduce((acc,p)=>{
      if (p?.activo===false) return acc;
      const k = p.categoria || "Sin categoría";
      acc[k] = (acc[k]||0) + 1;
      acc.__all = (acc.__all||0) + 1;
      return acc;
    }, {});
  }

  function buildChipsOnce() {
    if (state.initializedChips) return;
    const counts = countsFromAll();
    const frag = document.createDocumentFragment();

    // helper para crear chip
    const mk = (label, key) => {
      const b = document.createElement("button");
      b.className = "chip";
      b.dataset.cat = key;                 // ← clave estable
      const txt = document.createElement("span");
      txt.className = "label";
      txt.textContent = label;
      const cnt = document.createElement("span");
      cnt.className = "count";
      cnt.textContent = ` (${key==="__all"? counts.__all : counts[key] || 0})`;
      b.append(txt, cnt);
      return b;
    };

    // chip "Todos"
    frag.appendChild(mk("Todos los productos", "__all"));
    // chips por categoría
    state.categorias.sort((a,b)=>a.localeCompare(b,"es")).forEach(cat=>{
      frag.appendChild(mk(cat, cat));
    });

    elChips.appendChild(frag);
    state.initializedChips = true;
    updateActiveChip();
  }

  function updateCounts() {
    const counts = countsFromAll();
    // Todos
    const all = elChips.querySelector('[data-cat="__all"] .count');
    if (all) all.textContent = ` (${counts.__all || 0})`;
    // Categs
    state.categorias.forEach(cat => {
      const el = elChips.querySelector(`[data-cat="${CSS.escape(cat)}"] .count`);
      if (el) el.textContent = ` (${counts[cat] || 0})`;
    });
  }

  function updateActiveChip() {
    const current = state.categoria === "Todos" ? "__all" : state.categoria;
    elChips.querySelectorAll(".chip").forEach(ch=>{
      ch.classList.toggle("active", ch.dataset.cat === current);
    });
  }

  // delegación de clicks (no recrea DOM)
  elChips.addEventListener("click", async (ev) => {
    const btn = ev.target.closest(".chip");
    if (!btn) return;
    const key = btn.dataset.cat;
    const cat = key === "__all" ? "Todos" : key;

    if (state.categoria === cat) return;

    state.categoria = cat;
    updateActiveChip();
    await loadProductos(cat);
    renderGrid();
  });

  /* ------------------------------- Render grid ----------------------------- */
  function renderGrid(){
    const q = state.search.toLowerCase().trim();
    const list = state.productos.filter(p=>{
      if (!q) return true;
      return (p.nombre||"").toLowerCase().includes(q)
          || (p.marca||"").toLowerCase().includes(q)
          || (p.categoria||"").toLowerCase().includes(q);
    });

    elGrid.innerHTML = "";
    if (!list.length){ elMsg.textContent="No hay productos que coincidan con la búsqueda."; return; }
    elMsg.textContent = "";

    const frag = document.createDocumentFragment();
    list.forEach(p=>{
      const art = document.createElement("article"); art.className="card";
      const imgw = document.createElement("div"); imgw.className="imgwrap";
      const img = document.createElement("img");
      img.alt = p.nombre||"Producto"; img.loading="lazy";
      img.src = p.imagenUrl || ph(p.nombre);
      img.onerror = () => { img.onerror=null; img.src=ph(p.nombre); };
      imgw.appendChild(img);

      const h3 = document.createElement("h3"); h3.className="title"; h3.textContent=p.nombre;
      const d  = document.createElement("p");  d.className="desc";
      d.textContent = [p.marca, p.unidad].filter(Boolean).join(" · ") || p.categoria || "";
      const price = document.createElement("div"); price.className="price"; price.textContent=PEN(p.precio);

      const cta = document.createElement("div"); cta.className="cta";
      const btn = document.createElement("button"); btn.className="btn-add"; btn.textContent="Agregar al Carrito";
      btn.addEventListener("click", ()=> alert(`Agregado: ${p.nombre}`));
      cta.appendChild(btn);

      art.append(imgw,h3,d,price,cta);
      frag.appendChild(art);
    });
    elGrid.appendChild(frag);
  }

  /* ------------------------------ Búsqueda / misc -------------------------- */
  const debounce = (fn,ms=300)=>{let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms);};};
  elSearch.addEventListener("input", debounce(e=>{ state.search=e.target.value||""; renderGrid(); },250));
  btnLogout.addEventListener("click", ()=>{ localStorage.removeItem("token"); location.href="/login.html"; });

  /* --------------------------------- init ---------------------------------- */
  (async function init(){
    try{
      await loadCategorias();
      await loadProductos("Todos");
      buildChipsOnce();   // ← crea chips solo 1 vez
      updateCounts();     // ← pinta contadores
      renderGrid();
    }catch(e){ console.error(e); elMsg.textContent="No se pudo cargar el catálogo."; }
  })();
})();
