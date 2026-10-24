import {createWriteStream} from 'node:fs';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {setTimeout as delay} from 'node:timers/promises';
import {spawn} from 'node:child_process';

// Retry only transport/transient HTTP failures. The caller must still verify
// the pinned checksum before extracting or executing anything downloaded.
export async function downloadRelease(url, destination, {attempts=3,delayMs=2000,timeoutMs=180000}={}) {
  for(let attempt=1;attempt<=attempts;attempt++) {
    try {
      const response=await fetch(url,{signal:AbortSignal.timeout(timeoutMs)});
      if(!response.ok) {
        await response.body?.cancel();
        const error=new Error('Download HTTP '+response.status);
        error.retryable=[408,429,500,502,503,504].includes(response.status);
        throw error;
      }
      await pipeline(Readable.fromWeb(response.body),createWriteStream(destination));
      return;
    } catch(error) {
      if(error.retryable===false)throw error;
      if(attempt===attempts) {
        // Some build networks reset Node's TLS connection. Use the system's
        // IPv4 HTTPS client for the same URL, still requiring normal TLS and
        // the caller's pinned SHA-256 before extraction.
        if(['ECONNRESET','ECONNREFUSED','ETIMEDOUT','UND_ERR_CONNECT_TIMEOUT','UND_ERR_SOCKET'].includes(error.cause?.code)) {
          console.warn('Download pelo cliente alternativo HTTPS do sistema.');
          const fallback=await new Promise(resolve=>{
            const child=spawn('curl',['--ipv4','--fail','--location','--connect-timeout','30','--max-time','180','--retry','2','--retry-delay','2','--output',destination,url],{stdio:'ignore',timeout:600000,windowsHide:true});
            child.once('error',()=>resolve(null));
            child.once('close',code=>resolve(code));
          });
          if(fallback===0)return;
        }
        throw error;
      }
      console.warn('Conexão de download interrompida; nova tentativa '+(attempt+1)+'/'+attempts+'.');
      await delay(delayMs*attempt);
    }
  }
}
