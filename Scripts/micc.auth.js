var auth = new function (authServerUrl) {

    //
    //Member variables
    var _authorized = false;
    var _accessTokenName = 'ls.access_token';
    var _refreshTokenName = 'ls.refresh_token';
    var _tokenExpiresIn = 'ls.token_expires_in';
    var _username = 'ls.username';
    var _returnUrl = 'ls.ReturnUrl';
    var _swaggerAuthorized = 'authorized';
    var _url = authServerUrl;
    if (_url === undefined) {
        //If we are given a URL we use it.. otherwise.. create a default based on current window
        _url = location.protocol + "//" + location.host + "/authorizationserver";
    }

    //
    //Member functions
    var _log = function (message)
    {
        try {
            console.log(message);
        } catch (e) {
            //ignore.. console not supported on all platforms
        }
    }

    var _getCachedToken = function (tokenName = _accessTokenName) {

        var token = "";
        try {
           token = localStorage.getItem(tokenName);
        } catch (e) {
            _log("Error getting cached token from local storage - " + e);
        }
        return token;
    };

    var _setCachedToken = function (token, tokenName = _accessTokenName) {

        try {
           localStorage.setItem(tokenName, token);
        } catch (e) {
            _log("Error setting cached token from local storage - " + e);
        }        
    };

    var _setCachedTokens = function (data) {
       try {
          _setCachedToken(_accessTokenName, data.access_token);
          _setCachedToken(_refreshTokenName, data.refresh_token);
           _setCachedToken(_tokenExpiresIn, data.expires_in);
          var now = new Date();
          now.setDate(now.getDate() + 7);
          document.cookie = "CCMWebEmployeePortalToken=" + data.access_token + "; expires=" + now.toUTCString() + "; path=/";
       } catch (e) {
          _log("Error setting cached token from local storage - " + e);
       }
    };

    var _clearCachedTokens = function () {
        var accessToken = localStorage.getItem(_accessTokenName);
        if (accessToken && document.cookie.indexOf("CCMWebEmployeePortalToken=") > -1) {
            // CCMWebEmployeePortalToken cookie has the same value as Access Token so if we can't find Access Token,
            // there is no point of deleting CCMWebEmployeePortalToken cookie.
            var now = new Date();
            now.setDate(now.getDate() - 1);
            document.cookie = "CCMWebEmployeePortalToken=" + accessToken + "; expires=" + now.toUTCString() + "; path=/";
        }
        localStorage.removeItem(_accessTokenName);
        localStorage.removeItem(_refreshTokenName);
        localStorage.removeItem(_tokenExpiresIn);
        localStorage.removeItem(_username);
        localStorage.removeItem(_returnUrl);
        localStorage.removeItem(_swaggerAuthorized);
    }

    // Logout is being invoked from _Layout.cshtml
    var _logout = function () {

        /// <summary>Performs a logout operation which will remove any cached tokens from a previous login</summary>

        try {
            _clearCachedTokens();
        } catch (e) {
            _log("Error setting cached token from local storage. - " + e);
        }        

        _authorized = false;
    };

    /// <summary>Validates a bearer token. If a null token is passed then we attempt to grab a token from the cache</summary>
    /// <param name="token" type="string">Optional. If the token is undefined we will attempt a lookup</param>
    /// <returns type="Promise">A promise. Return code indicates success</returns>
    var _validate = function (token) {

        if (!token) {
            token = _getCachedToken();
        }

        if (!token) {
            _log("No access token found, user is not authenticated.");
            return $.Deferred().reject();
        }

        var url = _url + "/api/account";
        
        //Validate against the server
        var deferred = $.ajax
        ({
            type: "GET",
            url: url,
            dataType: 'json',
            async: true,
            headers: {
                "Authorization": "Bearer " + token
            },

        });

        return deferred;
    };

    //
    //Public interface
    return {
        url: _url,
        authorized: _authorized,
        logout: _logout,
        validate: _validate,
        getCachedToken: _getCachedToken
    };

}