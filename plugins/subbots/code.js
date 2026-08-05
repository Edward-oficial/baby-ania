import { registrarSubBot } from "../../subbots.js";
import { sansBold, mono, bullet, SEPARADOR_TITULO, DIVISOR_SUAVE, CIERRE } from "../../decoracion.js";

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
        {
          text:
            `${SEPARADOR_TITULO} ${sansBold("VINCULAR SUB-BOT")} ${SEPARADOR_TITULO}\n\n` +
            `${bullet("⚠️")} Usá: ${mono("code 50499999999")}\n` +
            `${bullet("📱")} Tu número con código de país, sin +\n\n` +
            `${DIVISOR_SUAVE}`,
        },
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
            {
              text:
                `${SEPARADOR_TITULO} ${sansBold("CÓDIGO DE VINCULACIÓN")} ${SEPARADOR_TITULO}\n\n` +
                `${bullet("🔗")} ${mono(codigo)}\n\n` +
                `${DIVISOR_SUAVE}\n${CIERRE}`,
            },
            { quoted: msg }
          );
        },
        onReady: async () => {
          await sock.sendMessage(chatId, {
            text:
              `${SEPARADOR_TITULO} ${sansBold("SUB-BOT CONECTADO")} ${SEPARADOR_TITULO}\n\n` +
              `${bullet("✅")} ${mono(numero)} conectado correctamente.\n\n` +
              `${CIERRE}`,
          });
        },
      });
    } catch (err) {
      await sock.sendMessage(
        chatId,
        {
          text:
            `${SEPARADOR_TITULO} ${sansBold("ERROR")} ${SEPARADOR_TITULO}\n\n` +
            `${bullet("❌")} No se pudo registrar el sub-bot:\n${mono(err.message)}\n\n` +
            `${DIVISOR_SUAVE}`,
        },
        { quoted: msg }
      );
    }
  },
};
