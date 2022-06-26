// specific functions

import * as d3 from 'd3-selection';
import * as i from './interfaces';

const buildHover = (wrap: i.d3SelectSvg): (() => void) => {
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

export { buildHover };
