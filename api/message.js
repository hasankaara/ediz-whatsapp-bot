// api/message.js

let spamTimes = [];
let aiMode = false;

import { handleAI, handleGoogle, handleAra, handleProjeler, handleProje, handleSpam } from './utils.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const { from, body, timestamp } = req.body; // WhatsApp'tan gelen mesaj bilgileri

  // Spam kontrolü (2 saniyeden kısa aralıklar)
  spamTimes = spamTimes.filter(t => timestamp - t < 2000);
  spamTimes.push(timestamp);

  if (spamTimes.length >= 5) { // spam sayısını kendin ayarla
    spamTimes = [];
    await handleSpam(from); // spam mesajlarını yolla (15 tane . ve temizlendi mesajı)
    return res.status(200).json({ result: '[chat-bot] Spam temizlendi' });
  }

  const msg = body.trim();

  // Komutları ayırt
  if (msg.startsWith('!')) {
    const [command, ...args] = msg.slice(1).split(' ');
    switch (command.toLowerCase()) {
      case 'ai':
        aiMode = !aiMode;
        return res.status(200).json({ result: `[chat-bot] AI modu ${aiMode ? 'aktif' : 'kapalı'}` });
      case 'google':
        const googleRes = await handleGoogle(args.join(' '));
        return res.status(200).json({ result: `[chat-bot] ${googleRes}` });
      case 'ara':
        const araRes = await handleAra(args.join(' '));
        return res.status(200).json({ result: `[chat-bot] ${araRes}` });
      case 'projeler':
        const projelerRes = await handleProjeler();
        return res.status(200).json({ result: `[chat-bot] ${projelerRes}` });
      case 'proje':
        const projeRes = await handleProje(args.join(' '));
        return res.status(200).json({ result: `[chat-bot] ${projeRes}` });
      default:
        return res.status(200).json({ result: '' }); // komut değilse cevap yok
    }
  } else if (aiMode) {
    const aiRes = await handleAI(msg);
    return res.status(200).json({ result: `[chat-bot] ${aiRes}` });
  } else {
    return res.status(200).json({ result: '' }); // AI kapalıysa cevap yok
  }
}
