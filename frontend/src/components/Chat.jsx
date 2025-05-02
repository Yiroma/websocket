import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const Chat = () => {
  const [messageList, setMessageList] = useState([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [nickName, setNickName] = useState("");
  const [socket, setSocket] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const ENDPOINT = import.meta.env.VITE_BACKEND_URL || "http://localhost:5050";

  // OnMount
  useEffect(() => {
    const socket = io(ENDPOINT);

    setSocket(socket);

    socket.on("connect", () => {
      setCurrentUser(socket.id);
    });

    return () => {
      socket.emit("disconnectUser", socket.id);
      socket.off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // OnUpdate
  useEffect(() => {
    if (socket) {
      socket.on("newMessage", (message) => {
        setMessageList([...messageList, message]);
      });
    }
  }, [messageList, socket]);

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit("sendMessage", {
      author: nickName,
      text: newMessageText,
      id: currentUser,
    });
    setNewMessageText("");
  };

  return (
    <>
      <h2>Messages</h2>

      <div className="container">
        {messageList.map((message, id) => {
          return (
            <p key={id} className={message.id === currentUser ? "my-message" : "message"}>
              <strong>{message.author}</strong>: {message.text}
            </p>
          );
        })}
      </div>
      <form onSubmit={handleSubmit}>
        <h2>New Message</h2>
        <input
          type="text"
          name="author"
          placeholder="Ton pseudo"
          value={nickName}
          required
          onChange={(e) => setNickName(e.target.value)}
        />
        <input
          type="text"
          name="messageContent"
          placeholder="Ton message"
          value={newMessageText}
          required
          onChange={(e) => setNewMessageText(e.target.value)}
        />
        <input type="submit" value="Envoyer" />
      </form>
    </>
  );
};

export default Chat;
