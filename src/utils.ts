// generic functions

import * as hpccWasm from '@hpcc-js/wasm';
import * as i from './interfaces';

const parseTransform = (s?: string): i.IParseTransformOutput => {
  if (!s) {
    return { scale: { x: 1, y: 1 }, translate: { x: 0, y: 0 } };
  }
  const matches = s.match(
    /(translate|matrix|rotate|skewX|skewY|scale)\(.*?\)/g
  );
  const obj: i.IParseTransformOutput = {};
  if (matches) {
    for (const m of matches) {
      const idx = m.indexOf('(');
      const v = m.substring(idx + 1, m.length - 1).split(/,|\s/);
      const n = m.substring(0, idx) as keyof i.IParseTransformOutput;
      const o: any = {};
      switch (n) {
        case 'translate':
        case 'scale':
          o.x = +v[0] || 0;
          o.y = +v[1] || 0;
          obj[n] = o;
          break;
        case 'rotate':
          o.a = +v[0] || 0;
          o.x = +v[1] || 0;
          o.y = +v[2] || 0;
          obj[n] = o;
          break;
        case 'skewX':
        case 'skewY':
          o.a = +v[0];
          obj[n] = o;
          break;
        case 'matrix':
          o.a = +v[0] || 0;
          o.b = +v[1] || 0;
          o.c = +v[2] || 0;
          o.d = +v[3] || 0;
          o.e = +v[4] || 0;
          o.f = +v[5] || 0;
          obj[n] = o;
          break;
      }
    }
  }
  return obj;
};

const dot2svg = async (s: string): Promise<string> => {
  return await hpccWasm.graphviz.layout(s, 'svg', 'dot');
};

const uuid = (): string => {
  return String(Math.floor(Math.random() * 1e9));
};

const delayAfterNextRepaint = (func: () => void): void => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      func();
    });
  });
};

const downloadSVG = ({ node, dimensions }: i.IParamsDownloadSvg): void => {
  // ref https://observablehq.com/@mbostock/saving-svg
  const xmlns = 'http://www.w3.org/2000/xmlns/';
  const xlinkns = 'http://www.w3.org/1999/xlink';
  const svgns = 'http://www.w3.org/2000/svg';

  const nodeWrapper = node.cloneNode(true) as HTMLElement;
  const nodeSvg = nodeWrapper.childNodes[0] as SVGElement;

  nodeWrapper.setAttributeNS(xmlns, 'xmlns', svgns);

  nodeSvg.setAttributeNS(xmlns, 'xmlns', svgns);
  nodeSvg.setAttributeNS(xmlns, 'xmlns:xlink', xlinkns);

  nodeSvg.setAttribute('width', dimensions.width.toString());
  nodeSvg.setAttribute('height', dimensions.height.toString());

  nodeSvg.setAttribute('style', 'border: 1px gray solid; margin: 10px');

  const serializer = new XMLSerializer();
  const string = serializer.serializeToString(nodeWrapper);
  const blob = new Blob([string], { type: 'image/svg+xml' });

  const elt = document.createElement('a');
  elt.download = 'snapshot.svg';
  elt.href = URL.createObjectURL(blob);
  elt.click();
  elt.remove();
};

export { uuid, dot2svg, parseTransform, delayAfterNextRepaint, downloadSVG };
