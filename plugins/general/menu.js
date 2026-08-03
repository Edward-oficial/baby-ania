import { agruparPorCategoria } from "../../pluginLoader.js";
import { config } from "../../config.js";

const ANCHO = 40;

function linea(char = "─") {
  return char.repeat(ANCHO);
}

function construirMenu(plugins) {
  const grupos = agruparPorCategoria(plugins);
  const categoriasOrdenadas = [...grupos.keys()].sort();

  let texto = `${config.botName}\n`;
  texto += `${linea("═")}\n`;
  texto += `Comandos totales: ${plugins.length}\n`;
  texto += `Categorías: ${categoriasOrdenadas.length}\n`;
  texto += `${linea("═")}\n\n`;

  for (const categoria of categoriasOrdenadas) {
    const comandosDeCategoria = grupos.get(categoria);
    texto += `${categoria.toUpperCase()}\n`;
    texto += `${linea()}\n`;

    for (const plugin of comandosDeCategoria) {
      const comandos = plugin.command.join(" / ");
      texto += `- ${comandos}`;
      if (plugin.description) texto += `  →  ${plugin.description}`;
      texto += "\n";
    }

    texto += "\n";
  }

  return texto.trim();
}

export default {
  command: ["menu", "help"],
  category: "General",
  description: "Muestra el menú de comandos disponibles",
  run: async (sock, msg, args, context) => {
    const texto = construirMenu(context.allPlugins || []);
    await sock.sendMessage(context.chatId, { text: texto }, { quoted: msg });
  },
};
