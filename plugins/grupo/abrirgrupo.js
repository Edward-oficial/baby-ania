import { esAdminDeGrupo } from "../../groupHelpers.js";

export default {
  command: ["abrirgrupo", "open"],
  category: "Grupo",
  description: "Permite que todas las personas escriban en el grupo",
  run: async (sock, msg, args, context) => {
    const { chatId, sender, esGrupo } = context;
    if (!esGrupo) return;

    const esAdmin = await esAdminDeGrupo(sock, chatId, sender);
    if (!esAdmin) {
      return sock.sendMessage(chatId, { text: "Solo las/los admins pueden usar este comando." }, { quoted: msg });
    }

    await sock.groupSettingUpdate(chatId, "not_announcement");
    await sock.sendMessage(chatId, { text: "Grupo abierto, todas/os pueden escribir." });
  },
};
