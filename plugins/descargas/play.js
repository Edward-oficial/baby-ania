import axios from "axios";

const FLOR = "✿⃝░";

function mono(texto) {
  const upper = 0x1d670;
  const lower = 0x1d68a;
  const digit = 0x1d7f6;
  let resultado = "";
  for (const char of texto) {
    const code = char.codePointAt(0);
    if (code >= 65 && code <= 90) resultado += String.fromCodePoint(upper + (code - 65));
    else if (code >= 97 && code <= 122) resultado += String.fromCodePoint(lower + (code - 97));
    else if (digit !== null && code >= 48 && code <= 57) resultado += String.fromCodePoint(digit + (code - 48));
    else resultado += char;
  }
  return resultado;
}

function sansBold(texto) {
  const upper = 0x1d5d4;
  const lower = 0x1d5ee;
  const digit = 0x1d7ec;
  let resultado = "";
  for (const char of texto) {
    const code = char.codePointAt(0);
    if (code >= 65 && code <= 90) resultado += String.fromCodePoint(upper + (code - 65));
    else if (code >= 97 && code <= 122) resultado += String.fromCodePoint(lower + (code - 97));
    else if (digit !== null && code >= 48 && code <= 57) resultado += String.fromCodePoint(digit + (code - 48));
    else resultado += char;
  }
  return resultado;
}

function script(texto) {
  const upper = 0x1d4d0;
  const lower = 0x1d4ea;
  let resultado = "";
  for (const char of texto) {
    const code = char.codePointAt(0);
    if (code >= 65 && code <= 90) resultado += String.fromCodePoint(upper + (code - 65));
    else if (code >= 97 && code <= 122) resultado += String.fromCodePoint(lower + (code - 97));
    else resultado += char;
  }
  return resultado;
}

const DIVISOR_FINO = "﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏﹏";
const DIVISOR_ESTRELLAS = "＊┈┈┈┈＊┈┈┈┈＊┈┈";

const MAX_RESULTS = 8;

function truncate(texto, max) {
  if (!texto) return "";
  return texto.length > max ? texto.slice(0, max - 1) + "…" : texto;
}

export default {
  command: ["play", "ytplay"],
  category: "Descargas",
  description: "Busca una canción en YouTube y muestra una lista para elegir",
  run: async (sock, msg, args, context) => {
    const { chatId } = context;
    const query = args.join(" ");

    if (!query) {
      return sock.sendMessage(
        chatId,
        {
          text:
            `${FLOR} ${sansBold("Uso")}\n` +
            `Escribí: ${mono("play nombre de la canción")}`,
        },
        { quoted: msg }
      );
    }

    const isUrl = /^https?:\/\//i.test(query);

    try {
      let video = null;

      if (!isUrl) {
        const searchRes = await axios.get(
          `https://dv-edward.onrender.com/api/search/youtube?apiKey=edward&query=${encodeURIComponent(query)}`
        );

        if (!searchRes.data.status || !searchRes.data.data?.length) {
          return sock.sendMessage(
            chatId,
            {
              text: `${FLOR} ${sansBold("No se encontraron resultados")}`,
            },
            { quoted: msg }
          );
        }

        const resultados = searchRes.data.data.slice(0, MAX_RESULTS);

        if (resultados.length > 1) {
          const sections = [
            {
              title: sansBold("Resultados de búsqueda"),
              rows: resultados.map((v, i) => ({
                title: truncate(v.title, 60),
                description: `${script(formatDuration(v.duration))} • ${script(v.author)}`,
                rowId: `${i + 1}`,
              })),
            },
          ];

          const listMessage = {
            text:
              `${FLOR} ${sansBold("Resultados para")}: ${query}\n` +
              `${FLOR} Tocá una opción de la lista para descargarla.`,
            footer: "Cafirexos · BaileysX",
            title: sansBold("Elegí una canción"),
            buttonText: "Ver resultados",
            sections,
          };

          return sock.sendMessage(chatId, listMessage, { quoted: msg });
        }

        video = resultados[0];
      }

      const urlDescargar = isUrl ? query : video.url;

      await descargarYEnviar(sock, chatId, msg, urlDescargar, video);

    } catch (e) {
      await sock.sendMessage(
        chatId,
        {
          text: `${FLOR} ${sansBold("Ocurrió un error inesperado")}\n${e.message}`,
        },
        { quoted: msg }
      );
    }
  },
};

async function descargarYEnviar(sock, chatId, msg, url, video) {
  const dlRes = await axios.get(
    `https://dv-edward.onrender.com/api/download/ytaudio?url=${encodeURIComponent(url)}&apiKey=edward`
  );

  if (!dlRes.data.status) {
    return sock.sendMessage(
      chatId,
      {
        text: `${FLOR} ${sansBold("Error al obtener el audio")}`,
      },
      { quoted: msg }
    );
  }

  const result = dlRes.data.result;

  const detalles = video
    ? `${FLOR} ${script(video.author)}\n` +
      `${FLOR} ${script(video.views)}\n` +
      `${FLOR} ${script(video.publishedAt)}\n`
    : "";

  await sock.sendMessage(
    chatId,
    {
      image: { url: result.thumbnail },
      caption:
        `${DIVISOR_ESTRELLAS}\n` +
        `${FLOR} ${sansBold(result.title)}\n` +
        `${DIVISOR_FINO}\n` +
        `${FLOR} ${script(formatDuration(result.duration))}\n` +
        detalles +
        `${DIVISOR_ESTRELLAS}`,
    },
    { quoted: msg }
  );

  await sock.sendMessage(
    chatId,
    {
      audio: { url: result.download_url },
      mimetype: "audio/mp4",
      fileName: `${result.title}.mp3`,
    },
    { quoted: msg }
  );
}

function formatDuration(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}