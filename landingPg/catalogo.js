import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAywK-WTOrn0Xw0MV5Jr9zr1ZKUvSBcCW0",
  authDomain: "appmuffatao.firebaseapp.com",
  projectId: "appmuffatao",
  storageBucket: "appmuffatao.firebasestorage.app",
  messagingSenderId: "504077340677",
  appId: "1:504077340677:web:ac39802ad01a88cc9b8c6c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const productGrid = document.getElementById("product-grid");
const categoriesContainer = document.getElementById("categories-container");
const searchInput = document.getElementById("search-input");
const btnFiltros = document.getElementById("btn-filtros");
const filterMenu = document.getElementById("filter-menu");
const selectOrdem = document.getElementById("select-ordem");
const checkApenasPromo = document.getElementById("check-apenas-promo");
const btnLimparFiltros = document.getElementById("btn-limpar-filtros");

let todosProdutos = [];
let categoriaAtual = "Todas";
let termoBusca = "";
let ordemAtual = "padrao";
let apenasPromo = false;

// Escuta a coleção "produtos" do seu Firebase em tempo real
onSnapshot(collection(db, "produtos"), (snapshot) => {
  todosProdutos = [];
  snapshot.forEach((doc) => {
    todosProdutos.push({ id: doc.id, ...doc.data() });
  });

  renderizarCategorias();
  renderizarProdutos();
});

// Eventos da barra de pesquisa
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    termoBusca = e.target.value.trim().toLowerCase();
    renderizarProdutos();
  });
}

// Abrir/fechar menu de filtros
if (btnFiltros && filterMenu) {
  btnFiltros.addEventListener("click", (e) => {
    e.stopPropagation();
    filterMenu.classList.toggle("escondido");
  });

  document.addEventListener("click", (e) => {
    if (!filterMenu.contains(e.target) && e.target !== btnFiltros) {
      filterMenu.classList.add("escondido");
    }
  });
}

// Ordenação por preço ou nome
if (selectOrdem) {
  selectOrdem.addEventListener("change", (e) => {
    ordemAtual = e.target.value;
    renderizarProdutos();
  });
}

// Checkbox de apenas ofertas dentro dos filtros
if (checkApenasPromo) {
  checkApenasPromo.addEventListener("change", (e) => {
    apenasPromo = e.target.checked;
    renderizarProdutos();
  });
}

// Limpar todos os filtros e busca
if (btnLimparFiltros) {
  btnLimparFiltros.addEventListener("click", () => {
    categoriaAtual = "Todas";
    termoBusca = "";
    ordemAtual = "padrao";
    apenasPromo = false;

    if (searchInput) searchInput.value = "";
    if (selectOrdem) selectOrdem.value = "padrao";
    if (checkApenasPromo) checkApenasPromo.checked = false;

    renderizarCategorias();
    renderizarProdutos();
  });
}

function renderizarCategorias() {
  if (!categoriesContainer) return;

  const categoriasBanco = [
    ...new Set(
      todosProdutos
        .map((p) => p.categoria)
        .filter(
          (cat) =>
            Boolean(cat) &&
            cat.trim().toLowerCase() !== "promoção" &&
            cat.trim().toLowerCase() !== "promocao"
        )
    )
  ];

  const categorias = ["Todas", "Promoção", ...categoriasBanco];
  categoriesContainer.innerHTML = "";

  categorias.forEach((cat) => {
    const btn = document.createElement("button");
    const isPromo = cat === "Promoção";
    const isActive = cat === categoriaAtual;

    btn.className =
      "category-btn" +
      (isPromo ? " promo-btn" : "") +
      (isActive ? " active" : "");

    btn.textContent = cat;
    btn.onclick = () => {
      categoriaAtual = cat;
      renderizarCategorias();
      renderizarProdutos();
    };
    categoriesContainer.appendChild(btn);
  });
}

function renderizarProdutos() {
  if (!productGrid) return;
  productGrid.innerHTML = "";

  let filtrados = [...todosProdutos];

  // 1. Filtro por Categoria ou Aba Promoção
  if (categoriaAtual === "Promoção") {
    filtrados = filtrados.filter((p) => Boolean(p.promocao) === true);
  } else if (categoriaAtual !== "Todas") {
    filtrados = filtrados.filter((p) => p.categoria === categoriaAtual);
  }

  // 2. Filtro extra do checkbox "Mostrar apenas ofertas"
  if (apenasPromo) {
    filtrados = filtrados.filter((p) => Boolean(p.promocao) === true);
  }

  // 3. Filtro por Barra de Pesquisa (nome ou código)
  if (termoBusca !== "") {
    filtrados = filtrados.filter((p) => {
      const nome = (p.nome || "").toLowerCase();
      const codigo = (p.codigo || p.id || "").toString().toLowerCase();
      return nome.includes(termoBusca) || codigo.includes(termoBusca);
    });
  }

  // 4. Ordenação selecionada no menu de filtros
  if (ordemAtual === "menor-preco") {
    filtrados.sort((a, b) => Number(a.preco || 0) - Number(b.preco || 0));
  } else if (ordemAtual === "maior-preco") {
    filtrados.sort((a, b) => Number(b.preco || 0) - Number(a.preco || 0));
  } else if (ordemAtual === "az") {
    filtrados.sort((a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"));
  }

  if (filtrados.length === 0) {
    productGrid.innerHTML = "<p>Nenhum produto encontrado com esses filtros.</p>";
    return;
  }

  filtrados.forEach((produto, index) => {
    const card = document.createElement("div");
    card.className = "product-card";

    const temImagemValida = produto.imagem && produto.imagem.trim().startsWith("http");
    const urlFoto = temImagemValida
      ? produto.imagem
      : "https://www.foodish-api.com/images/dessert/dessert" + ((index % 36) + 1) + ".jpg";
    const precoFormatado = Number(produto.preco || 0).toFixed(2).replace(".", ",");

    card.innerHTML = `
      <img src="${urlFoto}" alt="${produto.nome || "Produto"}" class="product-image">
      <div class="product-info">
        <span class="product-category">${produto.categoria || ""}</span>
        <h3 class="product-title">${produto.nome || "Produto sem nome"}</h3>
        <p class="product-price">R$ ${precoFormatado}</p>
        ${produto.promocao ? '<span class="promo-badge">Promoção</span>' : ""}
      </div>
    `;

    productGrid.appendChild(card);
  });
}