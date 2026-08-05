
import axios from "axios";
import { sansBold, script, FLOR, DIVISOR_FINO, DIVISOR_ESTRELLAS } from "../decoracion.js";

export default {
  command: ["play", "ytplay"],
  category: "Descargas",
  description: "Busca una canción en YouTube y envía el audio",
  run: async (sock, msg, args, context) => {
    const { chatId } = context;
    
    if (!args.length) {
      return sock.sendMessage(chatId, { 
        text: sansBold(FLOR) + " " + script("Escribe el nombre de la canción a buscar") 
      }, { quoted: msg });
    }

    const query = args.join(" ");
    
    try {
      const searchRes = await axios.get(
        `https://dv-edward.onrender.com/api/search/youtube?apiKey=edward&query=${encodeURIComponent(query)}`
      );
      
      if (!searchRes.data.status || !searchRes.data.data?.length) {
        return sock.sendMessage(chatId, { 
          text: sansBold(FLOR) + " No se encontraron resultados" 
        }, { quoted: msg });
      }

      const video = searchRes.data.data[0];
      
      const dlRes = await axios.get(
        `https://dv-edward.onrender.com/api/download/ytaudio?url=${encodeURIComponent(video.url)}&apiKey=edward`
      );
      
      if (!dlRes.data.status) {
        return sock.sendMessage(chatId, { 
          text: sansBold(FLOR) + " Error al obtener el audio" 
        }, { quoted: msg });
      }

      const result = dlRes.data.result;
      
      const infoTexto = `
${DIVISOR_ESTRELLAS}
${sansBold(FLOR)} ${sansBold(result.title)}
${DIVISOR_FINO}
${script(FLOR)} ${script(formatDuration(result.duration))}
${script(FLOR)} ${script(video.author)}
${script(FLOR)} ${script(video.views)}
${script(FLOR)} ${script(video.publishedAt)}
${DIVISOR_ESTRELLAS}`.trim();

      await sock.sendMessage(chatId, { 
        image: { url: result.thumbnail },
        caption: infoTexto 
      }, { quoted: msg });

      await sock.sendMessage(chatId, {
        audio: { url: result.download_url },
        mimetype: "audio/mp4",
        fileName: `${result.title}.mp3`
      }, { quoted: msg });

    } catch (e) {
      console.error(e);
      sock.sendMessage(chatId, { 
        text: sansBold(FLOR) + " Ocurrió un error inesperado" 
      }, { quoted: msg });
    }
  }
};

function formatDuration(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}
