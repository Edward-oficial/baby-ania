const AUDIO_COMMANDS = [
  'noche de paz', 'buenos dias', 'audio hentai', 'fiesta del admin', 'fiesta del admin 2',
  'viernes', 'me olvide', 'baneado', 'feliz navidad', 'a nadie le importa',
  'sexo', 'vete a la vrg', 'ara ara', 'hola', 'un pato',
  'nyanpasu', 'te amo', 'yamete', 'te diagnostico con gay', 'quien es tu sempai botsito 7w7',
  'banate', 'vivan los novios', 'marica quien', 'es puto', 'la biblia',
  'onichan', 'bot puto', 'feliz cumpleanos', 'pasa pack bot', 'atencion grupo',
  'homero chino', 'oh me vengo', 'murio el grupo', 'siuuu', 'rawr',
  'uwu', ':c', 'a', 'hey', 'enojado',
  'enojada', 'chao', 'hentai', 'triste', 'estoy triste',
  'me pican los cocos', 'contexto', 'me voy', 'tengo los calzones del admin', 'entrada epica',
  'esto va ser epico papus', 'ingresa epicamente', 'bv', 'yoshi', 'no digas eso papu',
  'ma ma masivo', 'masivo', 'basado', 'basada', 'fino senores',
  'verdad que te engane', 'sus', 'ohayo', 'la voz de hombre', 'pero esto',
  'bien pensado woody', 'jesucristo', 'wtf', 'una pregunta', 'que sucede',
  'hablame', 'pikachu', 'niconico', 'yokese', 'omaiga',
  'nadie te pregunto', 'bueno si', 'usted esta detenido', 'no me hables', 'no chu',
  'nochupala', 'el pepe', 'pokemon', 'no me hagas usar esto', 'esto va para ti',
  'abduzcan', 'joder', 'hablar primos', 'mmm', 'orale',
  'me anda buscando anonymous', 'blackpink in your area', 'cambiate a movistar', 'momento equisde', 'todo bien',
  'te gusta el pepino', 'el toxico', 'moshi moshi', 'calla fan de bts', 'que tal grupo',
  'muchachos', 'esta zzzz', 'goku pervertido', 'potaxio', 'nico nico',
  'el rap de fernanfloo', 'tal vez', 'corte corte', 'buenas noches', 'porque ta tite',
  'eres fuerte', 'bueno master', 'no rompas mas', 'traiganle una falda', 'se estan riendo de mi',
  'su nivel de pendejo', 'bienvenido', 'bienvenida', 'elmo sabe donde vives', 'tunometecabrasaramambiche',
  'y este quien es', 'motivacion', 'en caso de una investigacion', 'buen dia grupo', 'las reglas del grupo',
  'hatsune miku', 'miku',
]

function chunkText(text, maxLen = 3500) {
  const lines = text.split('\n')
  const chunks = []
  let current = ''
  for (const line of lines) {
    const next = current ? `${current}\n${line}` : line
    if (next.length > maxLen) {
      if (current) chunks.push(current)
      current = line
    } else {
      current = next
    }
  }
  if (current) chunks.push(current)
  return chunks
}

export default {
  command: ['menuaudios', 'menu2', 'menú2', 'memu2', 'menuaudio', 'memuaudios', 'memuaudio', 'audio', 'audios'],
  category: 'menu',
  run: async (client, m) => {
    const username = m.pushName || 'Bebé'
    const header = [
      `💖 MENU DE AUDIOS 💖`,
      ``,
      `🌱 Hola ${username}`,
      `🙄 Escribe la palabra SIN prefijo para enviar el audio.`,
      ``,
      `🌱 Lista:`,
    ].join('\n')

    const body = AUDIO_COMMANDS.map((cmd, i) => `🌱 ${i + 1}. ${cmd}`).join('\n')
    const fullText = `${header}\n${body}`
    const parts = chunkText(fullText, 3500)

    for (let i = 0; i < parts.length; i++) {
      const suffix = parts.length > 1 ? `\n\n🙄 Parte ${i + 1}/${parts.length}` : ''
      await client.sendMessage(
        m.chat,
        {
          text: parts[i] + suffix,
          contextInfo: { mentionedJid: [m.sender] },
        },
        { quoted: i === 0 ? m : undefined },
      )
    }
  },
}