import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

/*
Look here: https://reactjs.org/tutorial/tutorial.html#passing-data-through-props   
TO-DO: Taking Turns [x]

*/

function Square(props) {
  return (
    <button
      className={props.isWinner ? "square winner-square" : "square"}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

function ChangeOrderButton(props) {
  return (
    <button className="change-order-btn" onClick={props.onClick}>
      {props.desc}
    </button>
  );
}

class Board extends React.Component {
  /*
  handleClick(i) {
    console.log("Der Wert des Feldes ist " + i);
    this.props.onClick(i);
  }
*/

  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        key={"Square-" + i}
        isWinner={this.props.winnerSquares.includes(i)}
      />
    );
  }

  render() {
    let square_board = [];
    let i = 0;
    for (let row_count = 0; row_count < 3; row_count++) {
      let row_squares = [];
      for (let col_count = 0; col_count < 3; col_count++, i++) {
        row_squares.push(this.renderSquare(i));
      }
      square_board.push(
        <div className="board-row" key={row_count}>
          {row_squares}
        </div>
      );
    }

    return <div>{square_board}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{ squares: Array(9).fill(null) }],
      changed_squares: [null],
      xIsNext: true,
      stepCount: 0,
      orderIsAsc: true,
    };
  }

  changeOrderClick(current_order) {
    this.setState({
      orderIsAsc: !current_order,
    });
  }
  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepCount + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const changed_squares = this.state.changed_squares.slice(
      0,
      this.state.stepCount + 1
    );

    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares,
        },
      ]),
      changed_squares: changed_squares.concat([i]),
      stepCount: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepCount: step,
      xIsNext: step % 2 === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepCount];
    const obj_win_calc = calculateWinner(current.squares);
    const changed_squares = this.state.changed_squares;
  
    let moves = history.map((step, move) => {
      const square_changed = changed_squares[move];
      let changed_col = (square_changed % 3) + 1;
      let changed_row = Math.floor(square_changed / 3) + 1;

      const desc = move
        ? "Go to move #" +
          move +
          " @ col: " +
          changed_col +
          " row: " +
          changed_row
        : "Go to game start";
      let button_filling;
      if (this.state.stepCount === move) {
        button_filling = <b>{desc}</b>;
      } else {
        button_filling = desc;
      }

      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{button_filling}</button>
        </li>
      );
    });

    if (!this.state.orderIsAsc) {
      moves = moves.slice(0, moves.length).reverse();
    }

    let status;
    if (obj_win_calc) {
      status = "Winner: " + String(obj_win_calc.winner);
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winnerSquares={obj_win_calc ? obj_win_calc.winLine : []}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
          <div>
            <ChangeOrderButton
              onClick={() => this.changeOrderClick(this.state.orderIsAsc)}
              desc={
                this.state.orderIsAsc
                  ? "Make Order Descending"
                  : "Make Order Ascending"
              }
            />
          </div>
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        winLine: lines[i],
      };
    }
  }
  return null;
}
