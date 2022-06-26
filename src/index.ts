import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
import { Widget } from '@lumino/widgets';

import * as d3 from 'd3-selection';
import * as d3Zoom from 'd3-zoom';

import * as i from './interfaces';
import * as u from './utils';
import * as f from './functions';
import * as utils from './utils';

const MIME_TYPE_DOT = 'application/vnd.graphviz-dot';
const MIME_TYPE_SVG = 'image/svg+xml';
const CLASS_NAME = 'mimerenderer-graphviz-dot-svg';

/**
 * widget for rendering .dot.
 */
export class GraphvizWidget extends Widget implements IRenderMime.IRenderer {
  private _mimeType: string;
  private _data: string;

  private _wrapperBtn: i.d3SelectDiv;
  private _btnFit: i.d3SelectBtn;
  private _btnFullScreen: i.d3SelectBtn;
  private _btnSaveSvg: i.d3SelectBtn;
  private _btnToggleHover: i.d3SelectBtn;

  private _wrapperViz: i.d3SelectDiv;
  private _containerViz: i.d3SelectSvg;

  private _running: boolean;
  private _interactive: boolean;

  /**
   * Construct a new output widget.
   */
  constructor(options: IRenderMime.IRendererOptions) {
    console.log('start GraphvizWidget constructor');

    super();
    this._mimeType = options.mimeType;
    this._interactive = true;

    console.log('---');
    console.log(options);

    this.id = `node-${u.uuid()}`;
    this.addClass(CLASS_NAME);

    const root = d3.select(this.node);

    this._wrapperBtn = root.append('div').attr('class', 'wrapper-btn');
    this._btnFit = this._wrapperBtn
      .append('button')
      .attr('id', 'btn-fit')
      .attr('class', 'btn-action');
    this._btnFullScreen = this._wrapperBtn
      .append('button')
      .attr('id', 'btn-fullscreen')
      .attr('class', 'btn-action');
    this._btnSaveSvg = this._wrapperBtn
      .append('button')
      .attr('id', 'btn-savesvg')
      .attr('class', 'btn-action');
    this._btnToggleHover = this._wrapperBtn
      .append('button')
      .attr('id', 'btn-savesvg')
      .attr('class', 'btn-action');

    this._wrapperViz = root.append('div').attr('class', 'wrapper-viz');

    const onFullscreenchange = this.buildOnFullscreenchange();
    this._wrapperViz
      .node()
      .addEventListener('fullscreenchange', onFullscreenchange);
  }

  /**
   * render .(dot|svg) into widget's node.
   */
  renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    console.log('start GraphvizWidget renderModel');

    console.log('>>>');
    console.log(model);

    this._data = model.data[this._mimeType] as string;
    return this.drawModel({ data: this._data, reset: false });
  }

  /**
   * main action entrypoint
   */
  async drawModel({ data, reset }: i.IParamsDrawDot): Promise<void> {
    console.log('--- start GraphvizWidget drawModel');

    const root = this._wrapperViz;

    const vizExists = !root.select('svg#viz').empty();

    if (vizExists && !reset) {
      console.log('>>> viz already exists and not reset - SKIP');
      return;
    }
    if (vizExists) {
      console.log('>>> remove existing element');
      root.select('svg#viz').remove();
    }

    // svg
    const _data = data ? data : this._data;
    const isFromDot = this._mimeType === MIME_TYPE_DOT;
    const svgStr = isFromDot ? await utils.dot2svg(_data) : _data;

    const y = root.node().getBoundingClientRect().height;
    const style = `width: 100%; height: ${y}px;`;
    this._containerViz = root
      .append('svg')
      .attr('id', 'viz')
      .attr('style', style);
    this._containerViz.html(null);
    const g = this._containerViz.append('g');

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgStr, 'image/svg+xml');
    const svgElt = doc.documentElement;

    svgElt.setAttribute('id', 'viewer');
    svgElt.setAttribute('width', '100%');
    svgElt.setAttribute('height', '');

    g.node()?.appendChild(svgElt);

    const zoomed = (e: any) => {
      console.log(e.transform);
      g.attr('transform', e.transform);
    };

    const zoom = d3Zoom.zoom().on('zoom', zoomed);
    this._containerViz.call(zoom as any);

    // buttons
    this._btnFit.html('Fit');
    this._btnFit.on('click', () => this.onClickFit());

    this._btnFullScreen.html('Full Screen');
    this._btnFullScreen.on('click', () => this.onClickFullscreen());

    this._btnSaveSvg.html('Save as SVG');
    this._btnSaveSvg.on('click', () => this.onClickSaveAsSvg());

    const hoverStatus = this._interactive ? 'On' : 'Off';
    this._btnToggleHover.html(`Hover: ${hoverStatus}`);
    this._btnToggleHover.on('click', () => this.onClickToggleHover());

    console.log('DONE');

    if (this._interactive) {
      const hover = f.buildHover(this._containerViz);
      hover();
    }
  }

  buildOnFullscreenchange(): any {
    this._running = false;

    const func = () => {
      console.log('start exec func');
      this._running = true;
      this.drawModel({ reset: true });
      this._running = false;
    };

    const onFullscreenchange = () => {
      if (document.fullscreenElement) {
        const id = document.fullscreenElement.id;
        console.log(`>>> element id=${id} entered fullscreen mode`);
        if (!this._running) {
          u.delayAfterNextRepaint(func);
        }
      } else {
        console.log('>>> leaving fullscreen mode');
        if (!this._running) {
          u.delayAfterNextRepaint(func);
        }
      }
    };

    return onFullscreenchange;
  }

  onClickFit(): void {
    console.log('--- onClickFit');
    this.drawModel({ reset: true });
  }

  onClickFullscreen(): void {
    console.log('--- onClickFullscreen');
    this._wrapperViz
      .node()
      .requestFullscreen()
      .catch((err) => {
        const msg = `Cannot go fullscreen: ${err.message} (${err.name})`;
        console.log(msg);
      });
  }

  onClickSaveAsSvg(): void {
    console.log('--- onClickSaveAsSvg');

    const domRect = this.node.getBoundingClientRect();
    const svgRect = (this._containerViz.node() as SVGSVGElement).getBBox();

    const width = Math.min(svgRect.width + svgRect.x, domRect.width);
    const height = Math.min(svgRect.height + svgRect.y, domRect.height);
    const svgDims = { width, height };

    u.downloadSVG({ node: this._wrapperViz.node(), dimensions: svgDims });
  }

  onClickToggleHover(): void {
    console.log('--- onClickToggleHover');
    this._interactive = !this._interactive;
    if (this._interactive) {
      this._btnToggleHover.html('Hover: On');
    } else {
      this._btnToggleHover.html('Hover: Off');
    }
    this.drawModel({ reset: true });
  }
}

/**
 * A mime renderer factory for .(dot|svg) data.
 */
export const rendererFactory: IRenderMime.IRendererFactory = {
  safe: true,
  mimeTypes: [MIME_TYPE_SVG, MIME_TYPE_DOT],
  createRenderer: (options) => new GraphvizWidget(options),
};

/**
 * Extension definition.
 */
const extension: IRenderMime.IExtension = {
  id: 'jupyterlab-graphviz-dot-svg:plugin',
  rendererFactory,
  rank: 0,
  dataType: 'string',
  fileTypes: [
    {
      name: 'dot',
      iconClass: 'jp-MaterialIcon mimerenderer-graphviz-icon',
      fileFormat: 'text',
      mimeTypes: [MIME_TYPE_DOT],
      extensions: ['.dot'],
    },
    {
      name: 'svg',
      iconClass: 'jp-MaterialIcon mimerenderer-svg-icon',
      fileFormat: 'text',
      mimeTypes: [MIME_TYPE_SVG],
      extensions: ['.svg'],
    },
  ],
  documentWidgetFactoryOptions: [
    {
      name: 'dot-viewer',
      primaryFileType: 'dot',
      fileTypes: ['dot'],
      defaultFor: ['dot'],
    },
    {
      name: 'svg-viewer',
      primaryFileType: 'svg',
      fileTypes: ['svg'],
      defaultFor: ['svg'],
    },
  ],
};

export default extension;
