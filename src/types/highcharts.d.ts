import type { GeoJSON } from 'highcharts';

declare module '@highcharts/map-collection/custom/world.geo.json' {
  const value: GeoJSON;
  export default value;
}
