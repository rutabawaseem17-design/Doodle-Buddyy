
import { createSlice, createAsyncThunk, nanoid } from "@reduxjs/toolkit";

const STORAGE_KEY = "doodle-buddy-chats";

function loadChats() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const data = JSON.parse(saved);

      if (Array.isArray(data.chats) && data.chats.length > 0) {
        return data;
      }
    }
  } catch (error) {
    console.error("Failed to load saved chats:", error);
  }

  const firstChat = {
    id: nanoid(),
    title: "My first doodle",
    messages: [],
    createdAt: Date.now(),
  };

  return {
    chats: [firstChat],
    activeChatId: firstChat.id,
  };
}

const initialState = {
  ...loadChats(),
  isLoading: false,
};

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ chatId }, { getState, rejectWithValue }) => {
    try {
      const chat = getState().chat.chats.find(
        (item) => item.id === chatId
      );

      if (!chat) {
        return rejectWithValue(
          "This conversation could not be found."
        );
      }

      const contents = chat.messages
        .filter(
          (message) =>
            (message.role === "user" ||
              message.role === "assistant") &&
            message.text?.trim()
        )
        .map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.text }],
        }));

      const apiResponse = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contents }),
      });

      let data;

      try {
        data = await apiResponse.json();
      } catch {
        throw new Error(
          "The server returned an invalid response. Please try again."
        );
      }

      if (!apiResponse.ok) {
        throw new Error(
          data.error || "Unable to get a response from Gemini."
        );
      }

      const reply = data.reply?.trim();

      if (!reply) {
        return rejectWithValue(
          "Gemini didn't return a text response. Please try again."
        );
      }

      return {
        chatId,
        id: nanoid(),
        text: reply,
        createdAt: Date.now(),
      };
    } catch (error) {
      console.error("Doodle Buddy API error:", error);

      return rejectWithValue(
        error?.message ||
          "Something went wrong while contacting Gemini. Please try again."
      );
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,

  reducers: {
    createChat: (state) => {
      const chat = {
        id: nanoid(),
        title: "New doodle",
        messages: [],
        createdAt: Date.now(),
      };

      state.chats.unshift(chat);
      state.activeChatId = chat.id;
    },

    setActiveChat: (state, action) => {
      state.activeChatId = action.payload;
    },

    deleteChat: (state, action) => {
      state.chats = state.chats.filter(
        (chat) => chat.id !== action.payload
      );

      if (state.activeChatId === action.payload) {
        state.activeChatId = state.chats[0]?.id ?? null;
      }

      if (state.chats.length === 0) {
        const chat = {
          id: nanoid(),
          title: "My first doodle",
          messages: [],
          createdAt: Date.now(),
        };

        state.chats.push(chat);
        state.activeChatId = chat.id;
      }
    },

    clearChat: (state, action) => {
      const chat = state.chats.find(
        (item) => item.id === action.payload
      );

      if (chat) {
        chat.messages = [];
        chat.title = "New doodle";
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state, action) => {
        const { chatId, text } = action.meta.arg;

        const chat = state.chats.find(
          (item) => item.id === chatId
        );

        if (!chat) return;

        chat.messages.push({
          id: nanoid(),
          role: "user",
          text,
          createdAt: Date.now(),
        });

        if (
          chat.title === "New doodle" ||
          chat.title === "My first doodle"
        ) {
          chat.title =
            text.length > 28
              ? `${text.slice(0, 28)}…`
              : text;
        }

        state.isLoading = true;
      })

      .addCase(sendMessage.fulfilled, (state, action) => {
        const chat = state.chats.find(
          (item) => item.id === action.payload.chatId
        );

        if (chat) {
          chat.messages.push({
            id: action.payload.id,
            role: "assistant",
            text: action.payload.text,
            createdAt: action.payload.createdAt,
          });
        }

        state.isLoading = false;
      })

      .addCase(sendMessage.rejected, (state, action) => {
        const { chatId } = action.meta.arg;

        const chat = state.chats.find(
          (item) => item.id === chatId
        );

        if (chat) {
          chat.messages.push({
            id: nanoid(),
            role: "assistant",
            text:
              action.payload ||
              "Oops! Something went wrong. Please try again.",
            createdAt: Date.now(),
          });
        }

        state.isLoading = false;
      });
  },
});

export const {
  createChat,
  setActiveChat,
  deleteChat,
  clearChat,
} = chatSlice.actions;

export default chatSlice.reducer;
