// integrantes que participaram do projeto.

// Catarine formiga de farias
// Valmer Benedito Mariano
// Cassia Deiro Brito Mota
// Carla Paloma Freires dos Santos
// Paola Pontes

import fetch from "node-fetch";
import readline from "readline";

// Interface de leitura
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Requisição genérica
async function fazerRequisicaoAPI(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.log("Erro ao conectar: " + error.message);
    return null;
  }
}

// Clima
async function buscarClima(cidade) {
  const geoData = await fazerRequisicaoAPI(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      cidade
    )}&count=1`
  );

  if (!geoData?.results?.[0]) {
    console.log("Cidade não encontrada.");
    return false;
  }

  const { latitude, longitude, name, country } = geoData.results[0];

  const climaData = await fazerRequisicaoAPI(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
  );

  if (!climaData?.current_weather) {
    console.log("Não foi possível obter o clima.");
    return false;
  }

  const { temperature } = climaData.current_weather;

  console.log("Local:", name, ",", country);
  console.log("Temperatura atual:", temperature + "°C");

  return true;
}

// Traduz texto (via MyMemory)
async function traduzirTexto(texto, de = "en", para = "pt") {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    texto
  )}&langpair=${de}|${para}`;
  const data = await fazerRequisicaoAPI(url);
  return data?.responseData?.translatedText || texto;
}

// Piada
async function buscarPiada() {
  const data = await fazerRequisicaoAPI(
    "https://api.chucknorris.io/jokes/random"
  );

  if (!data?.value) {
    console.log("Erro ao buscar piada.");
    return;
  }

  const piada = await traduzirTexto(data.value);
  console.log("Piada do Chuck Norris:");
  console.log(piada);
}

// Principal
async function iniciarAplicativo() {
  console.log("Olá! Informe a cidade para ver o clima e uma piada:");
  rl.question("Cidade: ", async (entrada) => {
    const cidade = entrada.trim();
    if (!cidade) {
      console.log("Por favor, digite o nome da cidade.");
      rl.close();
      return;
    }

    const ok = await buscarClima(cidade);
    if (ok) {
      await buscarPiada();
    } else {
      console.log("Tente novamente mais tarde.");
    }

    rl.close();
  });
}

iniciarAplicativo();
