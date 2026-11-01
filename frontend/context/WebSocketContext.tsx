import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
// TODO: Pusher requires Expo development build - temporarily disabled
// import { Pusher, PusherEvent } from '@pusher/pusher-websocket-react-native';
import { useAuth } from './AuthContext';
import { Alert } from 'react-native';

interface SystemAlert {
    id: number;
    type: 'critical' | 'warning' | 'info';
    title: string;
    message: string;
    severity: number;
    is_resolved: boolean;
    resolved_at: string | null;
    resolved_by: number | null;
    created_at: string;
    resolver?: {
        id: number;
        surname: string;
        first_name: string;
    };
}

interface WebSocketContextType {
    isConnected: boolean;
    latestAlert: SystemAlert | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [latestAlert, setLatestAlert] = useState<SystemAlert | null>(null);

    useEffect(() => {
        // TODO: Re-enable when Pusher is properly configured with Expo development build
        // For now, WebSocket features are disabled

        /* Original Pusher implementation - commented out
        if (!user || user.role !== 'admin') {
            return;
        }

        const pusher = Pusher.getInstance();
        const initializePusher = async () => {
            try {
                await pusher.init({
                    apiKey: "1fb2f9e6e900334bbad8",
                    cluster: "mt1"
                });

                await pusher.connect();
                setIsConnected(true);
                console.log('✅ WebSocket connected');

                await pusher.subscribe({
                    channelName: "system-alerts",
                    onEvent: (event: PusherEvent) => {
                        if (event.eventName === 'alert.created') {
                            const alertData = JSON.parse(event.data) as SystemAlert;
                            console.log('🔔 New alert received:', alertData);
                            setLatestAlert(alertData);

                            const emoji = alertData.type === 'critical' ? '🚨' :
                                alertData.type === 'warning' ? '⚠️' : 'ℹ️';

                            Alert.alert(
                                `${emoji} ${alertData.type.toUpperCase()}`,
                                alertData.title,
                                [
                                    { text: 'Dismiss', style: 'cancel' },
                                    {
                                        text: 'View', onPress: () => {
                                            console.log('Navigate to alert:', alertData.id);
                                        }
                                    }
                                ]
                            );
                        }
                    }
                });

            } catch (error) {
                console.error('❌ WebSocket connection failed:', error);
                setIsConnected(false);
            }
        };

        initializePusher();

        return () => {
            pusher.unsubscribe({ channelName: "system-alerts" });
            pusher.disconnect();
            setIsConnected(false);
        };
        */
    }, [user]);

    return (
        <WebSocketContext.Provider value={{ isConnected, latestAlert }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within WebSocketProvider');
    }
    return context;
};
