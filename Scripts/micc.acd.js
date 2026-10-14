// Skeleton MiccSdk client (ACD state + OpenMedia conversations + real-time events).
// Endpoint names/payload shapes were extracted from Ignite's minified bundles, not
// from official docs - verify each call against real server responses before relying on it.
var acd = new function (miccSdkUrl) {

    var _url = miccSdkUrl;
    if (_url === undefined) {
        _url = location.protocol + "//" + location.host + "/MiccSdk";
    }

    var _hubConnection = null;
    var _agentHub = null;
    var _queueHub = null;

    var _log = function (message) {
        try {
            console.log(message);
        } catch (e) {
            //ignore.. console not supported on all platforms
        }
    };

    var _request = function (method, path, data) {
        return $.ajax({
            type: method,
            url: _url + "/api/v1" + path,
            dataType: "json",
            contentType: "application/json",
            data: data ? JSON.stringify(data) : undefined,
            headers: {
                "Authorization": "Bearer " + auth.getCachedToken()
            }
        });
    };

    //
    //Agent / ACD state

    var _setAgentState = function (deviceId, state, availableReason) {
        return _request("PUT", "/agents/" + deviceId + "/state", {
            state: state,
            availableReason: availableReason
        });
    };

    var _login = function (deviceId) {
        return _setAgentState(deviceId, "Login");
    };

    var _logout = function (deviceId) {
        return _setAgentState(deviceId, "Offline");
    };

    var _setAvailable = function (deviceId) {
        return _setAgentState(deviceId, "Available");
    };

    var _clearWorkTimer = function (deviceId) {
        return _setAgentState(deviceId, "ClearWorkTimer");
    };

    var _getAgentState = function (deviceId) {
        return _request("GET", "/agents/" + deviceId + "/state");
    };

    //
    //OpenMedia conversations

    var _pushConversation = function (agentId, conversation) {
        // conversation must include mediaType: "OpenMedia"; other required fields unconfirmed
        return _request("POST", "/agents/" + agentId + "/conversations", conversation);
    };

    var _updateConversation = function (conversationId, data) {
        return _request("PUT", "/conversations/" + conversationId, data);
    };

    var _getQueueConversations = function (queueId) {
        return _request("GET", "/queues/" + queueId + "/conversations");
    };

    //
    //Real-time (SignalR)

    var _connect = function () {
        _hubConnection = $.hubConnection(_url + "/signalr");

        // Hub auth mechanism (query string token vs header) is unconfirmed - adjust once verified.
        _hubConnection.qs = { access_token: auth.getCachedToken() };

        _agentHub = _hubConnection.createHubProxy("agentHub");
        _queueHub = _hubConnection.createHubProxy("queueHub");

        _agentHub.on("onAgentStateChanged", function (data) {
            _log("onAgentStateChanged: " + JSON.stringify(data));
            $(document).trigger("acd.agentStateChanged", [data]);
        });

        _queueHub.on("queueStateChanged", function (data) {
            $(document).trigger("acd.queueStateChanged", [data]);
        });

        _queueHub.on("queueConversationChanged", function (data) {
            $(document).trigger("acd.queueConversationChanged", [data]);
        });

        _queueHub.on("queueConversationRemoved", function (data) {
            $(document).trigger("acd.queueConversationRemoved", [data]);
        });

        return _hubConnection.start()
            .done(function () { _log("MiccSdk hub connected"); })
            .fail(function (e) { _log("MiccSdk hub connection failed - " + e); });
    };

    var _disconnect = function () {
        if (_hubConnection) {
            _hubConnection.stop();
        }
    };

    //
    //Public interface
    return {
        url: _url,
        setAgentState: _setAgentState,
        login: _login,
        logout: _logout,
        setAvailable: _setAvailable,
        clearWorkTimer: _clearWorkTimer,
        getAgentState: _getAgentState,
        pushConversation: _pushConversation,
        updateConversation: _updateConversation,
        getQueueConversations: _getQueueConversations,
        connect: _connect,
        disconnect: _disconnect
    };

};
