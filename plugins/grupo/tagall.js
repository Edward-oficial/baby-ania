import { mencionarATodos } from "../../mentions.js";

export default {
  command: ["tagall", "todos"],
  category: "Grupo",
  description: "Menciona a todas las personas del grupo",
  run: async (sock, msg, args, context) => {
    const { chatId, esGrupo } = context;
    if (!esGrupo) return;

    const texto = args.length ? args.join(" ") : "Atención a todas/os.";
    await mencionarATodos(sock, chatId, texto);
  },
};
