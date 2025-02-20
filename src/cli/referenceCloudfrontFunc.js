const ROUTE_TREE = null;

function findMatch(segments) {
  const node = segments.reduce((current, segment) => {
    if (!current) return null;

    // Try exact match first
    if (segment in current) {
      return current[segment];
    }

    // Try dynamic route
    if ('$_p' in current) {
      return current['$_p'];
    }

    return null;
  }, ROUTE_TREE);

  return (node && node['$_d']) || null;
}

function handler(event) {
  const request = event.request;
  let uri = request.uri;

  const segments = uri.split('/').filter(Boolean);
  const destination = findMatch(segments);

  if (destination) {
    request.uri = destination;
  } else if (!uri.includes('.') && uri.length > 1) {
    // Handle trailing slash and html extension
    if (uri.endsWith('/')) {
      request.uri = uri.replace(/\/?$/, '.html');
    } else {
      request.uri = uri + '.html';
    }
  }

  return request;
}
