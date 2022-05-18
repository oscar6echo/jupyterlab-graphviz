import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
import { Widget } from '@lumino/widgets';

import * as d3 from 'd3-selection';
import * as d3Zoom from 'd3-zoom';

import * as i from './interfaces';
import * as u from './utils';
import * as f from './functions';

const MIME_TYPE = 'application/vnd.graphviz';
const CLASS_NAME = 'mimerenderer-graphviz';

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

  private _wrapperViz: i.d3SelectDiv;
  private _vizSvg: i.d3SelectSvg;
  private _vizParams: i.IOutputBuildVizParams;
  private _running: boolean;

  /**
   * Construct a new output widget.
   */
  constructor(options: IRenderMime.IRendererOptions) {
    console.log('start GraphvizWidget constructor');

    super();
    this._mimeType = options.mimeType;

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

    this._wrapperViz = root.append('div').attr('class', 'wrapper-viz');

    const onFullscreenchange = this.buildOnFullscreenchange();
    this._wrapperViz
      .node()
      .addEventListener('fullscreenchange', onFullscreenchange);
  }

  /**
   * render .dot into widget's node.
   */
  renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    console.log('--- start GraphvizWidget renderModel');

    this._data = model.data[this._mimeType] as string;
    return this.drawDot({ data: this._data, reset: false });
  }

  /**
   * main action entrypoint
   */
  async drawDot({ data, reset }: i.IParamsDrawDot): Promise<void> {
    console.log('--- start GraphvizWidget drawDot');

    //   const root = d3.select(this.node);
    const root = this._wrapperViz;

    const vizExists = !root.select('svg#viz').empty();

    if (vizExists && !reset) {
      console.log('viz already exists and not reset - SKIP');
      return;
    }
    if (vizExists) {
      console.log('remove existing element');
      root.select('svg#viz').remove();
    }

    this._vizParams = await f.buildVizParams({
      dotScript: data ? data : this._data,
      wrapper: this._wrapperViz,
    });

    this._vizSvg = root.append('svg');
    this._vizSvg.attr('id', 'viz');
    this._vizSvg.attr('width', this._vizParams.dimensions.wrapper.width);
    this._vizSvg.attr('height', this._vizParams.dimensions.wrapper.height);
    this._vizSvg.html(this._vizParams.html);

    const zoomed = (e: any) => {
      //   console.log(e.transform);
      this._vizSvg
        .select(`#${this._vizParams.id}`)
        .attr('transform', e.transform);
    };

    const t = this._vizParams.transform.zoom;

    const zoom = d3Zoom.zoom().on('zoom', zoomed);

    this._vizSvg.call(
      zoom.transform as any,
      d3Zoom.zoomIdentity.scale(t.scale).translate(t.translate.x, t.translate.y)
    );
    this._vizSvg.call(zoom as any);

    this._btnFit.html('Fit');
    this._btnFit.on('click', () => this.onClickFit());

    this._btnFullScreen.html('Full Screen');
    this._btnFullScreen.on('click', () => this.onClickFullscreen());

    this._btnSaveSvg.html('Save as SVG');
    this._btnSaveSvg.on('click', () => this.onClickSaveAsSvg());

    const hover = f.buildHover(this._vizSvg);
    hover();
  }

  buildOnFullscreenchange(): any {
    this._running = false;

    const func = () => {
      console.log('start exec func');
      this._running = true;
      this.drawDot({ reset: true });
      this._running = false;
    };

    const onFullscreenchange = () => {
      if (document.fullscreenElement) {
        const id = document.fullscreenElement.id;
        console.log(`>>>> element id=${id} entered fullscreen mode`);
        if (!this._running) {
          u.delayAfterNextRepaint(func);
        }
      } else {
        console.log('>>>> leaving fullscreen mode');
        if (!this._running) {
          u.delayAfterNextRepaint(func);
        }
      }
    };

    return onFullscreenchange;
  }

  onClickFit(): void {
    console.log('onClickFit');
    this.drawDot({ reset: true });
  }

  onClickSaveAsSvg(): void {
    console.log('onClickSaveAsSvg');

    const domRect = this.node.getBoundingClientRect();
    const svgRect = (this._vizSvg.node() as SVGSVGElement).getBBox();

    // console.log('wrapper: this.node');
    // console.log(domRect);

    // console.log('svg: vizSvg');
    // console.log(svgRect);

    const width = Math.min(svgRect.width + svgRect.x, domRect.width);
    const height = Math.min(svgRect.height + svgRect.y, domRect.height);
    const svgDims = { width, height };

    u.downloadSVG({ node: this._wrapperViz.node(), dimensions: svgDims });
  }

  onClickFullscreen(): void {
    console.log('onClickFullscreen');
    this._wrapperViz
      .node()
      .requestFullscreen()
      .catch((err) => {
        const msg = `Cannot go fullscreen: ${err.message} (${err.name})`;
        console.log(msg);
      });
  }
}

/**
 * A mime renderer factory for .dot data.
 */
export const rendererFactory: IRenderMime.IRendererFactory = {
  safe: true,
  mimeTypes: [MIME_TYPE],
  createRenderer: (options) => new GraphvizWidget(options),
};

/**
 * Extension definition.
 */
const extension: IRenderMime.IExtension = {
  id: 'jupyterlab-graphviz:plugin',
  rendererFactory,
  rank: 0,
  dataType: 'string',
  fileTypes: [
    {
      name: 'dot',
      iconClass: 'jp-MaterialIcon mimerenderer-graphviz-icon',
      fileFormat: 'text',
      mimeTypes: [MIME_TYPE],
      extensions: ['.dot'],
    },
  ],
  documentWidgetFactoryOptions: {
    name: 'graphviz-dot viewer',
    primaryFileType: 'dot',
    fileTypes: ['dot'],
    defaultFor: ['dot'],
  },
};

export default extension;
