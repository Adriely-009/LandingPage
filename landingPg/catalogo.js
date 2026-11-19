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

let todosProdutos = [];
let categoriaAtual = "Todas";

// Escuta a coleção "produtos" do seu Firebase em tempo real
onSnapshot(collection(db, "produtos"), (snapshot) => {
  todosProdutos = [];
  snapshot.forEach((doc) => {
    todosProdutos.push({ id: doc.id, ...doc.data() });
  });

  renderizarCategorias();
  renderizarProdutos();
});

function renderizarCategorias() {
  if (!categoriesContainer) return;

  const categoriasBanco = [
    ...new Set(
      todosProdutos
        .map((p) => p.categoria)
        .filter((cat) => Boolean(cat) && cat.trim().toLowerCase() !== "promoção" && cat.trim().toLowerCase() !== "promocao")
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

  let filtrados = todosProdutos;

  if (categoriaAtual === "Promoção") {
    filtrados = todosProdutos.filter((p) => Boolean(p.promocao) === true);
  } else if (categoriaAtual !== "Todas") {
    filtrados = todosProdutos.filter((p) => p.categoria === categoriaAtual);
  }

  if (filtrados.length === 0) {
    productGrid.innerHTML =
      categoriaAtual === "Promoção"
        ? "<p>Nenhum produto em promoção no momento.</p>"
        : "<p>Nenhum produto cadastrado nesta categoria.</p>";
    return;
  }

  filtrados.forEach((produto, index) => {
    const card = document.createElement("div");
    card.className = "product-card";

    const temImagemValida = produto.imagem && produto.imagem.trim().startsWith("http");
    const numeroUnico = index + 1;

    const urlFoto = temImagemValida
      ? produto.imagem
      : "https://www.foodish-api.com/images/dessert/dessert" + ((index % 36) + 1) + ".jpg";
    const precoFormatado = Number(produto.preco || 0).toFixed(2).replace(".", ",");

    card.innerHTML = `
      <img src="${urlFoto}" alt="${produto.nome || 'Produto'}" class="product-image">
      <div class="product-info">
        <span class="product-category">${produto.categoria || ""}</span>
        <h3 class="product-title">${produto.nome || "Produto sem nome"}</h3>
        <p class="product-price">R$ ${precoFormatado}</p>
        ${produto.promocao ? '<span class="promo-badge">Promoção</span>' : ''}
      </div>
    `;

    productGrid.appendChild(card);
  });
}
