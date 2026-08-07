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

    // si el "query" es en realidad una URL, viene de haber tocado un item de la lista:
    // se descarga directo sin volver a buscar
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

        // si hay más de un resultado, mostramos la lista para elegir
        if (resultados.length > 1) {
          const rows = resultados.map((v) => ({
            title: truncate(sansBold(v.title), 60),
            description: `${script(formatDuration(v.duration))} • ${script(v.author)}`,
            rowId: `.play ${v.url}`,
          }));

          return sock.sendMessage(
            chatId,
            {
              text:
                `${FLOR} ${sansBold("Resultados para")}: ${query}\n` +
                `${FLOR} Tocá una opción de la lista para descargarla.`,
              title: sansBold("🎧 Elegí una canción"),
              footer: "Cafirexos · BaileysX",
              buttons: [
                {
                  text: "📜 Ver resultados",
                  sections: [
                    {
                      title: "Resultados de búsqueda",
                      rows,
                    },
                  ],
                },
              ],
            },
            { quoted: msg }
          );
        }

        video = resultados[0];
      }

      const urlDescargar = isUrl ? query : video.url;

      const dlRes = await axios.get(
        `https://dv-edward.onrender.com/api/download/ytaudio?url=${encodeURIComponent(urlDescargar)}&apiKey=edward`
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
          title: sansBold(result.title),
          footer: "Cafirexos · BaileysX",
          buttons: [
            { text: "🎵 Enviar audio", id: `play ${urlDescargar}` },
            { text: "🔗 Ver en YouTube", url: urlDescargar },
          ],
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

function formatDuration(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}