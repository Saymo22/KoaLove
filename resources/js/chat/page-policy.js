// O destinatário do presente não precisa do atendimento da plataforma.
export function chatAllowed(pathname,embedded=false){
 return !embedded && pathname!=='/ver.html' && pathname!=='/teste' && !pathname.startsWith('/teste/') && !pathname.startsWith('/admin/');
}
