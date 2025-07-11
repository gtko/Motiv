// Proxy toutes les requêtes API vers les Workers déployés
export async function onRequest(context: any) {
  // Déterminer l'URL du Worker en fonction de l'environnement
  let WORKER_URL = context.env.WORKER_URL;
  
  if (!WORKER_URL) {
    // Détecter si c'est un preview (URL contient "preview-")
    const hostname = new URL(context.request.url).hostname;
    const previewMatch = hostname.match(/preview-(\d+)\./);
    
    if (previewMatch) {
      // C'est un preview, utiliser le Worker preview correspondant
      const prNumber = previewMatch[1];
      WORKER_URL = `https://motiv-app-preview-${prNumber}.gtux-prog.workers.dev`;
    } else {
      // Production par défaut
      WORKER_URL = 'https://motiv-app.gtux-prog.workers.dev';
    }
  }
  
  // Récupérer le chemin de l'API
  const url = new URL(context.request.url);
  const apiPath = url.pathname;
  
  // Construire la nouvelle URL vers le Worker
  const workerUrl = `${WORKER_URL}${apiPath}${url.search}`;
  
  // Proxy la requête vers le Worker
  const workerRequest = new Request(workerUrl, {
    method: context.request.method,
    headers: context.request.headers,
    body: context.request.body,
  });
  
  try {
    const response = await fetch(workerRequest);
    
    // Retourner la réponse du Worker
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    console.error('Erreur lors du proxy vers le Worker:', error);
    return new Response(JSON.stringify({ error: 'Service indisponible' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}