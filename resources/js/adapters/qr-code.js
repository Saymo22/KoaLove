window.GiftQrCode = {
  async render(container, url) {
    const canvas = document.createElement('canvas');
    await NAQRCode.toCanvas(canvas, url, {width:160, margin:4, errorCorrectionLevel:'H', color:{dark:'#5a3f1a',light:'#ffffff'}});
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'QR Code para abrir o presente');
    container.replaceChildren(canvas);
  }
};
