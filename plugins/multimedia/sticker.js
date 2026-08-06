import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";

import { downloadMediaMessage } from "../../media.js";

function obtenerMediaObjetivo(msg) {
  const directo = msg.message;
  const citado = directo?.extendedTextMessage?.contextInfo?.quotedMessage;
  const contextInfo = directo?.extendedTextMessage?.contextInfo;

  if (directo?.imageMessage) return { message: directo, tipo: "image" };
  if (directo?.videoMessage) return { message: directo, tipo: "video" };

  if (citado?.imageMessage) {
    return {
      message: {
        key: {
          remoteJid: msg.key.remoteJid,
          id: contextInfo.stanzaId,
          participant: contextInfo.participant,
        },
        message: citado,
      },
      tipo: "image",
    };
  }

  if (citado?.videoMessage) {
    return {
      message: {
        key: {
          remoteJid: msg.key.remoteJid,
          id: contextInfo.stanzaId,
          participant: contextInfo.participant,
        },
        message: citado,
      },
      tipo: "video",
    };
  }

  return null;
}

function correrFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const proceso = spawn("ffmpeg", args);
    let errorSalida = "";

    proceso.stderr.on("data", (chunk) => {
      errorSalida += chunk.toString();
    });

    proceso.on("error", (err) => {
      if (err.code === "ENOENT") {
        reject(new Error("ffmpeg no está instalado en este servidor."));
      } else {
        reject(err);
      }
    });

    proceso.on("close", (codigo) => {
      if (codigo === 0) resolve();
      else reject(new Error(`ffmpeg terminó con código ${codigo}: ${errorSalida.slice(-300)}`));
    });
  });
}

async function convertirASticker(bufferEntrada, tipo) {
  const id = crypto.randomUUID();
  const extEntrada = tipo === "video" ? "mp4" : "jpg";
  const rutaEntrada = path.join(os.tmpdir(), `sticker-in-${id}.${extEntrada}`);
  const rutaSalida = path.join(os.tmpdir(), `sticker-out-${id}.webp`);

  await fs.promises.writeFile(rutaEntrada, bufferEntrada);

  const filtro =
    "scale=512:512:force_original_aspect_ratio=decrease," +
    (tipo === "video" ? "fps=15," : "") +
    "format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000";

  const args = [
    "-y",
    "-i",
    rutaEntrada,
    ...(tipo === "video" ? ["-t", "6"] : []),
    "-vcodec",
    "libwebp",
    "-vf",
    filtro,
    "-loop",
    "0",
    "-preset",
    "default",
    "-an",
    "-vsync",
    "0",
    "-s",
    "512:512",
    rutaSalida,
  ];

  try {
    await correrFfmpeg(args);
    return await fs.promises.readFile(rutaSalida);
  } finally {
    fs.promises.unlink(rutaEntrada).catch(() => {});
    fs.promises.unlink(rutaSalida).catch(() => {});
  }
}

export default {
  command: ["sticker", "s", "fig"],
  category: "Multimedia",
  description: "Convierte una foto o video (citado o enviado) en figurita",
  run: async (sock, msg, args, context) => {
    const { chatId } = context;

    const objetivo = obtenerMediaObjetivo(msg);
    if (!objetivo) {
      return sock.sendMessage(
        chatId,
        { text: "Enviá o citá una foto/video con el comando sticker." },
        { quoted: msg }
      );
    }

    try {
      const buffer = await downloadMediaMessage(
        objetivo.message,
        "buffer",
        {},
        { logger: undefined, reuploadRequest: sock.updateMediaMessage }
      );

      const stickerBuffer = await convertirASticker(buffer, objetivo.tipo);

      await sock.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(
        chatId,
        { text: `No se pudo crear la figurita: ${err.message}` },
        { quoted: msg }
      );
    }
  },
};
