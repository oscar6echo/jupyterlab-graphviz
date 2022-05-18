import * as d3 from 'd3-selection';

type d3SelectBtn = d3.Selection<HTMLButtonElement, unknown, null, undefined>;
type d3SelectDiv = d3.Selection<HTMLDivElement, unknown, null, undefined>;
type d3SelectSvg = d3.Selection<SVGSVGElement, unknown, null, undefined>;

interface IDimensions {
  width: number;
  height: number;
}

interface ITransform {
  src: string;
  zoom: { scale: number; translate: { x: number; y: number } };
}

interface IParamsDrawDot {
  data?: string;
  reset: boolean;
}

interface IParamsBuildVizParams {
  dotScript: string;
  wrapper: d3SelectDiv;
}

interface IOutputBuildVizParams {
  dimensions: {
    graph: IDimensions;
    wrapper: IDimensions;
  };
  transform: ITransform;
  id: string;
  html: string;
}

interface ITransformTranslateOrScale {
  x: number;
  y: number;
}

interface ITransformRotate {
  a: number;
  x: number;
  y: number;
}
interface ITransformSkewxOrSkewy {
  a: number;
}

interface ITransformMatrix {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
}

interface IParseTransformOutput {
  translate?: ITransformTranslateOrScale;
  scale?: ITransformTranslateOrScale;
  rotate?: ITransformRotate;
  skewX?: ITransformSkewxOrSkewy;
  skewY?: ITransformSkewxOrSkewy;
  matrix?: ITransformMatrix;
}

interface IClicked {
  [key: string]: any;
}

interface IColor {
  [key: string]: any;
}

interface IParamsDownloadSvg {
  node: HTMLDivElement;
  dimensions: IDimensions;
}

export {
  d3SelectBtn,
  d3SelectDiv,
  d3SelectSvg,
  IDimensions,
  IParamsDrawDot,
  IParamsBuildVizParams,
  IOutputBuildVizParams,
  ITransformTranslateOrScale,
  ITransformRotate,
  ITransformSkewxOrSkewy,
  ITransformMatrix,
  IParseTransformOutput,
  IClicked,
  IColor,
  IParamsDownloadSvg,
};
