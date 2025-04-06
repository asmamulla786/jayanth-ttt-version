globalThis.onload = () => {
  setInterval(async () => {
    await fetch('/status')
      .then(r => r.json())
      .then(d => {
        if (d.status === 'playing') {
          globalThis.location.href = '/';
        }
      });
  }, 1000);
}