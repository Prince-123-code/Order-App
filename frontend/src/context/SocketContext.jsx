import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
    const socketRef = useRef(null);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const s = io("https://order-app-utuk.onrender.com", {
            transports: ["websocket"],
            autoConnect: true,
        });

        s.on("connect", () => {
            console.log("[Socket] Connected:", s.id);
        });

        s.on("disconnect", () => {
            console.log("[Socket] Disconnected");
        });

        socketRef.current = s;
        setSocket(s);

        return () => {
            s.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}
