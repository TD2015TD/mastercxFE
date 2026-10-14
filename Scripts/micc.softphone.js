// Skeleton browser softphone (SIP/WebRTC) using JsSIP, provisioned against MiccSdk.
// Requires JsSIP (https://jssip.net) loaded globally as `JsSIP` before this file.
// Endpoint names/payload shapes were extracted from Ignite's minified bundles, not
// from official docs - verify each call against real server responses before relying on it.
var softphone = new function (miccSdkUrl) {

    var _url = miccSdkUrl;
    if (_url === undefined) {
        _url = location.protocol + "//" + location.host + "/MiccSdk";
    }

    var _ua = null;
    var _session = null;

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
    //Provisioning

    var _provisionAccount = function (agentId) {
        // Expected response: { accountId, gatewayMediaServerDomain, gatewayMediaServerPort, integratedSoftphonePassword }
        return _request("POST", "/agents/" + agentId + "/integratedSoftphone/account");
    };

    var _getTurnConfig = function (agentId, gatewayMediaServerDomain) {
        // Expected response: { urls, username, credential, ttl }
        return _request("GET", "/agents/" + agentId + "/integratedSoftphone/turn?server=" + gatewayMediaServerDomain);
    };

    //
    //Registration

    var _buildUaConfig = function (account, turn) {
        var config = {
            sockets: [new JsSIP.WebSocketInterface("wss://" + account.gatewayMediaServerDomain + ":" + account.gatewayMediaServerPort)],
            uri: "sip:" + account.accountId + "@" + account.gatewayMediaServerDomain,
            registrar_server: account.gatewayMediaServerDomain,
            register: true,
            register_expires: 300
        };

        // Password may arrive pre-hashed as "md5a1: <32-hex>" - JsSIP accepts the HA1 directly via ha1/realm.
        if (account.integratedSoftphonePassword && account.integratedSoftphonePassword.indexOf("md5a1: ") === 0) {
            config.ha1 = account.integratedSoftphonePassword.substring("md5a1: ".length);
            config.realm = account.gatewayMediaServerDomain;
        } else {
            config.password = account.integratedSoftphonePassword;
        }

        if (turn && turn.urls) {
            config.pcConfig = {
                iceServers: [{
                    urls: turn.urls,
                    username: turn.username,
                    credential: turn.credential
                }]
            };
        }

        return config;
    };

    var _register = function (agentId) {
        return _provisionAccount(agentId).then(function (account) {
            return _getTurnConfig(agentId, account.gatewayMediaServerDomain).then(function (turn) {
                return { account: account, turn: turn };
            }, function () {
                // TURN lookup failing shouldn't block registration - fall back to STUN-only.
                return { account: account, turn: null };
            });
        }).then(function (result) {
            _ua = new JsSIP.UA(_buildUaConfig(result.account, result.turn));

            _ua.on("registered", function () { _log("Softphone registered"); $(document).trigger("softphone.registered"); });
            _ua.on("unregistered", function () { $(document).trigger("softphone.unregistered"); });
            _ua.on("registrationFailed", function (e) { _log("Registration failed - " + JSON.stringify(e.cause)); $(document).trigger("softphone.registrationFailed", [e]); });

            _ua.on("newRTCSession", function (data) {
                _session = data.session;

                if (data.originator === "remote") {
                    $(document).trigger("softphone.incomingCall", [_session]);
                }

                _session.on("accepted", function () { $(document).trigger("softphone.callAccepted", [_session]); });
                _session.on("confirmed", function () { $(document).trigger("softphone.callConfirmed", [_session]); });
                _session.on("ended", function (e) { $(document).trigger("softphone.callEnded", [e]); _session = null; });
                _session.on("failed", function (e) { $(document).trigger("softphone.callFailed", [e]); _session = null; });
                _session.on("hold", function () { $(document).trigger("softphone.callHeld"); });
                _session.on("unhold", function () { $(document).trigger("softphone.callUnheld"); });

                _session.on("peerconnection", function (e) {
                    e.peerconnection.addEventListener("track", function (evt) {
                        $(document).trigger("softphone.remoteTrack", [evt.streams[0]]);
                    });
                });
            });

            _ua.registrator().setExtraHeaders([
                "X-WebRTC-Client-Id: " + result.account.accountId,
                "X-WebRTC-Supported: keepalive"
            ]);

            _ua.start();
        });
    };

    var _unregister = function () {
        if (_ua) {
            _ua.stop();
            _ua = null;
        }
    };

    //
    //Call control

    var _answer = function () {
        if (_session) {
            _session.answer({
                mediaConstraints: { audio: true, video: false }
            });
        }
    };

    var _hangup = function () {
        if (_session) {
            _session.terminate();
        }
    };

    var _hold = function () {
        if (_session) {
            _session.hold();
        }
    };

    var _unhold = function () {
        if (_session) {
            _session.unhold();
        }
    };

    var _sendDtmf = function (tone) {
        if (_session) {
            _session.sendDTMF(tone);
        }
    };

    var _transfer = function (target) {
        if (_session) {
            _session.refer(target);
        }
    };

    //
    //Public interface
    return {
        register: _register,
        unregister: _unregister,
        answer: _answer,
        hangup: _hangup,
        hold: _hold,
        unhold: _unhold,
        sendDtmf: _sendDtmf,
        transfer: _transfer
    };

};
