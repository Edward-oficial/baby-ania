import { mencionOculta } from "../../mentions.js";

export default {
  command: ["hidetag"],
  category: "Grupo",
  description: "Notifica a todas/os sin mostrar los números en el texto",
  run: async (sock, msg, args, context) => {
    const { chatId, esGrupo } = context;
    if (!esGrupo) return;

    const texto = args.length ? args.join(" ") : "";
    await mencionOculta(sock, chatId, texto);
  },
};
