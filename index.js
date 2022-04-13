const express = require('express');
const { Server } = require('socket.io');


// SERVIDOR EXPRESS
const PORT = process.env.PORT || 3007;

const server = express()
   .listen(PORT, () => console.log(`Escuchando en ${PORT}`))




// SOCKETS
const io = new Server(server, {
   cors: {
      origin: '*'
   }
});


let users = [];


const addUser = (userId, socketId) => {

   const alreadyExist = users.some(user => user.userId === userId);

   if(!alreadyExist) {
      users.push({
         userId,
         socketId
      });
   }
}

const removeUser = (socketId) => {
   users = users.filter(user => user.socketId !== socketId);
}


const getUser = (userId) => {
   return users.find(user => user.userId === userId);
}


io.on('connection', (socket) => {
   // Conexion
   console.log('User connected');
   console.log(users)


   // Agregar usuario
   socket.on("addUser", (userId) => {
      addUser(userId, socket.id);
      io.emit("getUsers", users);
   });

   // Disconnect
   socket.on("disconnect", (userId) => {
      console.log("A user disconected");
      removeUser(socket.id)
   })

   // Send and get message
   socket.on("sendMessage", ({ senderId, receiverId, text }) => {
      const user = getUser(receiverId);

      if(user) {
         console.log("emit")
         io.to(user.socketId).emit("getMessage", {
            senderId,
            text
         });
      }
      
   })






   // Mandar
   io.emit("welcome", "hello, this is socket server");
});



