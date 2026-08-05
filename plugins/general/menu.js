import { agruparPorCategoria } from "../../pluginLoader.js";
import { config } from "../../config.js";
import { mono, sansBold, sansBoldItalic, FLOR } from "../../decoracion.js";

const IMAGEN_MENU = "https://i.ibb.co/27rFXcxW/IMG-20260803-WA0129.jpg";

function construirIntro() {
  return (
    `\`¿Un menú de qué...?\`\n` +
    `╰┈➤ ¡El menú de ${mono(config.botName)}!\n\n` +
    `> ${FLOR} ¡${sansBold("Comandos generales")} para conocerme!\n\n` +
    `¿Solo eso?\n\n` +
    `> ${FLOR}¡${sansBoldItalic("Comandos de grupo")} para tus admins!\n\n` +
    `\`¡Y mucho más aquí abajo! Escribí el comando que quieras usar.\``
  );
}

function construirCategorias(plugins) {
  const grupos = agruparPorCategoria(plugins);
  const categoriasOrdenadas = [...grupos.keys()].sort();

  let texto = "";

  for (const categoria of categoriasOrdenadas) {
    const comandosDeCategoria = grupos.get(categoria);
    texto += `\n${FLOR} ${sansBold(categoria.toUpperCase())}\n\n`;

    for (const plugin of comandosDeCategoria) {
      const comandos = plugin.command.join(" / ");
      texto += `> ${mono(comandos)}`;
      if (plugin.description) texto += `\n> _${plugin.description}_`;
      texto += "\n\n";
    }
  }

  return texto;
}

function construirMenu(plugins) {
  const totalComandos = plugins.reduce((acc, p) => acc + p.command.length, 0);
  const categorias = agruparPorCategoria(plugins).size;

  return (
    `${construirIntro()}\n\n` +
    `${"─".repeat(28)}\n` +
    `${sansBold("Comandos")}: ${totalComandos}   ${sansBold("Categorías")}: ${categorias}\n` +
    `${construirCategorias(plugins)}\n` +
    `Pd: _Creada con cariño por ${config.creator}_`
  );
}

export default {
  command: ["menu", "help"],
  category: "General",
  description: "Muestra el menú de comandos disponibles",
  run: async (sock, msg, args, context) => {
    const texto = construirMenu(context.allPlugins || []);

    await sock.sendMessage(
      context.chatId,
      { image: { url: IMAGEN_MENU }, caption: texto },
      { quoted: msg }
    );
  },
};
