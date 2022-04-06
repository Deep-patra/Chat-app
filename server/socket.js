const WebSocket = require('ws');
const { Server } = require('ws');
const types = {
  ADD_MESSAGE: "ADD_MESSAGE",
  SEARCH_ITEM: "SEARCH_ITEM",
  CHECK_USERNAME: "CHECK_USERNAME",
  ADD_GROUP_MESSAGE: "ADD_GROUP_MESSAGE",
  ERROR: "ERROR",
  REGISTER: "REGISTER",
};
const { 
  addMessage,
  addGroupMessage,
  getUsers,
  checkUsername,
} = require('./socketMethods');


function toJson(obj) {
  return JSON.stringify(obj);
}

/**
 * @class Client
 * @description stores the userId and the sockets
 */
class Client {
  static list = new Map();

  static addClient = (userId, socket) => {
    this.list.set(userId, socket);
  };

  static getClient = (userId) => {
    if (this.list.has(userId)) {
      return this.list.get(userId);
    } else {
      return null;
    }
  };

  static deleteClient = (socket) => {
    for (const key of this.list.keys()) {
      if (this.list[key] === socket) {
        this.list.delete(key);
      }
    }
  };
}

const processMessage = (ws, message) => {
  let data = null;
  try {
    data = JSON.parse(message);
  } catch (error) {
    // do something
    ws.send(JSON.stringify({ type: types.ERROR, message: "cannot parse Json" }));
  }

  if (data.type === undefined) return;
  switch (data.type) {

    case types.CHECK_USERNAME: {
      checkUsername(data)
      .then((result) => {
        if (typeof(result) !== Boolean) Boolean(result);
        
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(toJson({ type: types.CHECK_USERNAME, exists: result }));
        }
      })
      .catch(error => {
        console.log(error);
        ws.send(toJson({ type: types.ERROR, message: error }));
      });
      break;
    }
    case types.SEARCH_ITEM: {
      // get users 
      getUsers(data)
      .then((results) => {
        if (results === undefined || results.length === 0) results = [];
        
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(toJson({ type: types.SEARCH_ITEM, results }));
        }

      })
      .catch(error => {
        ws.send(toJson({ type: types.ERROR, message: error }));
      });
      break;
    }
    case types.ADD_MESSAGE: {
      if (data.sender !== undefined && Client.list[data.sender] === undefined) Client.addClient(data.sender, ws);
      // storing the message and sending it to the reciever
      // console.log('recieved');
      addMessage(data)
      .then((reciever) => {
        const socket = Client.getClient(reciever);
        // if the socket is open, send the message
        if (socket !== ( null || undefined ) && socket.readyState === WebSocket.OPEN) {
          socket.send(toJson(data));
        }
      })
      .catch(err => {
        console.log(err);
        ws.send(toJson({ type: types.ERROR, message: err }));
      });
      break;
    }
    case types.ADD_GROUP_MESSAGE: {
      if (data.sender !== undefined && Client.list[data.sender] === undefined) Client.addClient(data.sender, ws);
      // console.log(data);
      addGroupMessage(data)
      .then((members) => {
        // console.log(members);
        // sending the message to every group member
        members.forEach((member) => {
          const { friendId } = member;
          const socket = Client.getClient(friendId);

          if (socket !== ( null || undefined) && socket !== ws && socket.readyState === WebSocket.OPEN) {
            socket.send(toJson(data));
          }
        });
      })
      .catch(err => {
        ws.send(toJson({ type: types.ERROR, message: err }));
      });
      break;
    }

    case types.REGISTER: {
      const { userId } = data;
      // console.log('recieved ', data);
      if (userId === undefined) break;
      if (Client.list[userId] === undefined) Client.addClient(userId, ws);
      break;
    }

    default: {
      ws.send(JSON.stringify({ type: types.ERROR, message: "unknown type" }));
      break;
    }
  }
};


const InitializeServer = (server) => {

  const wss = new Server({ server })

  wss.on('connection', (ws, req) => {
    // console.log(req.socket.remoteAddress);

    ws.on('message', (data) => {
      // process the messsage recieved on websocket
      processMessage(ws, data);
    });

    // remove the socket, when the socket is closed
    ws.on('close', () => {
      // console.log('Socket is closed !');
    });

    ws.on('error', (error) => {
      if (error) {
        console.log('Error: ', error);
      }
    });
  });

};


module.exports = InitializeServer;