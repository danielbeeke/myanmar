import stc from 'string-to-color'
import type { LayerSpecification, SourceSpecification } from 'maplibre-gl'

export class ColoredGeoJson {

  public geojsonFeatures: any
  public url: string
  public name: string
  public filter: any
  public data: any
  public colorProperty: string

  constructor (name: string, url: string, filter: (item: any) => boolean, colorProperty: string) {
    this.name = name
    this.url = url
    this.filter = filter
    this.colorProperty = colorProperty
  }

  async init () {
    if (this.geojsonFeatures) return

    const data = await fetch(this.url).then(response => response.json())
    const filteredFeatures = data.features.filter(this.filter)

    filteredFeatures.forEach((group: any) => {
      group.properties.color = stc(group.properties[this.colorProperty])
    })

    data.features = filteredFeatures

    this.data = data
  }

  async asLayers () {
    await this.init()

    return {
      layers: [{
        id: this.name,
        type: "fill",
        source: this.name,
        'layout': {},
        'paint': {
            'fill-color': ['get', 'color'],
            'fill-opacity': 0.3
        }
      }, {
        id: `${this.name}-labels`,
        type: 'symbol',
        source: this.name,
        paint: {
          'text-color': 'black',
          'text-halo-blur': 2,
          'text-halo-color': 'white',
          'text-halo-width': 2
        },
        layout: {
            'text-field': ["get", this.colorProperty],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12,
        }
      }],
      sources: {
        ethnics: {
          type: 'geojson',
          data: this.data
        }
      }
    } as {
      layers: Array<LayerSpecification>,
      sources: { [key: string]: SourceSpecification }
    }
  }
}