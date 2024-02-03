import { IoAdapter } from "@nestjs/platform-socket.io";
import { ServerOptions } from "socket.io";

export class SocketAdapter extends IoAdapter {
    createIOServer(
      port: number,
      options?: ServerOptions & {
        namespace?: string;
        server?: any;
      },
    ) {
      const server = super.createIOServer(port, {
        ...options,
        cors: {
          origin: [`${process.env.BACKEND_URL}`, `${process.env.FRONTEND_URL}`, "http://[::1]:3000"],
          methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
          allowedHeaders: ['Content-Type', 'Authorization'],
          credentials: true,
        },
      allowUpgrades: true,
      allowEIO3: true,
      });
      return server;
    }
}
