// specific functions

import * as d3 from 'd3-selection';
import * as i from './interfaces';
import * as utils from './utils';

const buildVizParams = async ({
  dotScript,
  wrapper,
}: i.IParamsBuildVizParams): Promise<i.IOutputBuildVizParams> => {
  //   console.log('--- start buildVizParams');

  const svgStr = await utils.dot2svg(dotScript);

  const document = new DOMParser().parseFromString(svgStr, 'image/svg+xml');
  const elt = document.documentElement;
  const svg = d3.select(elt).remove();

  const gw = parseInt(elt.getAttribute('width'));
  const gh = parseInt(elt.getAttribute('height'));

  //   console.log({ gw, gh });

  const node = wrapper.node();
  const bbw = node.getBoundingClientRect().width;
  const bbh = node.getBoundingClientRect().height;

  //   console.log({ bbw, bbh });

  const ratiow = bbw / gw;
  const ratioh = bbh / gh;

  //   console.log({ ratiow, ratioh });

  let ww: number;
  let wh: number;
  let scalem: number;

  if (ratiow < ratioh) {
    ww = bbw;
    wh = ww * (gh / gw);
    scalem = ww / gw;
  } else {
    wh = bbh;
    ww = wh * (gw / gh);
    scalem = wh / gh;
  }

  //   console.log({ ww, wh });

  const g = svg.select('#graph0'); // id produced by hpccWasm.graphviz
  const transformSrc = g.attr('transform');
  const pt = utils.parseTransform(transformSrc);

  //   console.log(pt);

  const s = pt.scale.x * scalem;
  const t = {
    x: pt.translate.x,
    y: pt.translate.y,
  };

  //   console.log({ s, t });

  g.attr('transform', `scale(${s}) translate(${t.x},${t.y})`);

  const id = `graph-${utils.uuid()}`;
  g.attr('id', id);

  return {
    dimensions: {
      graph: { width: gw, height: gh },
      wrapper: { width: ww, height: wh },
    },
    transform: { src: transformSrc, zoom: { scale: s, translate: t } },
    id,
    html: svg.html(),
  };
};

const buildHover = (
  wrap: d3.Selection<SVGSVGElement, unknown, null, undefined>
): (() => void) => {
  const hover = () => {
    const nodes = wrap.selectAll('.node');
    const edges = wrap.selectAll('.edge');
    const shapes = 'ellipse,polygon,rect';
    const lines = 'path';
    const color: i.IColor = {};
    const clicked: i.IClicked = {};

    const highlightN = 'yellow';
    const highlightE = 'red';

    const select = (that: d3.BaseType) => {
      const s = d3.select(that);
      const id = s.attr('id');
      return { s, id };
    };

    nodes
      .on('mouseover', function () {
        const { s, id } = select(this);
        if (!clicked[id]) {
          color[id] = s.selectAll(shapes).attr('fill');
        }
        s.selectAll(shapes).attr('fill', highlightN);
      })
      .on('mouseout', function () {
        const { s, id } = select(this);
        if (!clicked[id]) {
          s.selectAll(shapes).attr('fill', color[id]);
        }
      });

    edges
      .on('mouseover', function () {
        const { s, id } = select(this);
        if (!clicked[id]) {
          color[id] = s.selectAll(lines).attr('stroke');
        }
        s.selectAll(lines).attr('stroke', highlightE).attr('stroke-width', 2);
      })
      .on('mouseout', function () {
        const { s, id } = select(this);
        if (!clicked[id]) {
          s.selectAll(lines).attr('stroke-width', 1).attr('stroke', color[id]);
        }
      });

    nodes.on('click', function () {
      const { s, id } = select(this);
      if (clicked[id]) {
        s.selectAll(shapes).attr('fill', color[id]);
        clicked[id] = false;
      } else {
        s.selectAll(shapes).attr('fill', highlightN);
        clicked[id] = true;
      }
    });

    edges.on('click', function () {
      const { s, id } = select(this);
      if (clicked[id]) {
        s.selectAll(lines).attr('stroke-width', 1).attr('stroke', color[id]);
        clicked[id] = false;
      } else {
        s.selectAll(lines).attr('stroke-width', 2).attr('stroke', highlightE);
        clicked[id] = true;
      }
    });
  };

  return hover;
};

export { buildVizParams, buildHover };
