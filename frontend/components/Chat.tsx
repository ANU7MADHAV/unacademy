import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Room,
  RoomEvent,
  LocalParticipant,
  RemoteParticipant,
  DataPacket_Kind,
} from "livekit-client";
import { Message } from "postcss";

interface ChatProps {
  room: Room;
  participant: LocalParticipant;
}

interface ChatMessage extends Message {
  id: string;
  type: string;
  user_id: string;
  content: string;
  created_at: string;
  isSystem?: boolean;
  status?: "sending" | "sent" | "error";
}

const MAX_MESSAGE_LENGTH = 1000;
const MAX_MESSAGES = 100;

const LiveKitChat: React.FC<ChatProps> = ({ room, participant }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      const chatContainer = chatContainerRef.current;
      const isScrolledToBottom =
        chatContainer &&
        chatContainer.scrollHeight - chatContainer.scrollTop ===
          chatContainer.clientHeight;

      if (isScrolledToBottom) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  const handleData = useCallback(
    (
      payload: Uint8Array,
      sender?: RemoteParticipant,
      kind?: DataPacket_Kind,
      topic?: string
    ) => {
      try {
        const decodedMessage = JSON.parse(new TextDecoder().decode(payload));

        if (decodedMessage.type === "typing") {
          // Handle typing indicator
          return;
        }

        setMessages((prev) => {
          const newMessages = [
            ...prev,
            {
              ...decodedMessage,
              status: "sent",
            },
          ].slice(-MAX_MESSAGES);
          return newMessages;
        });
      } catch (error) {
        console.error("Error handling message:", error);
        setError("Failed to process incoming message");
      }
    },
    []
  );

  useEffect(() => {
    room.on(RoomEvent.DataReceived, handleData);

    // Add system message when participant joins
    const systemMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: "system",
      user_id: "system",
      content: `${participant.identity} joined the chat`,
      created_at: new Date().toISOString(),
      isSystem: true,
    };
    setMessages((prev) => [...prev, systemMessage]);

    return () => {
      room.off(RoomEvent.DataReceived, handleData);
    };
  }, [room, handleData, participant.identity]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      try {
        room.localParticipant.publishData(
          new TextEncoder().encode(
            JSON.stringify({ type: "typing", user: participant.identity })
          ),
          { reliable: true }
        );
      } catch (error) {
        console.error("Error sending typing indicator:", error);
      }
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  }, [isTyping, room.localParticipant, participant.identity]);

  const sendMessage = useCallback(async () => {
    if (!inputMessage.trim()) return;
    if (inputMessage.length > MAX_MESSAGE_LENGTH) {
      setError(
        `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters`
      );
      return;
    }

    const messageData: ChatMessage = {
      id: crypto.randomUUID(),
      type: "chat",
      user_id: participant.identity,
      content: inputMessage.trim(),
      created_at: new Date().toISOString(),
      status: "sending",
    };

    try {
      setMessages((prev) => [...prev, messageData]);
      await room.localParticipant.publishData(
        new TextEncoder().encode(JSON.stringify(messageData)),
        { reliable: true }
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageData.id ? { ...msg, status: "sent" } : msg
        )
      );
      setInputMessage("");
      setError(null);
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageData.id ? { ...msg, status: "error" } : msg
        )
      );
    }
  }, [inputMessage, room.localParticipant, participant.identity]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-50vh)] w-full max-w-md border rounded-lg bg-white shadow-lg">
      <div className="bg-gray-100 p-4 border-b">
        <h2 className="text-lg font-semibold">Chat Room</h2>
        <p className="text-sm text-gray-600">{participant.identity}</p>
      </div>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${
              message.isSystem
                ? "items-center"
                : message.user_id === participant.identity
                ? "items-end"
                : "items-start"
            }`}
          >
            {message.isSystem ? (
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {message.content}
              </div>
            ) : (
              <div
                className={`px-4 py-2 rounded-lg max-w-xs ${
                  message.user_id === participant.identity
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                <div className="text-sm font-semibold">{message.user_id}</div>
                <div className="break-words">{message.content}</div>
                <div className="flex items-center justify-between text-xs opacity-75">
                  <span>
                    {new Date(message.created_at).toLocaleTimeString()}
                  </span>
                  {message.user_id === participant.identity && (
                    <span className="ml-2">
                      {message.status === "sending" && "⋯"}
                      {message.status === "sent" && "✓"}
                      {message.status === "error" && "⚠"}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="px-4 py-2 bg-red-100 text-red-600 text-sm">{error}</div>
      )}

      <div className="border-t p-4">
        <div className="flex flex-col space-y-2">
          <textarea
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-lg resize-none h-20"
            maxLength={MAX_MESSAGE_LENGTH}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {inputMessage.length}/{MAX_MESSAGE_LENGTH}
            </span>
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveKitChat;
