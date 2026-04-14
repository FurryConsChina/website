declare const VERSION: string;
declare const COMMITHASH: string;
declare const BRANCH: string;

type TrackEventValue = Record<string, unknown>;
type TMapLatLngInstance = object;

interface AnalyticsTracker {
  track: (eventName: string, eventValue?: TrackEventValue) => void;
}

interface TMapMapInstance {
  on: (eventName: string, handler: () => void) => void;
}

interface TMapNamespace {
  LatLng: new (lat: number | undefined, lng: number | undefined) => TMapLatLngInstance;
  Map: new (
    container: HTMLElement | null,
    options: {
      center: TMapLatLngInstance;
      zoom: number;
      pitch: number;
      rotation: number;
    }
  ) => TMapMapInstance;
  MultiMarker: new (options: {
    id: string;
    map: TMapMapInstance;
    styles: {
      marker: unknown;
    };
    geometries: Array<{
      id: string;
      styleId: string;
      position: TMapLatLngInstance;
      properties: {
        title: string;
      };
    }>;
  }) => unknown;
  MarkerStyle: new (options: {
    width: number;
    height: number;
    anchor: {
      x: number;
      y: number;
    };
  }) => unknown;
}

interface Window {
  gtag?: (command: "event", eventName: string, eventValue?: TrackEventValue) => void;
  TMap?: TMapNamespace;
  umami?: AnalyticsTracker;
}
