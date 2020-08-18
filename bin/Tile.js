export default class Tile {
  constructor(topSquare, bottomSquare) {
    this.topSquare = topSquare;
    this.bottomSquare = bottomSquare;
  }

  topSquare;
  bottomSquare;
  openToConnect;
}
