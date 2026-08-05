import axios from "axios";
import { sansBold, script, FLOR, DIVISOR_ESTRELLAS, DIVISOR_FINO } from "../decoracion.js";

export default {
  command: ["ytaudio", "ytmp3", "yta"],
  category: "Descargas",
  description: "Descarga el audio de un video de YouTube por enlace",
  run: async (sock, msg, args, context) => {
    const { chatId } = context;
    
    if (!args.length) {
      return sock.sendMessage(chatId, { 
        text: sansBold(FLOR) + " " + script("Pega el enlace de YouTube") 
      }, { quoted: msg });
    }

    const url = args[0];
    
    try {
      const res = await axios.get(
        `https://dv-edward.onrender.com/api/download/ytaudio?url=${encodeURIComponent(url)}&apiKey=edward`
      );
      
      if (!res.data.status) {
        return sock.sendMessage(chatId, { 
          text: sansBold(FLOR) + " No se pudo descargar el audio" 
        }, { quoted: msg });
      }

      const result = res.data.result;
      
      const infoTexto = `
${DIVISOR_ESTRELLAS}
${sansBold(FLOR)} ${sansBold(result.title)}
${DIVISOR_FINO}
${script(FLOR)} ${script(formatDuration(result.duration))}
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