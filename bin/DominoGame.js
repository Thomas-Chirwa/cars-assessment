import Tile from "./Tile.js";
import Arena from "./Arena.js";
import Player from "./Player.js";

export default class DominoGame {
  DOMINO_SET_NUMBER = 6;
  MAX_TILES_PER_PLAYER = 7;
  arena;

  start() {
    this.setUpGame();

    this.play();
  }

  play() {
    const startingTile = this.arena.board[0];
    var currentPlayerIndex = -1;
    var numberOfPlayers = this.arena.players.length;

    console.log(
      `Game starting with first tile: <${startingTile.topSquare}:${startingTile.bottomSquare}>`
    );

    while (true) {
      if (currentPlayerIndex === numberOfPlayers - 1) {
        currentPlayerIndex = 0;
      } else {
        currentPlayerIndex++;
      }

      const player = this.arena.players[currentPlayerIndex];

      const tileToPlay = this.getTileToPlay(this.arena.board, player);

      if (tileToPlay === null) {
        const drawnTile = this.drawTile(this.arena.stock);

        if (!drawnTile) {
          player.lastDrawnCard = null;
          if (this.allPlayersCannotPlay(this.arena.players)) {
            console.log(`It's a draw, all players cannot play`);

            return;
          }
          this.printBoard(this.arena.board);

          continue;
        }

        this.arena.stock = this.arena.stock.filter((x) => x !== drawnTile);

        this.printBoard(this.arena.board);

        console.log(
          `${player.name} can't play, drawing tile <${drawnTile.topSquare}:${drawnTile.bottomSquare}>`
        );
        player.tiles.push(drawnTile);
        player.lastDrawnCard = drawnTile;
        continue;
      }

      player.tiles = player.tiles.filter((x) => x !== tileToPlay.tile);

      if (player.tiles.length === 0) {
        console.log(`Player ${player.name} has won!`);
        break;
      }

      if (!tileToPlay.tile) {
        console.log(tileToPlay, "hello");
      }

      let tileToConnectTo;

      if (tileToPlay.direction === "start") {
        tileToConnectTo = this.arena.board[0];
        this.arena.board.unshift(tileToPlay.tile);
      } else {
        tileToConnectTo = this.arena.board[this.arena.board.length - 1];
        this.arena.board.push(tileToPlay.tile);
      }

      if (!tileToConnectTo) {
        console.log(tileToConnectTo, tileToPlay, this.arena.board);
      }

      console.log(
        `${player.name} plays <${tileToPlay.tile.topSquare}:${tileToPlay.tile.bottomSquare}> to connect to tile <${tileToConnectTo.topSquare}:${tileToConnectTo.bottomSquare}> on the board`
      );

      this.printBoard(this.arena.board);
    }
  }

  allPlayersCannotPlay(players) {
    return !players.some((x) => x.lastDrawnCard);
  }

  printBoard(board) {
    var tilesString = "";

    for (let index = 0; index < board.length; index++) {
      const nextTile = board[index + 1];
      const tile = board[index];

      let startValue;
      let endValue;
      let connectingValue;

      if (nextTile) {
        connectingValue = this.getConnectingValue(tile, nextTile);

        startValue =
          tile.topSquare === connectingValue
            ? tile.bottomSquare
            : tile.topSquare;
        endValue =
          startValue === connectingValue ? tile.topSquare : tile.bottomSquare;
      } else {
        connectingValue = this.getConnectingValue(tile, board[index - 1]);

        startValue =
          tile.topSquare !== connectingValue
            ? tile.bottomSquare
            : tile.topSquare;
        endValue =
          startValue !== connectingValue ? tile.topSquare : tile.bottomSquare;
      }

      tilesString += `<${tile.topSquare}:${tile.bottomSquare}>`;
    }

    console.log(`Board is now ${tilesString}`);
  }

  getConnectingValue(tile, nextTile) {
    if (!nextTile) {
      return null;
    }
    if (tile.topSquare === nextTile.topSquare) {
      return tile.topSquare;
    }
    if (tile.topSquare === nextTile.bottomSquare) {
      return tile.topSquare;
    }
    if (tile.bottomSquare === nextTile.bottomSquare) {
      return tile.bottomSquare;
    }
    if (tile.bottomSquare === nextTile.topSquare) {
      return tile.bottomSquare;
    }

    return null;
  }

  drawTile(tiles) {
    const index = this.getRandomTileIndex(tiles);
    return tiles[index];
  }

  getTileToPlay(board, player) {
    const boardStartTile = board[0];
    const boardEndTile = board[board.length - 1];

    if (board.length === 1) {
      for (const tile of player.tiles) {
        if (tile.topSquare === boardStartTile.topSquare) {
          tile.openToConnect = tile.bottomSquare;
          return {
            direction: "start",
            tile: tile,
          };
        }
        if (tile.topSquare === boardStartTile.bottomSquare) {
          tile.openToConnect = tile.bottomSquare;
          return {
            direction: "end",
            tile: tile,
          };
        }
        if (tile.bottomSquare === boardStartTile.bottomSquare) {
          tile.openToConnect = tile.topSquare;
          return {
            direction: "end",
            tile: tile,
          };
        }
        if (tile.bottomSquare === boardStartTile.topSquare) {
          tile.openToConnect = tile.topSquare;
          return {
            direction: "start",
            tile: tile,
          };
        }
      }

      return null;
    }

    for (const tile of player.tiles) {
      if (boardStartTile.openToConnect === tile.topSquare) {
        tile.openToConnect = tile.bottomSquare;

        return {
          direction: "start",
          tile: tile,
        };
      }

      if (boardStartTile.openToConnect === tile.bottomSquare) {
        tile.openToConnect = tile.topSquare;
        return {
          direction: "start",
          tile: tile,
        };
      }

      if (boardEndTile.openToConnect === tile.topSquare) {
        tile.openToConnect = tile.bottomSquare;
        return {
          direction: "end",
          tile: tile,
        };
      }

      if (boardEndTile.openToConnect === tile.bottomSquare) {
        tile.openToConnect = tile.topSquare;
        return {
          direction: "end",
          tile: tile,
        };
      }
    }

    return null;
  }

  setUpGame() {
    const defaultTiles = this.generateDefaultTiles();
    const startingTileIndex = this.getRandomTileIndex(defaultTiles);
    const startingTile = defaultTiles[startingTileIndex];

    this.arena = new Arena();

    this.arena.board = [startingTile];

    this.arena.stock = defaultTiles.filter((x) => x !== startingTile);

    this.setUpPlayers(this.arena);
  }

  setUpPlayers(arena) {
    const player1Tiles = this.getRandomTiles(arena.stock);

    arena.stock = arena.stock.filter((x) => !player1Tiles.includes(x));

    const player2Tiles = this.getRandomTiles(arena.stock);

    arena.stock = arena.stock.filter((x) => !player2Tiles.includes(x));

    const player1 = new Player("Alice", player1Tiles);
    const player2 = new Player("Bob", player2Tiles);

    arena.players = [player1, player2];
  }

  getRandomTiles(defaultTiles) {
    const tiles = [];

    var count = 0;

    while (count < this.MAX_TILES_PER_PLAYER) {
      const randomTileIndex = this.getRandomTileIndex(defaultTiles);
      const randomTile = defaultTiles[randomTileIndex];

      if (tiles.includes(randomTile)) {
        continue;
      }

      tiles.push(randomTile);
      count++;
    }

    return tiles;
  }

  getRandomTileIndex(defaultTiles) {
    return Math.floor(Math.random() * Math.floor(defaultTiles.length));
  }

  generateDefaultTiles() {
    const tiles = [];

    for (var topSquare = 0; topSquare <= this.DOMINO_SET_NUMBER; topSquare++) {
      for (
        var bottomSquare = 0;
        bottomSquare <= this.DOMINO_SET_NUMBER;
        bottomSquare++
      ) {
        const tile = new Tile(topSquare, bottomSquare);
        tiles.push(tile);
      }
    }

    return tiles;
  }
}
