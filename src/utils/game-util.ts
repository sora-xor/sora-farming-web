import { ETH_TILE_AMOUNT, VAL_TILE_AMOUNT, XOR_TILE_AMOUNT } from '@/consts'
import BN from 'bignumber.js'

enum CellType {
  TEA = 'tea',
  RIVER = 'river',
  RICE = 'rice'
}

export enum CellStatus {
  F1 = 'f1',
  F2 = 'f2',
  F3 = 'f3',
  F4 = 'f4',
  F5 = 'f5',
  F6 = 'f6',
  F7 = 'f7',
  F8 = 'f8',
  FULL = 'full',
  INACTIVE = 'inactive',
  INACTIVE_PSWAP = 'inactive-pswap',
  UNFARMED = 'unfarmed'
}

export interface Cell {
  readonly type: CellType;
  status: CellStatus;
  priority: number;
}

export type GameMap = Cell[][]

const getStatusByNum = {
  1: CellStatus.F1,
  2: CellStatus.F2,
  3: CellStatus.F3,
  4: CellStatus.F4,
  5: CellStatus.F5,
  6: CellStatus.F6,
  7: CellStatus.F7,
  8: CellStatus.F8
}

const ratio = (x: number, tile: number): BN => new BN(x).div(tile)

const userTotal = ({ XE, XV, VE }) => ({
  XOR: new BN(XE.token0)
    .plus(XV.token0),
  VAL: new BN(VE.token0)
    .plus(XV.token1),
  ETH: new BN(XE.token1)
    .plus(VE.token1)
})

const genCell = (type, status, priority): Cell => {
  return { type, status, priority }
}

const getCellImgPath = (c: Cell): string => `tile-${c.type}-${c.status}.gif`

const generateMap = (y, x): GameMap => {
  const map: Cell[][] = []
  for (let _y = 0; _y < y; _y++) {
    map[_y] = []
    for (let _x = 0; _x < x; _x++) {
      if (_x > 5 && _x < 9) {
        map[_y][_x] = genCell(CellType.RIVER, CellStatus.UNFARMED, 0)
      } else if (_x < 6) {
        map[_y][_x] = genCell(CellType.RICE, CellStatus.UNFARMED, 0)
      } else if (_x > 8) {
        map[_y][_x] = genCell(CellType.TEA, CellStatus.UNFARMED, 0)
      }
    }
  }
  for (let _y = 0; _y < Math.floor(Math.max(x, y) / 2); _y++) {
    for (let _x = 0; _x < Math.max(x, y); _x++) {
      map[Math.min(_x + _y, y - 1 - _y)][0 + _y].priority = _y
      map[0 + _y][Math.min(_x + _y, x - 1 - _y)].priority = _y
      map[Math.min(_x + _y, y - 1 - _y)][x - 1 - _y].priority = _y
      map[y - 1 - _y][Math.min(_x + _y, x - 1 - _y)].priority = _y
    }
  }
  return map
}

const populateMap = (map, { x, y }, { XOR, VAL, ETH }, { user, liquidity }) => {
  const userTotalTokens = userTotal(liquidity)
  const userCells = userCell(userTotalTokens, user.reward)

  let priority = Math.floor(Math.max(x, y) / 2)
  let totalCells = XOR + VAL + ETH
  while (totalCells > 0) {
    map.forEach((row: Cell[]) => {
      row.forEach((cell: Cell) => {
        if (cell.priority === priority) {
          if (cell.type === CellType.RICE && XOR > 0) {
            if (userCells.XOR >= 9) {
              cell.status = CellStatus.FULL
              userCells.XOR -= 9
            } else if (userCells.XOR < 9 && userCells.XOR !== 0) {
              cell.status = getStatusByNum[userCells.XOR]
              userCells.XOR = 0
            } else {
              cell.status = CellStatus.INACTIVE
            }
            totalCells -= 1
            XOR -= 1
          }
          if (cell.type === CellType.TEA && VAL > 0) {
            if (userCells.VAL >= 9) {
              cell.status = CellStatus.FULL
              userCells.VAL -= 9
            } else if (userCells.VAL < 9 && userCells.VAL !== 0) {
              cell.status = getStatusByNum[userCells.VAL]
              userCells.VAL = 0
            } else {
              cell.status = CellStatus.INACTIVE
            }
            totalCells -= 1
            VAL -= 1
          }
          if (cell.type === CellType.RIVER && ETH > 0) {
            if (userCells.ETH >= 9) {
              cell.status = CellStatus.FULL
              userCells.ETH -= 9
            } else if (userCells.ETH < 9 && userCells.ETH !== 0) {
              cell.status = getStatusByNum[userCells.ETH]
              userCells.ETH = 0
            } else {
              if (userCells.ZERO > 0) {
                cell.status = CellStatus.INACTIVE_PSWAP
                userCells.ZERO = 0
              } else {
                cell.status = CellStatus.INACTIVE
              }
            }
            totalCells -= 1
            ETH -= 1
          }
        }
      })
    })
    priority -= 1
  }
  return map
}

const userCell = ({ XOR, ETH, VAL }, reward: string) => {
  const isLiquidityEqZero = XOR.eq(0) && VAL.eq(0) && ETH.eq(0)
  const showZeroLiquidityCell = isLiquidityEqZero && new BN(reward).gt(0)
  return {
    XOR: Math.ceil(ratio(XOR, XOR_TILE_AMOUNT).div(new BN(1).div(9)).toNumber()),
    VAL: Math.ceil(ratio(VAL, VAL_TILE_AMOUNT).div(new BN(1).div(9)).toNumber()),
    ETH: Math.ceil(ratio(ETH, ETH_TILE_AMOUNT).div(new BN(1).div(9)).toNumber()),
    ZERO: showZeroLiquidityCell ? 1 : 0
  }
}

export default {
  generateMap,
  populateMap,
  getCellImgPath
}
