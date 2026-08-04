import { registrarSubBot } from "../../subbots.js";

export default {
  command: ["code", "serbot"],
  category: "SubBots",
  description: "Vincula un sub-bot nuevo: code 50499999999",
  run: async (sock, msg, args, context) => {
    const { chatId } = context;
    const numero = args[0]?.replace(/\D/g, "");

    if (!numero) {
      return sock.sendMessage(
        chatId,
        { text: "Usá: code 50499999999 (tu número con código de país, sin +)" },
        { quoted: msg }
      );
    }

    try {
      await registrarSubBot(numero, numero, {
        onMessage: context.onMessage,
        onGroupParticipantsUpdate: context.onGroupParticipantsUpdate,
        onPairingCode: async (codigo) => {
          await sock.sendMessage(
            chatId,
            { text: `Código de vinculación para el sub-bot:\n\n${codigo}` },
            { quoted: msg }
          );
        },
        onReady: async () => {
          await sock.sendMessage(chatId, { text: `Sub-bot ${numero} conectado correctamente.` });
        },
      });
    } catch (err) {
      await sock.sendMessage(
        chatId,
        { text: `No se pudo registrar el sub-bot: ${err.message}` },
        { quoted: msg }
      );
    }
  },
};
