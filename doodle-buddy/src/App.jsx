
import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Send,
  Sparkles,
  MessageCircle,
  Trash2,
  Heart,
  Flower2,
  Stars,
  WandSparkles,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux"

import {
  createChat,
  setActiveChat,
  deleteChat,
  clearChat,
  sendMessage,
} from "./features/chat/chatSlice";

const suggestions = [
  {
    icon: Sparkles,
    title: "Spark an idea",
    description: "Help me brainstorm something creative",
    prompt: "Give me some fun creative project ideas!",
    color: "pink",
  },
  // {
  //   icon: WandSparkles,
  //   title: "Explain something",
  //   description: "Make a tricky topic easier to understand",
  //   prompt: "Explain React in a simple and fun way.",
  //   color: "purple",
  // },
  // {
  //   icon: Heart,
  //   title: "Write something cute",
  //   description: "Captions, messages, and little notes",
  //   prompt: "Help me write a cute birthday message.",
  //   color: "peach",
  // },
  {
    icon: Stars,
    title: "Plan my day",
    description: "Turn my messy thoughts into a plan",
    prompt: "Help me make a simple study plan for today.",
    color: "yellow",
  },
];

function RobotMascot({ small = false }) {
  return (
    <div
      className={`robot ${small ? "robot-small" : ""}`}
      aria-label="Doodle Buddy robot mascot"
      role="img"
    >
      <div className="robot-antenna">
        <span />
      </div>

      <div className="robot-head">
        <div className="robot-ear robot-ear-left" />
        <div className="robot-ear robot-ear-right" />

        <div className="robot-face">
          <span className="robot-eye" />
          <span className="robot-eye" />
          <span className="robot-cheek robot-cheek-left" />
          <span className="robot-cheek robot-cheek-right" />
          <span className="robot-mouth" />
        </div>
      </div>

      <div className="robot-neck" />

      <div className="robot-body">
        <span className="robot-heart">♥</span>
      </div>
    </div>
  );
}

function Sidebar({
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onClearChat,
  isOpen,
  onClose,
}) {
  return (
    <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-top">
        <div className="brand">
          <div className="brand-icon brand-robot-icon">
            <RobotMascot small />
          </div>

          <div>
            <h1>DOODLE BUDDY</h1>
            <p>AI CHATBOT</p>
          </div>
        </div>

        <button
          className="icon-button sidebar-close"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <PanelLeftClose size={19} />
        </button>
      </div>

      <button className="new-chat-button" onClick={onNewChat}>
        <Plus size={19} strokeWidth={2.5} />
        <span>New conversation</span>
        <span className="new-chat-star">✳</span>
      </button>

      <div className="history-heading">
        <span>YOUR LITTLE CORNER</span>
        <span className="history-sparkle">✦</span>
      </div>

      <div className="chat-history">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`history-item ${
              chat.id === activeChatId ? "history-item-active" : ""
            }`}
          >
            <button
              className="history-select"
              onClick={() => onSelectChat(chat.id)}
              title={chat.title}
            >
              <MessageCircle size={16} />
              <span>{chat.title}</span>
            </button>

            <button
              className="history-delete"
              onClick={() => onDeleteChat(chat.id)}
              aria-label={`Delete ${chat.title}`}
              title="Delete conversation"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-footer">
          <div className="avatar developer-avatar">R</div>

          <div className="footer-user">
            <strong>Developer: Rutaba Waseem</strong>
            <span>Built with creativity </span>
          </div>

          <Heart size={17} className="footer-heart" />
        </div>
      </div>
    </aside>
  );
}

function WelcomeScreen({ onSuggestionClick }) {
  return (
    <div className="welcome-screen">
      {}
      <div className="welcome-greeting">
        {/* <span className="eyebrow">
          <Sparkles size={14} />
          HI, FRIENDS!
          <Sparkles size={14} />
        </span> */}
      </div>

      {}
      <div className="welcome-art">
        
        <span className="art-sparkle sparkle-one">✦</span>
        <span className="art-sparkle sparkle-two">✧</span>
        <span className="art-heart">♡</span>  

        <span className="art-flower">
          <Flower2 size={31} />
        </span>

        <div className="robot-platform">
          <RobotMascot />
        </div>

        <span className="art-star">✳</span>
        <span className="art-tiny-heart">♥</span>
      </div>

      {}
      <div className="welcome-copy welcome-heading-copy">
        <h2>
          What are we
          
          <span> Doodling today?</span>
        </h2>

        <p>
          Big ideas, tiny questions, messy thoughts.
          
          There's room for all of them here.
        </p>
      </div>

      {}
      <div className="suggestions-grid">
        {suggestions.map((item) => {
          const Icon = item.icon;

          return (
            <button
              className={`suggestion-card suggestion-${item.color}`}
              key={item.title}
              onClick={() => onSuggestionClick(item.prompt)}
            >
              <span className="suggestion-icon">
                <Icon size={20} />
              </span>

              <span className="suggestion-text">
                <strong>{item.title}</strong>
                <span>{item.description}</span>
              </span>

              <span className="suggestion-arrow">↗</span>
            </button>
          );
        })}
      </div>

      <div className="welcome-footnote">
        <span>♡</span>
        a tiny space for your very big imagination
        <span>♡</span>
      </div>
    </div>
  );
}

function ChatMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`message-row ${
        isUser ? "message-user" : "message-assistant"
      }`}
    >
      {!isUser && (
        <div className="message-avatar">
          <RobotMascot small />
        </div>
      )}

      <div className="message-content">
        {!isUser && (
          <span className="message-name">Doodle Buddy ✿</span>
        )}

        <div className="message-bubble">
          <p>{message.text}</p>
        </div>
      </div>

      {isUser && <div className="user-avatar">you ♡</div>}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="message-row message-assistant">
      <div className="message-avatar">
        <RobotMascot small />
      </div>

      <div className="message-content">
        <span className="message-name">
          Doodle Buddy is doodling...
        </span>

        <div
          className="typing-bubble"
          aria-label="Buddy is thinking"
        >
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const dispatch = useDispatch();

  const { chats, activeChatId, isLoading } = useSelector(
    (state) => state.chat
  );

  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const activeChat = chats.find(
    (chat) => chat.id === activeChatId
  );

  const messages = activeChat?.messages ?? [];

 useEffect(() => {
  try {
    localStorage.setItem(
      "doodle-buddy-chats",
      JSON.stringify({ chats, activeChatId })
    );
  } catch (error) {
    console.error("Could not save chats:", error);
  }
}, [chats, activeChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  async function handleSend(text = input) {
    const cleanText = text.trim();

    if (!cleanText || isLoading || !activeChatId) return;

    setInput("");
    setSidebarOpen(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    await dispatch(
      sendMessage({
        chatId: activeChatId,
        text: cleanText,
      })
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    handleSend();
  }

  function handleInputChange(event) {
    setInput(event.target.value);

    const textarea = event.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      140
    )}px`;
  }

  function handleNewChat() {
    dispatch(createChat());
    setInput("");
    setSidebarOpen(false);
  }

  function handleDeleteChat(chatId) {
    dispatch(deleteChat(chatId));
    setInput("");
  }

  function handleClearChat() {
    if (!activeChatId || isLoading) return;

    dispatch(clearChat(activeChatId));
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <main className="app-shell">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={(id) => {
          dispatch(setActiveChat(id));
          setInput("");
          setSidebarOpen(false);
        }}
        onDeleteChat={handleDeleteChat}
        onClearChat={handleClearChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <section className="chat-panel">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button menu-button"
              onClick={() =>
                setSidebarOpen((open) => !open)
              }
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <PanelLeftClose size={20} />
              ) : (
                <PanelLeftOpen size={20} />
              )}
            </button>

            <div className="topbar-title">
              <span className="topbar-title-main">
                {messages.length > 0
                  ? activeChat?.title
                  : "A little room to think"}
              </span>

              <span className="topbar-subtitle">
                {/* your ideas are safe to bloom here */}
              </span>
            </div>
          </div>

          <div className="topbar-right">
            <span className="online-status">
              <span />
              {/* ready to doodle */}your ideas are safe to bloom here
            </span>

            {messages.length > 0 && (
              <button
                className="icon-button clear-button"
                onClick={handleClearChat}
                disabled={isLoading}
                aria-label="Clear conversation"
                title="Start this conversation over"
              >
                <RotateCcw size={17} />
              </button>
            )}
          </div>
        </header>

        <div className="chat-scroll-area">
          {messages.length === 0 ? (
            <WelcomeScreen
              onSuggestionClick={handleSend}
            />
          ) : (
            <div className="messages-container">
              <div className="conversation-date">
                <span />
                a little chat between us
                <span />
              </div>

              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                />
              ))}

              {isLoading && <TypingIndicator />}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <footer className="composer-area">
          <form
            className="composer"
            onSubmit={handleSubmit}
          >
            <div className="composer-decoration">✿</div>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your little thought here..."
              rows={1}
              aria-label="Write a message"
              disabled={isLoading}
            />

            <button
              type="submit"
              className="send-button"
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              title="Send message"
            >
              <Send size={19} />
            </button>
          </form>
        </footer>
      </section>
    </main>
  );
}
