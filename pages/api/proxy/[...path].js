export const config = {
  api: {
    bodyParser: false,
  },
}

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  try {
    const { path = [] , ...restQuery } = req.query || {};
    const pathSegments = Array.isArray(path) ? path.join('/') : path;
    const queryString = new URLSearchParams(restQuery).toString();
    const targetBase = 'http://144.24.146.130/edu/api/v1';
    const targetUrl = `${targetBase}/${pathSegments}${queryString ? '?' + queryString : ''}`;

    const rawBody = await getRawBody(req);

    const headers = { ...req.headers };
    delete headers.host;

    const fetchOptions = {
      method: req.method,
      headers,
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : rawBody,
      redirect: 'manual',
    };

    const upstream = await fetch(targetUrl, fetchOptions);

    // copy response headers except hop-by-hop
    const hopByHop = new Set(['connection','keep-alive','proxy-authenticate','proxy-authorization','te','trailers','transfer-encoding','upgrade']);
    upstream.headers.forEach((value, name) => {
      if (!hopByHop.has(name.toLowerCase())) res.setHeader(name, value);
    });

    res.statusCode = upstream.status;
    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.end(buffer);
  } catch (err) {
    res.statusCode = 500;
    res.json({ error: 'proxy_error', message: String(err) });
  }
}
