import * as signalR from "signalr-no-jquery";
import { getMitelEmployeeState } from "./mitelService";

export interface SignalRConfig {
    baseUrl: string;     // e.g. "https://micc.telediant.com.my/MiccSdk/signalr"
    token?: string;
    hubs: string[];
    // The specific employee this connection should monitor. Without this,
    // the client is connected and authenticated but never told Mitel WHICH
    // employee's/agent's state it cares about — confirmed via a HAR capture
    // of a real, working Ignite session: every state-changing action there
    // is preceded by explicit addStateMonitor calls for both the employee
    // and their voice agent/device. Skipping this is why REST state PUTs
    // (e.g. going Available) return 200 OK from Mitel but are silently
    // never applied — the server has no record of this session managing
    // that employee.
    employeeId?: string;
}


export const ConnectionState = {
    Connecting: "connecting",
    Connected: "connected",
    Reconnecting: "reconnecting",
    Disconnected: "disconnected"
} as const;
export type ConnectionState = typeof ConnectionState[keyof typeof ConnectionState];

type MessageHandler = (hub: string, method: string, ...args: any[]) => void;
type ErrorHandler = (error: Error) => void;
type StateHandler = (state: ConnectionState) => void;

export class SignalRService {
    private config: SignalRConfig;
    private connection: any;
    private proxies: Record<string, any> = {};

    private messageHandlers = new Set<MessageHandler>();
    private errorHandlers = new Set<ErrorHandler>();
    private stateHandlers = new Set<StateHandler>();

    constructor(config: SignalRConfig) {
        this.config = config;
    }

    // The React hook constructs this service once, before baseUrl/token are
    // actually known (they arrive later via async fetch) — call this right
    // before connect() so the service isn't stuck using the empty values it
    // was originally constructed with.
    updateConfig(config: Partial<SignalRConfig>) {
        this.config = { ...this.config, ...config };
    }

    private getToken(): string {
        return (
            this.config.token ||
            localStorage.getItem("mitel_token") ||
            (() => {
                throw new Error("Mitel token missing");
            })()
        );
    }

    async connect(): Promise<void> {
        const token = this.getToken();

        this.connection = signalR.hubConnection(this.config.baseUrl, {
            useDefaultPath: false
        });

        // Query string auth (Mitel requirement)
        this.connection.qs = {
            sessionid: `Bearer ${token}`
        };

        // Enable logging for debugging
        this.connection.logging = true;

        // Create hub proxies BEFORE registering events
        for (const hubName of this.config.hubs) {
            this.proxies[hubName] = this.connection.createHubProxy(hubName);
            console.log(`✅ Created proxy for hub: ${hubName}`);
        }

        // Register client-side event handlers BEFORE starting connection
        this.registerClientMethods();

        // Bind connection events
        this.bindEvents();

        // Start connection
        await new Promise<void>((resolve, reject) => {
            this.connection
                .start({
                    transport: ["webSockets", "serverSentEvents", "longPolling"]
                })
                .done(() => {
                    console.log("✅ Mitel SignalR Connected:", this.connection.id);
                    this.notifyState(ConnectionState.Connected);
                    
                    // CRITICAL: Initialize monitors after connection
                    this.initializeMonitors();
                    
                    resolve();
                })
                .fail((err: any) => {
                    console.error("❌ Mitel SignalR Connect Failed:", err);
                    this.notifyError(new Error(err?.message || "Connect failed"));
                    reject(err);
                });
        });
    }

    private registerClientMethods() {
        console.log("📝 Registering client-side methods...");

        // Employee Hub events (based on Mitel docs)
        if (this.proxies['employeeHub']) {
            const employeeHub = this.proxies['employeeHub'];
            
            employeeHub.on('employeeStateChanged', (...args: any[]) => {
                console.log("📨 employeeHub.employeeStateChanged:", args);
                this.notifyMessage('employeeHub', 'employeeStateChanged', ...args);
            });

            employeeHub.on('employeeConversationChanged', (...args: any[]) => {
                console.log("📨 employeeHub.employeeConversationChanged:", args);
                this.notifyMessage('employeeHub', 'employeeConversationChanged', ...args);
            });

            employeeHub.on('employeeConversationRemoved', (...args: any[]) => {
                console.log("📨 employeeHub.employeeConversationRemoved:", args);
                this.notifyMessage('employeeHub', 'employeeConversationRemoved', ...args);
            });
        }

        // Agent Hub events
        if (this.proxies['agentHub']) {
            const agentHub = this.proxies['agentHub'];
            
            agentHub.on('onAgentStateChanged', (...args: any[]) => {
                console.log("📨 agentHub.onAgentStateChanged:", args);
                this.notifyMessage('agentHub', 'onAgentStateChanged', ...args);
            });

            agentHub.on('agentStateChanged', (...args: any[]) => {
                console.log("📨 agentHub.agentStateChanged:", args);
                this.notifyMessage('agentHub', 'agentStateChanged', ...args);
            });
        }

        // Queue Hub events
        if (this.proxies['queueHub']) {
            const queueHub = this.proxies['queueHub'];
            
            queueHub.on('queueStateChanged', (...args: any[]) => {
                console.log("📨 queueHub.queueStateChanged:", args);
                this.notifyMessage('queueHub', 'queueStateChanged', ...args);
            });

            queueHub.on('queueConversationChanged', (...args: any[]) => {
                console.log("📨 queueHub.queueConversationChanged:", args);
                this.notifyMessage('queueHub', 'queueConversationChanged', ...args);
            });

            queueHub.on('queueConversationRemoved', (...args: any[]) => {
                console.log("📨 queueHub.queueConversationRemoved:", args);
                this.notifyMessage('queueHub', 'queueConversationRemoved', ...args);
            });
        }

        console.log("✅ Client methods registered");
    }

    private async initializeMonitors() {
        console.log("🔔 Initializing Mitel monitors...");

        try {
            // Add self monitor for employee updates
            if (this.proxies['employeeHub']) {
                await this.invoke('employeeHub', 'addSelfMonitor');
                console.log("✅ Employee self-monitor added");
            }

            // The remaining monitors below exactly mirror a real Ignite
            // session's HAR capture — same hub, same method names, same
            // argument shapes ([[id]] — a single argument that is itself an
            // array of ids). Without these, this session is connected but
            // not actually registered as managing this employee/agent's
            // state, so subsequent REST PUTs to change presence silently
            // no-op even though they return 200 OK.
            if (this.config.employeeId) {
                if (this.proxies['employeeHub']) {
                    await this.invoke('employeeHub', 'addStateMonitor', [this.config.employeeId]);
                    console.log("✅ Employee state monitor added");
                }

                if (this.proxies['agentHub']) {
                    try {
                        const employeeState = await getMitelEmployeeState(this.config.employeeId);
                        const voiceDeviceId = employeeState?.data?.presence?.voice?.[0]?.deviceId;
                        if (voiceDeviceId) {
                            await this.invoke('agentHub', 'addStateMonitor', [voiceDeviceId]);
                            console.log("✅ Agent (voice device) state monitor added");
                        }
                    } catch (err) {
                        console.error("❌ Failed to resolve voice device for agent state monitor:", err);
                    }

                    await this.invoke('agentHub', 'addConcurrentStateMonitor');
                    console.log("✅ Agent concurrent state monitor added");
                }
            }

            // You can add queue monitors here if needed
            // Example: await this.invoke('queueHub', 'addConversationMonitor', [queueId]);

        } catch (err) {
            console.error("❌ Failed to initialize monitors:", err);
        }
    }

    private bindEvents() {
        // Reconnect events
        this.connection.reconnecting(() => {
            console.log("🔄 Reconnecting...");
            this.notifyState(ConnectionState.Reconnecting);
        });

        this.connection.reconnected(() => {
            console.log("✅ Reconnected");
            this.notifyState(ConnectionState.Connected);
            // Re-initialize monitors after reconnect
            this.initializeMonitors();
        });

        this.connection.disconnected((err: any) => {
            console.log("❌ Disconnected");
            this.notifyState(ConnectionState.Disconnected);
            if (err) this.notifyError(new Error(err?.message || "Disconnected"));
        });

        // Raw packet logger
        this.connection.received((data: any) => {
            console.log("🔥 RAW SIGNALR PACKET:", data);
        });

        // Error handler
        this.connection.error((error: any) => {
            console.error("❌ SignalR Error:", error);
            this.notifyError(new Error(error?.message || "Connection error"));
        });
    }

    async disconnect() {
        if (this.connection) {
            this.connection.stop();
            this.notifyState(ConnectionState.Disconnected);
        }
    }

    async invoke(hub: string, method: string, ...args: any[]) {
        const proxy = this.proxies[hub];
        if (!proxy) throw new Error(`Hub not found: ${hub}`);

        console.log(`📤 Invoking ${hub}.${method}`, args);

        try {
            const result = await proxy.invoke(method, ...args);
            console.log(`✅ ${hub}.${method} result:`, result);
            return result;
        } catch (err: any) {
            console.error(`❌ Invoke error ${hub}.${method}:`, err);
            this.notifyError(new Error(err?.message || "Invoke error"));
            throw err;
        }
    }

    // User-side subscription
    on(hub: string, method: string, handler: (...args: any[]) => void) {
        const proxy = this.proxies[hub];
        if (!proxy) throw new Error(`Hub not found: ${hub}`);

        proxy.on(method, handler);
        return () => proxy.off(method, handler);
    }

    // Helper methods for common Mitel operations
    async addQueueStateMonitor(queueIds: string[]) {
        return this.invoke('queueHub', 'addStateMonitor', queueIds);
    }

    async removeQueueStateMonitor(queueIds: string[]) {
        return this.invoke('queueHub', 'removeStateMonitor', queueIds);
    }

    async addQueueConversationMonitor(queueIds: string[]) {
        return this.invoke('queueHub', 'addConversationMonitor', queueIds);
    }

    async removeQueueConversationMonitor(queueIds: string[]) {
        return this.invoke('queueHub', 'removeConversationMonitor', queueIds);
    }

    // Internal listeners
    onMessage(handler: MessageHandler) {
        this.messageHandlers.add(handler);
        return () => this.messageHandlers.delete(handler);
    }

    onError(handler: ErrorHandler) {
        this.errorHandlers.add(handler);
        return () => this.errorHandlers.delete(handler);
    }

    onStateChange(handler: StateHandler) {
        this.stateHandlers.add(handler);
        return () => this.stateHandlers.delete(handler);
    }

    private notifyMessage(hub: string, method: string, ...args: any[]) {
        for (const h of this.messageHandlers) h(hub, method, ...args);
    }

    private notifyError(error: Error) {
        for (const h of this.errorHandlers) h(error);
    }

    private notifyState(state: ConnectionState) {
        for (const h of this.stateHandlers) h(state);
    }
}