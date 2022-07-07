import React from 'react';
import ReactDOM from 'react-dom/client';
import PropTypes from 'prop-types';
import './style.css';

const dx = [1, 0, -1, 0, 1, 1, -1, -1];
const dy = [0, 1, 0, -1, 1, -1, 1, -1];

class Game extends React.Component {
    state = {
        height: 8,
        width: 8,
        mines: 8,
    };

    render() {
        const { height, width, mines } = this.state;
        return (
            <div className="game">
                <Board height={height} width={width} mines={mines} />
            </div>
        );
    }
}

class Cell extends React.Component {
    getValue() {
        const { value } = this.props;
        if (!value.isRevealed) {
            return value.isFlagged ? "🚩" : null;
        }
        if (value.isMine) {
            return "💣";
        }
        if (value.neighbour === 0) {
            return null;
        }
        return value.neighbour;
    }

    render() {
        const { value, onClick, cMenu } = this.props;
        let className =
            "cell" +
            (value.isRevealed ? "" : " hidden") +
            (value.isMine ? " is-mine" : "") +
            (value.isFlagged ? " is-flag" : "");
        return (
            <div
                onClick={onClick}
                className={className}
                onContextMenu={cMenu}
            >
                {this.getValue()}
            </div>
        );
    }
}

class Board extends React.Component {
    state = {
        boardData: this.initBoardData(this.props.height, this.props.width, this.props.mines),
        mineCount: this.props.mines,
        gameStatus: 'Ongoing',
    };

    render() {
        return (
            <div className="board">
                <div className="game-info">
                    <span className="info">
                        <h3> {this.state.gameStatus} </h3>
                        <h4> Mines left: {this.state.mineCount} </h4>
                    </span>
                    <br />
                    <span className="info">
                        {this.gameStatus}
                    </span>
                </div>
                {this.renderBoard(this.state.boardData)}
            </div>
        );
    }

    renderBoard(data) {
        return data.map((datarow) => {
            let items = datarow.map((dataitem) => {
                return (
                    <div key={dataitem.x * datarow.length + dataitem.y} className = "cellContainer">
                        <Cell
                            value={dataitem}
                            onClick = {() => {this.revealCell(dataitem.x, dataitem.y)}}
                            cMenu = {(e) => {this.flagCell(e, dataitem.x, dataitem.y)}}
                        />
                        {(datarow[datarow.length - 1] === dataitem) ? <div className="clear"> </div> : ""}
                    </div>
                );
            })
            return (
                <div style={{ display: 'flex' }}>
                    {items}
                </div>
            );
        });
    }

    initBoardData(height, width, mines) {
        let data = this.createEmptyArray(height, width);
        data = this.plantMines(data, height, width, mines);
        data = this.getNeighbours(data, height, width);
        return data;
    }

    createEmptyArray(height, width) {
        let data = [];
        for (let i = 0; i < height; i++) {
            data.push([]);
            for (let j = 0; j < width; j++) {
                data[i][j] = {
                    x: i,
                    y: j,
                    isMine: false,
                    neighbour: 0,
                    isRevealed: false,
                    isEmpty: false,
                    isFlagged: false,
                };
            }
        }
        return data;
    }

    plantMines(data, height, width, mines) {
        let x, y, minesPlanted = 0;

        while (minesPlanted < mines) {
            x = Math.floor(Math.random() * height);
            y = Math.floor(Math.random() * width);

            if (!data[x][y].isMine) {
                data[x][y].isMine = true;
                minesPlanted++;
            }
        }

        return data;
    }

    getNeighbours(data, height, width) {
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                if (!data[i][j].isMine) {
                    let nx, ny = 0;
                    for (let k = 0; k < 8; k++) {
                        nx = i + dx[k];
                        ny = j + dy[k];

                        if (0 <= nx && nx < height && 0 <= ny && ny < width && data[nx][ny].isMine) {
                            data[i][j].neighbour++;
                        }
                    }
                }
            }
        }

        return data;
    }

    revealCell(x, y) {
        if(x < 0 || x >= this.props.height || y < 0 || y >= this.props.width ) return null;
        if (this.state.boardData[x][y].isRevealed || this.state.boardData[x][y].isFlagged) return null;

        if (this.state.boardData[x][y].isMine) {
            this.setState({ gameStatus: 'You Lose' });
            this.revealBoard();
            alert('You Lose');
            return null;
        }

        let updatedData = this.state.boardData;
        updatedData[x][y].isFlagged = false;
        updatedData[x][y].isRevealed = true;

        if (updatedData[x][y].neighbour === 0) {
            for(let i = 0; i < 8; i++) {
                this.revealCell(x + dx[i], y + dy[i]);
            }
        }

        if (this.checkWin(updatedData)) {
            this.setState({ mineCount: 0, gameStatus: 'You Win' });
            this.revealBoard();
            alert("You Win");
        }

        this.setState({
            boardData: updatedData,
            mineCount: this.props.mines - this.getFlags(updatedData),
        });
    }

    flagCell(e, x, y) {
        e.preventDefault();
        if(x < 0 || x >= this.props.height || y < 0 || y >= this.props.width ) return null;
        if (this.state.boardData[x][y].isRevealed) return null;

        let updatedData = this.state.boardData;
        updatedData[x][y].isFlagged = !updatedData[x][y].isFlagged;

        this.setState({
            boardData: updatedData,
            mineCount: this.props.mines - this.getFlags(updatedData),
        });
    }

    revealBoard() {
        for(let i = 0; i < this.props.height; i++) {
            for(let j = 0; j < this.props.width; j++) {
                let updatedData = this.state.boardData;
                updatedData[i][j].isFlagged = false;
                updatedData[i][j].isRevealed = true;

                this.setState({
                    boardData: updatedData,
                    mineCount: this.props.mines - this.getFlags(updatedData),
                });
            }
        }
    }

    checkWin(data) {
        for(let i = 0; i < this.props.height; i++) {
            for(let j = 0; j < this.props.width; j++) {
                if(!data[i][j].isMine && (!data[i][j].isRevealed || data[i][j].isFlagged))
                    return false;
            }
        }
        return true;
    }

    getFlags(data) {
        let flags = 0;
        for(let i = 0; i < this.props.height; i++) {
            for(let j = 0; j < this.props.width; j++) {
                if(data[i][j].isFlagged)
                    flags++;
            }
        }
        return flags;
    }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(< Game / >);