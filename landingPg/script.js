import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

let todosProdutos = [];
let categoriaAtiva = 'TODOS';

document.addEventListener('DOMContentLoaded', () => {

  const productGrid = document.querySelector('.product-grid') || document.getElementById('product-grid');
  const categoryBtns = document.querySelectorAll('.category-btn');
  const formAuth = document.querySelector('.form-auth') || document.getElementById('form-cadastro');

  if (productGrid) {

    onSnapshot(collection(db, "produtos"), (snapshot) => {
      todosProdutos = [];

      snapshot.forEach((docSnap) => {
        todosProdutos.push(docSnap.data());
      });

      renderizarProdutos();
    });

    if (categoryBtns.length > 0) {
      categoryBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          categoryBtns.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');

          categoriaAtiva = (btn.getAttribute('data-categoria') || btn.textContent).trim().toUpperCase();
          renderizarProdutos();
        });
      });
    }
  }

  function renderizarProdutos() {
    if (!productGrid) return;
    productGrid.innerHTML = '';

    let produtosFiltrados = todosProdutos;

    if (categoriaAtiva === 'OFERTAS' || categoriaAtiva === 'PROMOÇÕES' || categoriaAtiva === 'PROMO') {
      produtosFiltrados = todosProdutos.filter(p => p.promocao === true);
    } else if (categoriaAtiva !== 'TODOS' && categoriaAtiva !== 'TODAS') {
      produtosFiltrados = todosProdutos.filter(p => 
        p.categoria && p.categoria.trim().toUpperCase() === categoriaAtiva
      );
    }

    if (produtosFiltrados.length === 0) {
      productGrid.innerHTML = `
        <p style="grid-column: 1 / -1; text-align: center; color: #777; padding: 40px; font-size: 16px;">
          Nenhum produto encontrado nesta categoria.
        </p>
      `;
      return;
    }

    produtosFiltrados.forEach((prod) => {
      const card = document.createElement('div');
      card.className = 'product-card';

      const precoFormatado = Number(prod.preco || 0).toFixed(2).replace('.', ',');
      const imagemUrl = prod.imagem || 'https://via.placeholder.com/300x180?text=Sem+Foto';

      card.innerHTML = `
        ${prod.promocao ? '<span class="promo-badge">OFERTA 🔥</span>' : ''}
        <div class="image-container">
          <img src="${imagemUrl}" alt="${prod.nome}">
        </div>
        <div class="product-info">
          <span class="product-category">${prod.categoria || 'Geral'}</span>
          <h3 class="product-title">${prod.nome}</h3>
          <span class="product-barcode">EAN: ${prod.codigo || 'N/A'}</span>
          <div class="product-price">R$ ${precoFormatado}</div>
        </div>
      `;

      productGrid.appendChild(card);
    });
  }

  if (formAuth) {
    formAuth.addEventListener('submit', async (e) => {
      e.preventDefault();

      const codigoInput = document.getElementById('codigo') || document.getElementById('input-codigo');
      const nomeInput = document.getElementById('nome') || document.getElementById('input-nome');
      const precoInput = document.getElementById('preco') || document.getElementById('input-preco');
      const categoriaSelect = document.getElementById('categoria') || document.getElementById('input-categoria');
      const imagemInput = document.getElementById('imagem') || document.getElementById('input-imagem');

      const codigo = codigoInput ? codigoInput.value.trim() : '';
      const nome = nomeInput ? nomeInput.value.trim() : '';
      const preco = precoInput ? parseFloat(precoInput.value) : 0;
      const categoria = categoriaSelect ? categoriaSelect.value : 'Mercearia';
      const imagem = imagemInput ? imagemInput.value.trim() : '';

      if (!codigo || !nome || isNaN(preco)) {
        alert("Por favor, preencha o código, o nome e o preço corretamente.");
        return;
      }

      try {

        await setDoc(doc(db, "produtos", codigo), {
          codigo,
          nome,
          preco,
          categoria,
          promocao: false,
          imagem: imagem || "https://via.placeholder.com/300x180?text=Produto",
          cadastradoEm: new Date().toISOString()
        });

        alert("🚀 Produto cadastrado com sucesso no Firebase!");
        formAuth.reset();
      } catch (error) {
        alert("Erro ao salvar produto: " + error.message);
      }
    });
  }
});