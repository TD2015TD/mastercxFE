// Access token and "authorized" local storage item used by swagger authorization is created by
// Authorization Server after logging into MiCC web app with valid creds.
// If token found in local storage (and valid), allow the page to load otherwise clear the cached
// tokens and redirect to the Authorization Server for the user to re-enter creds.

var token = localStorage.getItem('ls.access_token');
var url = location.protocol + "//" + location.host + "/authorizationserver/api/account";

// Validate against the server
fetch(url, {
    method: "GET",
    headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
    }
})
    .then(response => {
        if (response && response.ok) {
            Authorized();
        }
        else {
            NotAuthorized();
        }
    })
    .catch(error => {
        console.error('Error with fetch operation:', error);
        NotAuthorized();
    });

function Authorized() {
    if (!localStorage.getItem('authorized') || localStorage.getItem('authorized').indexOf(token) === -1) {
        // If local storage 'authorized' does not exist or using the wrong token, update it.
        var authorizedValue = '{"micontact-center-authorizer":{"name":"micontact-center-authorizer","schema":{"type":"apiKey","description":"Mitel CX user authorizer","name":"Authorization"," in ":"header"},"value":"Bearer ' + token + '"}}';
        localStorage.setItem("authorized", authorizedValue);
        window.location.reload();
    }
    console.log('Access token found - user authorized to make requests through Swagger!');
};

function NotAuthorized() {
    console.log("Token invalid or expired, user is NOT authorized to make requests through Swagger!");

    if (document.cookie.indexOf("CCMWebEmployeePortalToken=") > -1) {
        var now = new Date();
        now.setDate(now.getDate() - 1);
        document.cookie = "CCMWebEmployeePortalToken=; expires=" + now.toUTCString() + "; path=/";
    }

    localStorage.removeItem('authorized');
    localStorage.removeItem('ls.access_token');
    localStorage.removeItem('ls.refresh_token');
    localStorage.removeItem('ls.token_expires_in');
    localStorage.removeItem('ls.username');

    window.location.replace('/authorizationserver/?ReturnUrl=/miccconfig/swagger');
};