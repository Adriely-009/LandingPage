// Importa os módulos necessários do SDK do Firebase do CDN oficial
import { initializeApp } from "https://gstatic.com";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword 
} from "https://gstatic.com";

// TODO: Substitua o objeto abaixo com as credenciais do seu projeto criado no console do Firebase
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_AUTH_DOMAIN",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_STORAGE_BUCKET",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
    appId: "SEU_APP_ID"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Elementos da Interface
const formCadastro = document.getElementById('form-cadastro');
const btnGoogle = document.getElementById('btn-google');

// Função utilitária para salvar a sessão e voltar para a home
function finalizarAutenticacao(user) {
    const dadosUsuario = {
        nome: user.displayName || 'Usuário',
        email: user.email,
        foto: user.photoURL || 'imagens/avatar-padrao.png' // Fallback caso não tenha foto
    };
    
    // Armazena no navegador temporariamente para uso rápido na index.html
    localStorage.setItem('usuarioLogado', JSON.stringify(dadosUsuario));
    
    // Redireciona para a página inicial
    window.location.href = 'index.html';
}

// 1. LOGIN COM O GOOGLE
btnGoogle.addEventListener('click', async () => {
    try {
        const resultado = await signInWithPopup(auth, googleProvider);
        finalizarAutenticacao(resultado.user);
    } catch (erro) {
        console.error("Erro no login com Google:", erro);
        alert("Falha ao conectar com o Google. Tente novamente.");
    }
});

// 2. CADASTRO / LOGIN TRADICIONAL (E-mail e Senha)
formCadastro.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        // Tenta fazer login primeiro, se falhar, tenta criar a conta
        try {
            const resultadoLogin = await signInWithEmailAndPassword(auth, email, senha);
            finalizarAutenticacao(resultadoLogin.user);
        } catch (erroLogin) {
            // Código de erro comum quando o usuário não existe
            if (erroLogin.code === 'auth/user-not-found' || erroLogin.code === 'auth/invalid-credential') {
                const resultadoCadastro = await createUserWithEmailAndPassword(auth, email, senha);
                finalizarAutenticacao(resultadoCadastro.user);
            } else {
                throw erroLogin;
            }
        }
    } catch (erro) {
        console.error("Erro na autenticação:", erro);
        alert("Erro ao processar os dados. Verifique a senha.");
    }
});
    document.addEventListener('DOMContentLoaded', () => {
        const containerUsuario = document.getElementById('container-usuario');
        const usuarioValido = localStorage.getItem('usuarioLogado');

        if (usuarioValido) {
            const usuario = JSON.parse(usuarioValido);
            
            // Substitui o botão "Entrar" pela foto do perfil estilizada no canto superior direito
            containerUsuario.innerHTML = `
                <div class="perfil-header" style="display: flex; align-items: center; gap: 10px; cursor: pointer;" onclick="toggleMenuUsuario()">
                    <img src="${usuario.foto}" alt="Foto de ${usuario.nome}" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid #ef3e36; object-fit: cover;">
                </div>
            `;
        }
    });

    // Função opcional caso queira dar a opção do usuário deslogar ao clicar na foto
    function toggleMenuUsuario() {
        if(confirm("Deseja sair da sua conta?")) {
            localStorage.removeItem('usuarioLogado');
            window.location.reload();
        }
    }