const config = require('../config');
function ready() {
  try {
    const url = new URL(config.PUBLIC_ORIGIN);
    return !!config.SMTP.host && !!config.SMTP.from && !url.username && !url.password &&
      (url.protocol === 'https:' || url.protocol === 'http:' && ['127.0.0.1','localhost','[::1]'].includes(url.hostname));
  } catch {return false;}
}
async function sendPasswordReset(email, token) {
  if(!ready()) throw new Error('SMTP_NOT_CONFIGURED');
  const nodemailer = require('nodemailer');
  const smtp = config.SMTP;
  const transport = nodemailer.createTransport({host:smtp.host,port:smtp.port,secure:smtp.secure,
    ...(!smtp.secure ? {requireTLS:true} : {}),
    ...(smtp.user ? {auth:{user:smtp.user,pass:smtp.pass}} : {}),
    connectionTimeout:10000,greetingTimeout:10000,socketTimeout:15000});
  const link = new URL('/recuperar-senha.html',config.PUBLIC_ORIGIN);
  link.hash = 'token=' + token;
  await transport.sendMail({from:smtp.from,to:email,subject:'Redefina sua senha — Nosso Amor',
    text:`Recebemos um pedido para redefinir sua senha.\n\nAbra este link em até 30 minutos:\n${link.href}\n\nSe não foi você, ignore esta mensagem. Sua senha continua a mesma.`});
}
module.exports = {ready,sendPasswordReset};
