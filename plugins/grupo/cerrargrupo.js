import { esAdminDeGrupo } from "../../groupHelpers.js";

export default {
  command: ["cerrargrupo", "close"],
  category: "Grupo",
  description: "Solo las/los admins pueden escribir en el grupo",
  run: async (sock, msg, args, context) => {
    const { chatId, sender, esGrupo } = context;
    if (!esGrupo) return;

    const esAdmin = await esAdminDeGrupo(sock, chatId, sender);
    if (!esAdmin) {
      return sock.sendMessage(chatId, { text: "Solo las/los admins pueden usar este comando." }, { quoted: msg });
    }

    await sock.groupSettingUpdate(chatId, "announcement");
    await sock.sendMessage(chatId, { text: "Grupo cerrado, solo las/los admins pueden escribir." });
  },
};
