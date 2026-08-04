import { esAdminDeGrupo, formatoUsuario, obtenerMencionado } from "../../groupHelpers.js";

export default {
  command: ["kick", "expulsar"],
  category: "Grupo",
  description: "Expulsa a la persona mencionada o citada",
  run: async (sock, msg, args, context) => {
    const { chatId, sender, esGrupo } = context;
    if (!esGrupo) return;

    const esAdmin = await esAdminDeGrupo(sock, chatId, sender);
    if (!esAdmin) {
      return sock.sendMessage(chatId, { text: "Solo las/los admins pueden usar este comando." }, { quoted: msg });
    }

    const objetivo = obtenerMencionado(msg);
    if (!objetivo) {
      return sock.sendMessage(chatId, { text: "Mencioná o citá a quién querés expulsar." }, { quoted: msg });
    }

    await sock.groupParticipantsUpdate(chatId, [objetivo], "remove");
    const formato = await formatoUsuario(sock, chatId, objetivo);
    await sock.sendMessage(chatId, {
      text: `${formato.texto} fue expulsada/o del grupo.`,
      mentions: formato.mentions,
    });
  },
};
              
