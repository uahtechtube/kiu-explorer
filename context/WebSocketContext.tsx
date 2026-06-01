import React, { createContext, useContext, useEffect, useState } from 'react';
import Pusher from 'pusher-js';
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
    pusherClient: Pusher | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [latestAlert, setLatestAlert] = useState<SystemAlert | null>(null);
    const [pusherClient, setPusherClient] = useState<Pusher | null>(null);

    useEffect(() => {
        if (!user) {
            // Disconnect if user logs out
            if (pusherClient) {
                pusherClient.disconnect();
                setPusherClient(null);
                setIsConnected(false);
            }
            return;
        }

        // Resolve pusher-js constructor based on bundler format
        console.log('🔍 Debug Pusher Import:', {
            Pusher,
            typeofPusher: typeof Pusher,
            defaultExport: Pusher ? (Pusher as any).default : null,
            namedPusher: Pusher ? (Pusher as any).Pusher : null
        });

        const PusherClass = 
            typeof Pusher === 'function' ? Pusher : 
            (Pusher && (Pusher as any).default) ? (Pusher as any).default : 
            (Pusher && (Pusher as any).Pusher) ? (Pusher as any).Pusher : 
            null;

        if (!PusherClass) {
            console.error('❌ Error: Pusher class could not be resolved from import. Available properties:', Object.keys(Pusher || {}));
            return;
        }

        // Initialize Pusher in pure JS mode - runs natively inside Expo Go
        const pusher = new PusherClass('1fb2f9e6e900334bbad8', {
            cluster: 'mt1',
            forceTLS: true,
        });

        pusher.connection.bind('state_change', (states: any) => {
            console.log('🔄 WebSocket State changed from', states.previous, 'to', states.current);
            setIsConnected(states.current === 'connected');
        });

        pusher.connection.bind('connected', () => {
            console.log('✅ WebSocket Connected via Pusher-JS');
            setIsConnected(true);
        });

        pusher.connection.bind('disconnected', () => {
            console.log('❌ WebSocket Disconnected');
            setIsConnected(false);
        });

        pusher.connection.bind('error', (err: any) => {
            console.warn('⚠️ WebSocket connection warning (Pusher is attempting connection/retry):', err);
        });

        // Subscribe to system alerts channel
        const channel = pusher.subscribe('system-alerts');
        
        channel.bind('alert.created', (alertData: any) => {
            console.log('🔔 New real-time alert received:', alertData);
            setLatestAlert(alertData);

            const emoji = alertData.type === 'critical' ? '🚨' :
                          alertData.type === 'warning' ? '⚠️' : 'ℹ️';

            Alert.alert(
                `${emoji} ${alertData.type.toUpperCase()} ALERT`,
                `${alertData.title}\n\n${alertData.message}`,
                [{ text: 'Dismiss', style: 'cancel' }]
            );
        });

        setPusherClient(pusher);

        return () => {
            pusher.unsubscribe('system-alerts');
            pusher.disconnect();
            setIsConnected(false);
        };
    }, [user]);

    return (
        <WebSocketContext.Provider value={{ isConnected, latestAlert, pusherClient }}>
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
