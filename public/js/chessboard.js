
const socket =  io()
const chess = new Chess()
// socket.emit("churan")
// socket.on("churan papidi",
//     function(){
//         console.log("churan papidi")
//     }
// )
let playerRole = null;

let sourceSquare = null;

let dragpiece = null;
const boardElement = document.querySelector(".board")
const getPieceUnicodes=function (x){
    const unicodepieces ={
    p:"♟",
    r:"♜",
    n:"♞",
    b:"♝",
    q:"♛",
    k:"♚",
    P:"♙",
    R:"♖",
    N:"♘",
    B:"♗",
    Q:"♕",
    K:"♔"
    
} 

return unicodepieces[x];
}

const renderboard = function(){
    const board = chess.board()
     boardElement.innerHTML = ""
    console.log(board)
    board.forEach((row,rowindex)=>{
        row.forEach((square,squareindex)=>{
            console.log(square,squareindex)
            const squareElement = document.createElement("div")
            squareElement.classList.add("square",
              (rowindex+squareindex)%2==0?"light":"dark" 
            )
           squareElement.dataset.row=rowindex
           squareElement.dataset.col=squareindex
           if(square){
            const pieceElement = document.createElement("div")
            pieceElement.classList.add("piece",
             square.color ==="w"?"white":"black"   
            )
            console.log(square.type)
            pieceElement.innerText=getPieceUnicodes(square.type);
            pieceElement.draggable = playerRole===square.color;
            pieceElement.addEventListener("dragstart",(e)=>{
               if(pieceElement.draggable){
                dragpiece = pieceElement; 
                sourceSquare = {row :rowindex, col:squareindex};  
                e.dataTransfer.setData("text/plain",""); 
            }
            }) ;
            pieceElement.addEventListener("dragend",(e)=>{
                dragpiece=null;
                sourceSquare = null;
            })
            squareElement.appendChild(pieceElement);
           } 
           squareElement.addEventListener("dragover",(e)=>{
            e.preventDefault();
           })
           squareElement.addEventListener("drop",(e)=>{
              e.preventDefault();
              if(dragpiece){
                const targetSource = {
                    row : parseInt(squareElement.dataset.row),
                    col : parseInt(squareElement.dataset.col)
                }
                handlemove(sourceSquare,targetSource);
              }
           })
           boardElement.appendChild(squareElement)
        })
        
    })
    
}

const handlemove = function(sourceSquare,targetSquare){
    const move = {
        from : `${String.fromCharCode(97+sourceSquare.col)}${8-sourceSquare.row}`,
        to : `${String.fromCharCode(97+targetSquare.col)}${8-targetSquare.row}`,    
        promotion :"q"
    }
    socket.emit("move",move)
}

socket.on("playerrole",function(role){
    
    playerRole = role
    console.log(role)
    renderboard()
})
// socket.on("playerrole",function(role){
//     console.log("black")
//     playerRole = role
//     renderboard()
// })
socket.on("playerrolespectator",function(){
    playerRole=null
    renderboard()  
})
socket.on("boardstate",function(fen){
  chess.load(fen);
  renderboard();
})

socket.on("move",function(move){
    chess.move(move);
    renderboard();
})
