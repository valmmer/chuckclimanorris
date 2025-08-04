// Melhoria e efeito realizado por Valmer Mariano aprovado por:
// Catarine formiga de farias
// Cassia Deiro Brito Mota
// Carla Paloma Freires dos Santos
// Paola Pontes

// Módulos essenciais
import fetch from "node-fetch"; // Para requisições HTTP
import dotenv from "dotenv"; // Para variáveis de ambiente
import chalk from "chalk"; // Para cores no terminal
import readline from "readline"; // Para ler entrada do usuário

// Carrega variáveis de ambiente
dotenv.config();

// Interface para leitura do terminal
const interfaceLeitura = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// --- Funções de Apresentação ---

// Desenha linha separadora
function desenharLinhaSeparadora() {
  console.log(chalk.gray("━".repeat(50)));
}

// Exibe cabeçalho do aplicativo
function exibirCabecalho() {
  console.clear();
  console.log(chalk.hex("#FF6B6B").bold("\n" + "★".repeat(56)));
  console.log(
    chalk
      .hex("#4ECDC4")
      .bold("       CLIMA E HUMOR - SEU DIA MAIS ALEGRE       ")
  );
  console.log(chalk.hex("#FF6B6B").bold("★".repeat(56) + "\n"));
}

// Gerencia animação de espera
const animacaoTerminal = (() => {
  let intervaloAnimacao;
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;

  return {
    iniciar: (msg = "Buscando informações...") => {
      intervaloAnimacao = setInterval(() => {
        process.stdout.write(`\r${chalk.yellow(frames[i])} ${msg} `);
        i = (i + 1) % frames.length;
      }, 100);
    },
    parar: () => {
      clearInterval(intervaloAnimacao);
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
    },
  };
})();

// --- Funções Auxiliares ---

/**
 * Faz requisição GET a uma API e retorna JSON.
 * @param {string} url - URL da API.
 * @returns {Promise<Object|null>} Dados JSON ou null em erro.
 */
async function fazerRequisicaoAPI(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP: ${res.status} - ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error(
      chalk.bgHex("#EF476F").white.bold(" ERRO ") +
        " " +
        chalk.hex("#EF476F")(`Conexão falhou: ${error.message}`)
    );
    return null;
  }
}

// --- Lógica Principal ---

/**
 * Busca e exibe o clima para uma cidade.
 * @param {string} cidade - Nome da cidade.
 * @returns {Promise<boolean>} Sucesso ou falha.
 */
async function buscarClima(cidade) {
  animacaoTerminal.iniciar("Buscando clima...");
  const geoData = await fazerRequisicaoAPI(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      cidade
    )}&count=1`
  );
  animacaoTerminal.parar();

  if (!geoData?.results?.[0]) {
    console.log(
      chalk.bgHex("#FFD166").hex("#333").bold(" ATENÇÃO ") +
        " " +
        chalk.hex("#FFD166")("Cidade não encontrada. Tente novamente.")
    );
    return false;
  }

  const { latitude, longitude, name, country } = geoData.results[0];

  animacaoTerminal.iniciar("Obtendo dados do tempo...");
  const climaData = await fazerRequisicaoAPI(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
  );
  animacaoTerminal.parar();

  if (!climaData?.current_weather) {
    console.log(
      chalk.bgHex("#EF476F").white.bold(" ERRO ") +
        " " +
        chalk.hex("#EF476F")("Falha ao obter dados do clima.")
    );
    return false;
  }

  const { temperature } = climaData.current_weather;

  desenharLinhaSeparadora();
  console.log(chalk.hex("#1A535C").bold(`CLIMA AGORA`));
  console.log(
    `${chalk.hex("#4ECDC4").bold("📍 Local:")} ${chalk.hex("#F7FFF7")(
      name
    )}, ${chalk.hex("#F7FFF7")(country)}`
  );

  // Define cor da temperatura
  const corTemperatura =
    temperature > 30
      ? chalk.hex("#FF6B6B")
      : temperature < 15
      ? chalk.hex("#1E90FF")
      : chalk.hex("#FFD166");
  console.log(
    `${chalk.hex("#4ECDC4").bold("🌡️  Temperatura:")} ${corTemperatura.bold(
      temperature + "°C"
    )}`
  );
  desenharLinhaSeparadora();

  return true;
}

/**
 * Traduz texto usando a API MyMemory.
 * @param {string} texto - Texto a traduzir.
 * @param {string} de - Idioma de origem (ex: "en").
 * @param {string} para - Idioma de destino (ex: "pt").
 * @returns {Promise<string>} Texto traduzido ou original em erro.
 */
async function traduzirTexto(texto, de = "en", para = "pt") {
  const urlTraducao = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    texto
  )}&langpair=${de}|${para}`;
  const traducaoData = await fazerRequisicaoAPI(urlTraducao);
  return traducaoData?.responseData?.translatedText || texto;
}

/**
 * Busca e exibe piada do Chuck Norris.
 */
async function buscarPiada() {
  animacaoTerminal.iniciar("Buscando piada...");
  const piadaData = await fazerRequisicaoAPI(
    "https://api.chucknorris.io/jokes/random"
  );
  animacaoTerminal.parar();

  if (!piadaData?.value) {
    console.log(
      chalk.bgHex("#EF476F").white.bold(" ERRO ") +
        " " +
        chalk.hex("#EF476F")("Chuck Norris está ocupado demais para piadas!")
    );
    return;
  }

  const piadaTraduzida = await traduzirTexto(piadaData.value);

  desenharLinhaSeparadora();
  console.log(chalk.hex("#FFD166").bold("😂   MOMENTO CHUCK NORRIS"));
  console.log(chalk.hex("#F7FFF7")(`💬   ${piadaTraduzida}`));
  desenharLinhaSeparadora();
}

// --- Função Principal ---

/**
 * Inicia o aplicativo.
 */
async function iniciarAplicativo() {
  exibirCabecalho();
  console.log(
    chalk.hex("#F7FFF7")("Olá! Sou seu assistente meteorológico pessoal 🌈\n") +
      chalk.hex("#FFD166")("Me diga onde você está e eu trarei:") +
      chalk.hex("#4ECDC4")("\n✅ Previsão do tempo atual") +
      chalk.hex("#FF6B6B")("\n✅ Uma piada épica do Chuck Norris!") +
      "\n"
  );

  interfaceLeitura.question(
    chalk.hex("#4ECDC4")("📍 Em qual cidade você está agora? "),
    async (entradaUsuario) => {
      const cidadeFormatada = entradaUsuario.trim();

      if (!cidadeFormatada) {
        console.log(
          chalk.bgHex("#FF6B6B").white.bold(" OPSS ") +
            " " +
            chalk.hex("#FF6B6B")("Por favor, digite um nome de cidade.")
        );
        interfaceLeitura.close();
        return;
      }

      const sucessoClima = await buscarClima(cidadeFormatada);

      if (sucessoClima) {
        await buscarPiada();
        console.log(chalk.hex("#4ECDC4").bold("\nTenha um ótimo dia! 😊"));
      } else {
        console.log(
          chalk.hex("#FFD166")(
            "\nParece que não consegui encontrar o clima. Tente novamente mais tarde!"
          )
        );
      }

      interfaceLeitura.close();
    }
  );
}

// Inicia o aplicativo
iniciarAplicativo();
