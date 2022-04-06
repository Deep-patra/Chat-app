import store from '../../store/store';
import {
  recievedMessage,
  recievedGroupMessage,
  changeSearchResult,
} from '../../store/actionMethods';


const socketTypes = {
  ADD_MESSAGE: "ADD_MESSAGE",
  SEARCH_ITEM: "SEARCH_ITEM",
  CHECK_USERNAME: "CHECK_USERNAME",
  ADD_GROUP_MESSAGE: "ADD_GROUP_MESSAGE",
  REGISTER: "REGISTER",
};


/**
 * @class StartWorker
 * @description sends the message and dispatches the recieved message to the redux store
 * 
 * 
 * Initialize the dispatch object by using the constructor
 * new StartWorker(dispatch)
 * 
 * Start the worker by calling the startConnection
 * StartWorker.setupConnection() : Promise<void>
 * returns a promise which resolves when the websocket is connected
 */
class StartWorker {
  static sender = null;
  static ws = null;

  static setupConnection = (changeLoadingStatus) => {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket('ws://127.0.0.1:5000');

      this.ws.onopen = () => {
        // setup the event listener on message event
        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } 
          catch(error) {
            console.log(error);
          }
        }
        // change the loading status
        changeLoadingStatus();
        resolve();
      };

      this.ws.onerror = (error) => {
        reject(error);
      };
    });
  };


  static postMessage = (message) => {
    try {
      this.ws.send(JSON.stringify(message));
    } catch(err) {console.log(err)}
  };

  static handleCheckUsername = (username) => {
    const { CHECK_USERNAME } = socketTypes;
    this.postMessage({ type: CHECK_USERNAME, username });
  };

  static handleAddMessage = (friendId, text = '', images = [], time = new Date().toLocaleTimeString()) => {
    const { ADD_MESSAGE } = socketTypes;
    this.postMessage({
      type: ADD_MESSAGE,
      sender: this.sender,
      reciever: friendId,
      text,
      images,
      time,
    });
  };

  static handleSearchItem = (searchText) => {
    const { SEARCH_ITEM } = socketTypes;
    this.postMessage({ type: SEARCH_ITEM, username: searchText });
  };

  static handleAddGroupMessage = (groupId, text = '', images = [], time = new Date().toLocaleTimeString()) => {
    const { ADD_GROUP_MESSAGE } = socketTypes;
    this.postMessage({
      type: ADD_GROUP_MESSAGE,
      sender: this.sender,
      reciever: groupId,
      text,
      images,
      time,
    });
  };

  static handleRegister = (userId) => {

    // set the sender to userId
    this.sender = userId;

    const { REGISTER } = socketTypes;
    this.postMessage({
      type: REGISTER,
      userId: userId,
    });
  };

  static checkUsername = (result) => {
    store.dispatch({ type: "CHANGE_USERNAME_EXISTS", result });
  };

  static addMessage = (friendId, message) => {
    store.dispatch(recievedMessage(friendId, message));
  };

  static addGroupMessage = (groupId, message) => {
    store.dispatch(recievedGroupMessage(groupId, message));
  };

  static getSearchItem = (searchResult) => {
    store.dispatch(changeSearchResult(searchResult));
  };

  static handleMessage = (message) => {
    const { type } = message;
    const { CHECK_USERNAME, ADD_MESSAGE, SEARCH_ITEM, ADD_GROUP_MESSAGE } = socketTypes;
    if (type === undefined) throw new Error ("Action recieved has no type property!");
    switch(type) {
      case CHECK_USERNAME: {
        const { result } = message;
        this.checkUsername(result);
        break;
      }
      case ADD_MESSAGE: {
        const { sender } = message;
        const msg = {
          authorId: sender,
          text: message.text || '',
          images: message.images || [],
          time: message.time || new Date().toLocaleTimeString(),
        };
        this.addMessage(sender, msg);
        break;
      }
      case SEARCH_ITEM: {
        const { results } = message;
        this.getSearchItem(results);
        break;
      }
      case ADD_GROUP_MESSAGE: {
        const { sender, reciever } = message;
        const msg = {
          authorId: sender,
          text: message.text || '',
          images: message.images || [],
          time: message.time || new Date().toLocaleTimeString(),
        };
        this.addGroupMessage(reciever, msg);
        break;
      }
      default: break;
    }
  };
  
}

export default StartWorker;