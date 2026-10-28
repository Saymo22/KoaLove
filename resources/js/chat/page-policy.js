// O destinatário do presente não precisa do atendimento da plataforma.
export function chatAllowed(pathname,embedded=false){
 return !embedded && pathname!=='/presente' && !pathname.startsWith('/temas/') && !pathname.startsWith('/admin/');
}
