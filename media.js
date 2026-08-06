import baileysPkg from "baileysx";
const baileysExports = baileysPkg?.default ?? baileysPkg;

export const downloadMediaMessage = baileysExports.downloadMediaMessage;

if (typeof downloadMediaMessage !== "function") {
  throw new Error(
    "El paquete @whiskeysockets/baileys instalado no expone downloadMediaMessage. " +
      "Borrá node_modules y package-lock.json y corré npm install de nuevo."
  );
}
