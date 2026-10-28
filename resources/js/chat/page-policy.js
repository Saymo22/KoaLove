// O destinatário do presente não precisa do atendimento da plataforma.
export function chatAllowed(pathname,embedded=false){
 return !embedded && !['/presente','/ver.html','/temas','/teste'].includes(pathname) && !pathname.startsWith('/temas/') && !pathname.startsWith('/teste/') && !pathname.startsWith('/admin/');
}
