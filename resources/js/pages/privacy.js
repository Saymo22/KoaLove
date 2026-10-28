document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('exportData').addEventListener('click', () => { location.href='/api/privacy/export'; });
  document.getElementById('deleteAccountForm').addEventListener('submit', async event => {
    event.preventDefault();
    if (!confirm('Desativar a conta e todos os links de presentes? Os dados serão eliminados em até 30 dias.')) return;
    const message=document.getElementById('privacyMessage');
    try {
      const result=await ApiClient.post('/privacy/delete',{password:document.getElementById('deletePassword').value});
      ApiClient.setCachedUser(null);message.textContent=result.message;
      for(const storage of [localStorage,sessionStorage])for(const key of Object.keys(storage))if(/^(nossoamor|na_|presente|rate_lock:)/.test(key))storage.removeItem(key);
      await new Promise(resolve=>{
        const request=indexedDB.open('presente-db',1);
        request.onupgradeneeded=()=>{request.result.createObjectStore('pedidos',{keyPath:'id'});};
        request.onerror=()=>resolve();
        request.onsuccess=()=>{const db=request.result;const tx=db.transaction('pedidos','readwrite');tx.objectStore('pedidos').clear();tx.oncomplete=tx.onerror=()=>{db.close();resolve();};};
      });
      document.getElementById('deleteAccountForm').reset();
      location.href='/entrar';
    } catch(error) { message.textContent=error.message; }
  });
});
