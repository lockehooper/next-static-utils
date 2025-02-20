class RouteNode {
  staticChildren: Map<string, RouteNode>;
  dynamicChild: { param: string; node: RouteNode } | null;
  destination: string | null;

  constructor() {
    this.staticChildren = new Map();
    this.dynamicChild = null;
    this.destination = null;
  }

  addRoute(segments: string[], destination: string) {
    if (segments.length === 0) {
      this.destination = destination;
      return;
    }

    const [segment, ...remaining] = segments;

    if (segment.startsWith(':')) {
      const paramName = segment.slice(1);
      if (!this.dynamicChild) {
        this.dynamicChild = {
          param: paramName,
          node: new RouteNode(),
        };
      }
      this.dynamicChild.node.addRoute(remaining, destination);
    } else {
      if (!this.staticChildren.has(segment)) {
        this.staticChildren.set(segment, new RouteNode());
      }
      this.staticChildren.get(segment)?.addRoute(remaining, destination);
    }
  }

  toJSON() {
    const result: Record<string, any> = {};

    if (this.destination) {
      result['$_d'] = this.destination;
    }

    // Add static routes
    for (const [segment, node] of this.staticChildren) {
      result[segment] = node.toJSON();
    }

    // Add dynamic route if it exists - just use $_p
    if (this.dynamicChild) {
      result['$_p'] = this.dynamicChild.node.toJSON();
    }

    return result;
  }

  toString() {
    return JSON.stringify(this, null, 2);
  }
}

export function getRouteTree(
  routes: { source: string; destination: string }[]
) {
  const root = new RouteNode();

  for (const route of routes) {
    const segments = route.source.split('/').filter(Boolean);
    root.addRoute(segments, route.destination);
  }

  return root;
}
