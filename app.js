const express = require('express')
const socket = require('socket.io')
const http = require('http')
const {Chess} = require('chess.js')
const path = require("path")
const app = express()

app.use(express.static(path.join(__dirname,"public")))
app.set("view engine","ejs")
const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();
let players = {};



io.on("connection",function(uniquesocket){
  let  currentPlayer = "w";
    console.log("connected");
    // uniquesocket.on("churan",function(){
    //    io.emit("churan papidi")
    // })
    // uniquesocket.on("disconnect",function(){
    //     console.log("disconnected")
    // })
    if(!players.white){
    players.white =  uniquesocket.id
    uniquesocket.emit("playerrole", "w")
}
else if(!players.black){
    players.black = uniquesocket.id
     uniquesocket.emit("playerrole","b")
}
else{
    uniquesocket.emit("playerrolespectator")
}
uniquesocket.on("move",(move)=>{
  try{
    if(chess.turn()=="w" && uniquesocket.id!=players.white) return;
   if(chess.turn()=="b" && uniquesocket.id!=players.black) return; 
   const result = chess.move(move);
   if(result){
    currentPlayer = chess.turn();
    // io.emit("move",move);
    io.emit("boardstate",chess.fen())
   }
   else{
    uniquesocket.emit("invalid move",move);
   }
}
catch(err){
    console.log(err)
    uniquesocket.emit("invalid move",move);
}
})  

uniquesocket.on("disconnect",function(){
    if(uniquesocket.id == players.white){
    delete players.white
  }
  else if(uniquesocket.id == players.black){
    delete players.black
  }
}
)})
  
app.get("/",(req,res)=>{
    res.render("index.ejs")

})

server.listen(3000,()=>{
    console.log("App started")
})