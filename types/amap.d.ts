declare namespace AMap {
  interface MapOptions {
    center?: [number, number];
    zoom?: number;
    mapStyle?: string;
    zoomControl?: boolean;
  }

  class Map {
    constructor(container: HTMLElement | string, opts?: MapOptions);
    setZoomAndCenter(zoom: number, center: [number, number]): void;
    destroy(): void;
  }

  interface MarkerOptions {
    position?: [number, number];
    map?: Map;
  }

  class Marker {
    constructor(opts?: MarkerOptions);
    setPosition(position: [number, number]): void;
    setMap(map: Map | null): void;
  }

  interface AutoCompleteTip {
    name: string;
    district: string;
    adcode: string;
    location?: { lat: number; lng: number };
  }

  interface AutoCompleteResult {
    tips: AutoCompleteTip[];
  }

  class AutoComplete {
    constructor(opts: { city?: string; citylimit?: boolean });
    search(
      keyword: string,
      callback: (status: string, result: AutoCompleteResult) => void,
    ): void;
  }
}
