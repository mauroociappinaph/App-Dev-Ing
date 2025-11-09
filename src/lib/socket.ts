import { Server } from "socket.io";

// Connection tracking for rate limiting
const connectionStore = new Map<
  string,
  { connections: number; lastConnection: number }
>();
const MAX_CONNECTIONS_PER_IP = 5;
const CONNECTION_WINDOW = 60 * 1000; // 1 minute

// Message rate limiting
const messageRateLimit = new Map<
  string,
  { count: number; resetTime: number }
>();
const MESSAGE_RATE_LIMIT = 10; // 10 messages per minute
const MESSAGE_WINDOW = 60 * 1000;

function validateMessage(msg: any): { isValid: boolean; error?: string } {
  if (!msg || typeof msg !== "object") {
    return { isValid: false, error: "Invalid message format" };
  }

  const { text, senderId } = msg;

  if (!text || typeof text !== "string") {
    return { isValid: false, error: "Message text is required" };
  }

  if (text.length > 500) {
    return { isValid: false, error: "Message too long (max 500 characters)" };
  }

  if (text.trim().length === 0) {
    return { isValid: false, error: "Message cannot be empty" };
  }

  // Basic content filtering
  const forbiddenWords = ["hack", "exploit", "malware", "virus", "attack"];
  const lowerText = text.toLowerCase();
  if (forbiddenWords.some((word) => lowerText.includes(word))) {
    return { isValid: false, error: "Message contains forbidden content" };
  }

  if (!senderId || typeof senderId !== "string") {
    return { isValid: false, error: "Valid sender ID is required" };
  }

  return { isValid: true };
}

function checkConnectionLimit(ip: string): boolean {
  const now = Date.now();
  const connectionData = connectionStore.get(ip);

  if (
    !connectionData ||
    now > connectionData.lastConnection + CONNECTION_WINDOW
  ) {
    connectionStore.set(ip, { connections: 1, lastConnection: now });
    return true;
  }

  if (connectionData.connections >= MAX_CONNECTIONS_PER_IP) {
    return false;
  }

  connectionData.connections++;
  return true;
}

function checkMessageRateLimit(socketId: string): boolean {
  const now = Date.now();
  const rateData = messageRateLimit.get(socketId);

  if (!rateData || now > rateData.resetTime) {
    messageRateLimit.set(socketId, {
      count: 1,
      resetTime: now + MESSAGE_WINDOW,
    });
    return true;
  }

  if (rateData.count >= MESSAGE_RATE_LIMIT) {
    return false;
  }

  rateData.count++;
  return true;
}

export const setupSocket = (io: Server) => {
  io.on("connection", (socket) => {
    // Get client IP for rate limiting
    const clientIp = socket.handshake.address || "unknown";

    // Check connection limits
    if (!checkConnectionLimit(clientIp)) {
      socket.emit("error", { message: "Connection limit exceeded" });
      socket.disconnect(true);
      return;
    }

    console.log("Client connected:", socket.id, "from IP:", clientIp);

    // Handle messages with validation and rate limiting
    socket.on("message", (msg: { text: string; senderId: string }) => {
      try {
        // Validate message
        const validation = validateMessage(msg);
        if (!validation.isValid) {
          socket.emit("error", { message: validation.error });
          return;
        }

        // Check message rate limit
        if (!checkMessageRateLimit(socket.id)) {
          socket.emit("error", {
            message: "Message rate limit exceeded. Please slow down.",
          });
          return;
        }

        // Echo: send message back only to the sender
        socket.emit("message", {
          text: `Echo: ${msg.text}`,
          senderId: "system",
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Message handling error:", error);
        socket.emit("error", { message: "Internal server error" });
      }
    });

    // Handle disconnect
    socket.on("disconnect", (reason) => {
      console.log("Client disconnected:", socket.id, "Reason:", reason);

      // Clean up rate limiting data
      messageRateLimit.delete(socket.id);
    });

    // Handle connection errors
    socket.on("error", (error) => {
      console.error("Socket error for client:", socket.id, error);
    });

    // Send welcome message
    socket.emit("message", {
      text: "Welcome to TechEnglish WebSocket Server!",
      senderId: "system",
      timestamp: new Date().toISOString(),
    });
  });

  // Clean up old connection data periodically
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of connectionStore.entries()) {
      if (now > data.lastConnection + CONNECTION_WINDOW) {
        connectionStore.delete(ip);
      }
    }

    for (const [socketId, data] of messageRateLimit.entries()) {
      if (now > data.resetTime) {
        messageRateLimit.delete(socketId);
      }
    }
  }, 60000); // Clean up every minute
};
