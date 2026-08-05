import axios from "axios";
import { mono, sansBold, script, FLOR, DIVISOR_FINO, DIVISOR_ESTRELLAS } from "../../decoracion.js";

export default {
  command: ["play", "ytplay"],
  category: "Descargas",
  description: "Busca una canción en YouTube y envía el audio",
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

    try {
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

      const video = searchRes.data.data[0];
      
      const dlRes = await axios.get(
        `https://dv-edward.onrender.com/api/download/ytaudio?url=${encodeURIComponent(video.url)}&apiKey=edward`
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
      
      await sock.sendMessage(
        chatId,
        {
          image: { url: result.thumbnail },
          caption:
            `${DIVISOR_ESTRELLAS}\n` +
            `${FLOR} ${sansBold(result.title)}\n` +
            `${DIVISOR_FINO}\n` +
            `${FLOR} ${script(formatDuration(result.duration))}\n` +
            `${FLOR} ${script(video.author)}\n` +
            `${FLOR} ${script(video.views)}\n` +
            `${FLOR} ${script(video.publishedAt)}\n` +
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