let canvas;
let context;
let board;
function init(){
    canvas = document.createElement("canvas");
    context = canvas.getContext("2d");
    document.body.appendChild(canvas);
    canvas.width = 1000;
    canvas.height = 1000;
    board = new Board(1000,1000);
    board.draw(context);
    var events = ["onmousedown", "onmouseup", "onmousemove"];
    //  "ontouchstart", "ontouchend", "ontouchmove" later
    for(i of events){
        canvas[i] = mouse_handler;
    }
    board.set_tile(0, 0, new Piece(Piece.ROOK, "black"));
    board.set_tile(1, 0, new Piece(Piece.KNIGHT, "black"));
    board.set_tile(2, 0, new Piece(Piece.BISHOP, "black"));
    board.set_tile(3, 0, new Piece(Piece.QUEEN, "black"));
    board.set_tile(4, 0, new Piece(Piece.KING, "black"));
    board.set_tile(5, 0, new Piece(Piece.BISHOP, "black"));
    board.set_tile(6, 0, new Piece(Piece.KNIGHT, "black"));
    board.set_tile(7, 0, new Piece(Piece.ROOK, "black"));

    board.set_tile(0, 7, new Piece(Piece.ROOK, "white"));
    board.set_tile(1, 7, new Piece(Piece.KNIGHT, "white"));
    board.set_tile(2, 7, new Piece(Piece.BISHOP, "white"));
    board.set_tile(3, 7, new Piece(Piece.QUEEN, "white"));
    board.set_tile(4, 7, new Piece(Piece.KING, "white"));
    board.set_tile(5, 7, new Piece(Piece.BISHOP, "white"));
    board.set_tile(6, 7, new Piece(Piece.KNIGHT, "white"));
    board.set_tile(7, 7, new Piece(Piece.ROOK, "white"));
    board.draw(context);
}

function mouse_handler(event){
    if(board.mouse_events(event)){
        board.draw(context);
    }
}

class Board{
    constructor(w, h){
        this.width = w;
        this.height = h;
        this.set_grid(8, 8);
        this.checkered = true;
        this.check_colors = ["#f0d9b5", "#b58863"]
        this.selected_piece = null;
    }

    get_valid_moves(x, y, moves){
        let valid = []
        if("jumps" in moves){
            for(let c of moves.jumps){
                let coord = [x + c[0], y + c[1]]
                if(this.is_inside(...coord)){
                    if(this.get_tile(...coord) == null || this.get_tile(x, y).color != this.get_tile(...coord).color){
                        valid.push(coord);
                    }
                }
            }
        }
        if("repeats" in moves){
            for(let v of moves.repeats){
                let coord = [x + v[0], y + v[1]];
                while(this.is_inside(...coord)){
                    let t = this.get_tile(...coord);
                    if(t != null){
                        if(t.color != this.get_tile(x, y).color){
                            valid.push(coord);
                        }
                        break;
                    }
                    valid.push(coord);
                    coord = [coord[0] + v[0], coord[1] + v[1]];
                }
            }
        }
        return valid;
    }

    mouse_events(event){
        var btn = event.button;
        var x = event.offsetX;
        var y = event.offsetY;
        var type = event.type;
        if(btn != 0)return;
        var tx = Math.floor(x / this.size_x);
        var ty = Math.floor(y / this.size_y);
        switch(type){
            case "mousedown":
                if(this.selected_piece == null){
                    var tile = this.get_tile(tx, ty);
                    if(tile != null){
                        let valid = this.get_valid_moves(tx, ty, tile.get_moves());
                        this.selected_piece = [tx, ty, tile, valid];
                        this.selected_piece[2].is_drag = true;
                        this.selected_piece[2].drag_x = x / this.size_x;
                        this.selected_piece[2].drag_y = y / this.size_y;
                        return true;
                    }
                }else{
                    if(tx == this.selected_piece[0] && ty == this.selected_piece[1]){
                        this.selected_piece[2].is_drag = !this.selected_piece[2].is_drag;
                        this.selected_piece[2].drag_x = x / this.size_x;
                        this.selected_piece[2].drag_y = y / this.size_y;
                        return true;
                        //stop drag
                    }
                    //place selected piece if valid
                }
                break
            case "mouseup":
                if(this.selected_piece == null)return;
                if(tx == this.selected_piece[0] && ty == this.selected_piece[1]){
                    this.selected_piece[2].is_drag = false;
                    return true;
                    //stop drag
                }else{
                    //place if valid
                    this.selected_piece[2].is_drag = false;
                    if(this.has_array(this.selected_piece[3], [tx, ty])){
                        this.move_tile(tx, ty, ...this.selected_piece);
                    }
                    this.selected_piece = null;
                    return true;
                }
                break
            case "mousemove":
                if(this.selected_piece == null)return;
                if(this.selected_piece[2].is_drag){
                    this.selected_piece[2].drag_x = x / this.size_x;
                    this.selected_piece[2].drag_y = y / this.size_y;
                    return true;
                }
                break
        }
    }

    array_equal(a, b){
        if(a.length != b.length)return false;
        for(let i in a){
            if(a[i] != b[i])return false;
        }
        return true;
    }

    has_array(a, b){
        //assumes same length
        for(let i of a){
            if(this.array_equal(i, b))return true;
        }
        return false;
    }

    is_inside(x, y){
        return  x >= 0 && x < this.tiles.length && y >= 0 && y < this.tiles[0].length
    }

    get_tile(x, y){
        if(this.is_inside(x, y)){
            return this.tiles[x][y];
        }
        return null;
    }

    move_tile(tx, ty, fx, fy, p){
        if(this.set_tile(tx, ty, p)){
            this.tiles[fx][fy] = null;
            return true;
        }
    }

    set_tile(x, y, p){
        if(this.get_tile(x, y) != null){
            //capture? or unhandled error?
        }else if(this.is_inside(x, y)){
            this.tiles[x][y] = p;
            return true;
        }else{
            //invalid
        }
    }

    set_grid(x, y){
        this.tiles_x = x;
        this.tiles_y = y;
        this.size_x = this.width / this.tiles_x;
        this.size_y = this.height / this.tiles_y;
        this.tiles = [];
        for(let i = 0; i < y; i++){
            let row = [];
            for(let j = 0; j < x; j++){
                row.push(null);
            }
            this.tiles.push(row);
        }
    }

    draw(ctx){
        let check = 0;
        for(let i = 0; i < this.tiles_x; i++){
            for(let j = 0; j < this.tiles_y; j++){
                ctx.fillStyle = this.check_colors[check];
                check = check == 0 ? 1 : 0;
                ctx.fillRect(i * this.size_x, j * this.size_y, this.size_x, this.size_y);
            }
            check = check == 0 ? 1 : 0;
        }
        if(this.selected_piece != null){
            for(let i of this.selected_piece[3]){
                ctx.fillStyle = "green";
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.arc((i[0] + 0.5) * this.size_x, (i[1] + 0.5) * this.size_y, Math.min(this.size_x, this.size_y) / 4, 0, 2 * Math.PI, false);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }
        for(let i in this.tiles){
            for(let j in this.tiles[0]){
                let t = this.tiles[i][j];
                if(t != null){
                    if(t.is_drag){
                        t.get_draw()(ctx, t.drag_x - 0.5, t.drag_y - 0.5, this.size_x, this.size_y);
                    }else{
                        t.get_draw()(ctx, i, j, this.size_x, this.size_y);
                    }
                }
            }
        }
    }
}

class Piece{
    static KNIGHT = {
        "moves": {
            "jumps": [[1, 2], [2, 1], [-1, 2], [2, -1], [1, -2], [-2, 1], [-1, -2], [-2, -1]]
        },
        "icon": {
            "type": "char",
            "white": "♘",
            "black": "♞"
        }
    }

    static ROOK = {
        "moves":{
            "repeats": [[0, 1], [0, -1], [-1, 0], [1, 0]]
        },
        "icon": {
            "type": "char",
            "white": "♖",
            "black": "♜"
        }
    }

    static BISHOP = {
        "moves":{
            "repeats": [[1, 1], [-1, -1], [-1, 1], [1, -1]]
        },
        "icon": {
            "type": "char",
            "white": "♗",
            "black": "♝"
        }
    }

    static QUEEN = {
        "moves":{
            "repeats": [[0, 1], [0, -1], [-1, 0], [1, 0], [1, 1], [-1, -1], [-1, 1], [1, -1]]
        },
        "icon": {
            "type": "char",
            "white": "♕",
            "black": "♛"
        }
    }

    static KING = {
        //needs handlers for checks
        "moves":{
            "jumps": [[0, 1], [0, -1], [-1, 0], [1, 0], [1, 1], [-1, -1], [-1, 1], [1, -1]]
        },
        "icon": {
            "type": "char",
            "white": "♔",
            "black": "♚"
        }
    }

    constructor(preset, color){
        this.preset = preset;
        this.color = color;
        this.icon = preset.icon[color];
        this.is_drag = false;
        this.drag_x = 0;
        this.drag_y = 0;
    }

    get_moves(){
        return this.preset.moves;
    }

    get_draw(){
        return function(ctx, x, y, sx, sy){
            ctx.fillStyle = this.color;
            let size = Math.min(sx, sy); 
            ctx.font = size + "px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(this.icon, x * sx + sx / 2, y * sy + sy / 2);
        }.bind(this);
    }
}