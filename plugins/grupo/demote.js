import { esAdminDeGrupo, formatoUsuario, obtenerMencionado } from "../../groupHelpers.js";

export default {
  command: ["demote", "quitaradmin"],
  category: "Grupo",
  description: "Quita el admin a la persona mencionada o citada",
  run: async (sock, msg, args, context) => {
    const { chatId, sender, esGrupo } = context;
    if (!esGrupo) return;

    const esAdmin = await esAdminDeGrupo(sock, chatId, sender);
    if (!esAdmin) {
      return sock.sendMessage(chatId, { text: "Solo las/los admins pueden usar este comando." }, { quoted: msg });
    }

    const objetivo = obtenerMencionado(msg);
    if (!objetivo) {
      return sock.sendMessage(chatId, { text: "Mencioná o citá a quién querés quitarle el admin." }, { quoted: msg });
    }

    await sock.groupParticipantsUpdate(chatId, [objetivo], "demote");
    const formato = await formatoUsuario(sock, chatId, objetivo);
    await sock.sendMessage(chatId, {
      text: `${formato.texto} ya no es admin.`,
      mentions: formato.mentions,
    });
  },
};
