const express = require('express');
const { Server } = require('socket.io');

// HEROKU
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
         socketId,
         isInChat: true,
      });
   } else {
      connectToChat(userId, socketId)
   }
}

const removeUser = (socketId) => {
   users = users.filter(user => user.socketId !== socketId);
}

// Actualiza el socket del usuario, como entro en el chat
// tiene un nuevo socketId
const connectToChat = (userId, socketId ) => {
   users = users.map(user => {
      if(user.userId === userId) {
         return {
            ...user,
            isInChat: true,
            socketId
         }
      }

      return user;
   })
}

// Esta funcion toma el userId y como solo salio del chat, no elimina el socket
// solo indica que ya no esta en el chat
const disconnectFromChat = (userId) => {
   users = users.map(user => {
      if(user.userId === userId) {
         return {
            ...user,
            isInChat: false
         }
      }

      return user;
   })

}

const getUser = (userId) => {
   return users.find(user => user.userId === userId);
}


io.on('connection', (socket) => {
   // Conexion
   console.log('User connected');


   // Agregar usuario
   socket.on("addUser", (userId) => {
      addUser(userId, socket.id);
      console.log(users)
      
      
      io.emit("getUsers", users);


   });

   // Disconnect
   socket.on("disconnect", (userId) => {
      console.log("A user disconected");
      removeUser(socket.id);
      console.log(users)

   })


   socket.on("disconnectFromChat", ({ userId }) => {
      disconnectFromChat(userId)
   })

   // Send and get message
   socket.on("sendMessage", ({ senderId, receiverId, text }) => {
      const user = getUser(receiverId);
      
      if(user && user.isInChat) {
         console.log("Mande mensaje a: ", user)
         io.to(user.socketId).emit("getMessage", {
            senderId,
            text
         });
      }
      
   })






   // Mandar
   io.emit("welcome", "hello, this is socket server");
});



