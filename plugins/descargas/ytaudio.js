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

export default {
  command: ["ytaudio", "ytmp3", "yta"],
  category: "Descargas",
  description: "Descarga el audio de un video de YouTube por enlace",
  run: async (sock, msg, args, context) => {
    const { chatId } = context;
    const url = args[0];

    if (!url) {
      return sock.sendMessage(
        chatId,
        {
          text:
            `${FLOR} ${sansBold("Uso")}\n` +
            `Escribí: ${mono("ytaudio https://youtu.be/...")}`,
        },
        { quoted: msg }
      );
    }

    try {
      const res = await axios.get(
        `https://dv-edward.onrender.com/api/download/ytaudio?url=${encodeURIComponent(url)}&apiKey=edward`
      );
      
      if (!res.data.status) {
        return sock.sendMessage(
          chatId,
          {
            text: `${FLOR} ${sansBold("No se pudo descargar el audio")}`,
          },
          { quoted: msg }
        );
      }

      const result = res.data.result;
      
      await sock.sendMessage(
        chatId,
        {
          image: { url: result.thumbnail },
          caption:
            `${DIVISOR_ESTRELLAS}\n` +
            `${FLOR} ${sansBold(result.title)}\n` +
            `${DIVISOR_FINO}\n` +
            `${FLOR} ${script(formatDuration(result.duration))}\n` +
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

    } catch (e) {
      await sock.sendMessage(
        chatId,
        {
          text: `${FLOR} ${sansBold("Ocurrió un error inesperado")}\n${e.message}`,
        },
        { quoted: msg }
      );
    }
  }
};

function formatDuration(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}