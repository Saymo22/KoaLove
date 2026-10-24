import {createWriteStream} from 'node:fs';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {setTimeout as delay} from 'node:timers/promises';

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
      if(error.retryable===false||attempt===attempts)throw error;
      console.warn('Conexão de download interrompida; nova tentativa '+(attempt+1)+'/'+attempts+'.');
      await delay(delayMs*attempt);
    }
  }
}
