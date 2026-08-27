// Reduz uma foto escolhida pelo casal ANTES de ela sair do navegador.
//
// Por que: a foto não vira mais arquivo no servidor — ela é guardada como
// texto dentro do próprio banco, junto do presente ou da galeria. Uma foto
// de celular tem 4 a 8 MB, o que estouraria o limite de envio do Vercel
// (4,5 MB por pedido) e encheria o banco à toa. Depois de reduzida aqui,
// a mesma foto fica com ~150 a 400 KB e continua nítida na tela.

const LADO_MAXIMO = 1200; // pixels no lado maior
const TAMANHO_ALVO = 700 * 1024; // ~700 KB depois de reduzida
const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Lê o arquivo do disco e devolve uma imagem já carregada.
function carregarImagem(arquivo) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onerror = () => reject(new Error("Não consegui ler essa foto."));
    leitor.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Esse arquivo não parece ser uma imagem."));
      img.onload = () => resolve(img);
      img.src = leitor.result;
    };
    leitor.readAsDataURL(arquivo);
  });
}

// Recebe o arquivo escolhido e devolve o endereço da foto já reduzida
// (um texto que começa com "data:image/jpeg;base64,...").
export async function prepararFoto(arquivo) {
  if (!TIPOS_ACEITOS.includes(arquivo.type)) {
    throw new Error("Formato de imagem não aceito (use JPG, PNG, WEBP ou GIF).");
  }

  const img = await carregarImagem(arquivo);

  // Encolhe proporcionalmente até o lado maior caber em LADO_MAXIMO.
  const maior = Math.max(img.width, img.height);
  const escala = maior > LADO_MAXIMO ? LADO_MAXIMO / maior : 1;
  const largura = Math.round(img.width * escala);
  const altura = Math.round(img.height * escala);

  const tela = document.createElement("canvas");
  tela.width = largura;
  tela.height = altura;
  const pincel = tela.getContext("2d");
  // Fundo branco: PNG/GIF podem ser transparentes, e o JPEG não guarda
  // transparência — sem isso o fundo sairia preto.
  pincel.fillStyle = "#ffffff";
  pincel.fillRect(0, 0, largura, altura);
  pincel.drawImage(img, 0, 0, largura, altura);

  // Vai baixando a qualidade até caber no tamanho alvo. Na prática a
  // primeira tentativa já resolve; as outras existem pra foto muito grande.
  let qualidade = 0.82;
  let resultado = tela.toDataURL("image/jpeg", qualidade);
  while (resultado.length > TAMANHO_ALVO && qualidade > 0.4) {
    qualidade -= 0.12;
    resultado = tela.toDataURL("image/jpeg", qualidade);
  }

  if (resultado.length > 3 * 1024 * 1024) {
    throw new Error("Essa foto é grande demais. Tente outra imagem.");
  }
  return resultado;
}
