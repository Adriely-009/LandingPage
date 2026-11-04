import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAMGQ-ht72nIbRYBht67dHTG6e914lJajY",
  authDomain: "muffatao.firebaseapp.com",
  projectId: "muffatao",
  storageBucket: "muffatao.firebasestorage.app",
  messagingSenderId: "72950213242",
  appId: "1:72950213242:web:354c0e83ee44054e12a9c3",
  measurementId: "G-XQGW3MNT3C"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const formCadastro = document.getElementById('form-cadastro');
const btnGoogle = document.getElementById('btn-google');

function finalizarAutenticacao(user) {
    const dadosUsuario = {
        nome: user.displayName || 'Usuário',
        email: user.email,
        foto: user.photoURL || 'imagens/avatar-padrao.png'
    };
    
    localStorage.setItem('usuarioLogado', JSON.stringify(dadosUsuario));
    window.location.href = 'index.html';
}

if (btnGoogle) {
    btnGoogle.addEventListener('click', async () => {
        try {
            const resultado = await signInWithPopup(auth, googleProvider);
            finalizarAutenticacao(resultado.user);
        } catch (erro) {
            console.error("Erro no login com Google:", erro);
            alert("Falha ao conectar com o Google. Certifique-se de estar rodando o site pelo Live Server. " + erro.code);
        }
    });
}

if (formCadastro) {
    formCadastro.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        try {
            try {
                const resultadoLogin = await signInWithEmailAndPassword(auth, email, senha);
                finalizarAutenticacao(resultadoLogin.user);
            } catch (erroLogin) {
                if (erroLogin.code === 'auth/user-not-found' || erroLogin.code === 'auth/invalid-credential' || erroLogin.code === 'auth/invalid-email') {
                    const resultadoCadastro = await createUserWithEmailAndPassword(auth, email, senha);
                    finalizarAutenticacao(resultadoCadastro.user);
                } else {
                    throw erroLogin;
                }
            }
        } catch (erro) {
            console.error("Erro na autenticação:", erro);
            alert("Erro ao processar os dados. Lembre-se que a senha deve ter pelo menos 6 dígitos.");
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const containerUsuario = document.getElementById('container-usuario');
    const usuarioValido = localStorage.getItem('usuarioLogado');

    if (usuarioValido && containerUsuario) {
        const usuario = JSON.parse(usuarioValido);
        
        containerUsuario.innerHTML = `
            <div class="perfil-header" style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <img id="foto-perfil-logout" src="${usuario.foto}" alt="Foto de ${usuario.nome}" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid #ef3e36; object-fit: cover;">
            </div>
        `;

        document.getElementById('foto-perfil-logout').addEventListener('click', toggleMenuUsuario);
    }
});

function toggleMenuUsuario() {
    if(confirm("Deseja sair da sua conta?")) {
        localStorage.removeItem('usuarioLogado');
        window.location.reload();
    }
}