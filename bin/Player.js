export default class Player {
  constructor(name, tiles) {
    this.name = name;
    this.tiles = tiles;
  }

  name;
  tiles;
  lastDrawnCard;
}
