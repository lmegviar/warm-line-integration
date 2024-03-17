const GO_TO_POST_URL = "https://api.jive.com/contacts/v6/associated-contacts";
const GO_TO_POST_HEADERS = {
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Accept-Language": "en-US,en;q=0.9",
    "Connection": "keep-alive",
    "Host": "api.jive.com",
    "Origin": "https://app.goto.com",
    "Referer": "https://app.goto.com/",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "cross-site",
    "accept": "application/json;type=aggregated-contact",
    "content-type": "application/json",
};

// Wait until func returns a truthy result or waitTime * maxAttempts elapses
const waitUntil = (func) =>{
    const waitTime = 5000; // 5 seconds
    const maxAttempts = 6;
    let attempts = 0;
    let result;

    return new Promise((resolve) => {
        const interval = setInterval(() => {
            result = func();
            if (result || (attempts > maxAttempts)) {
                resolve(result);
                clearInterval(interval);
            };
            attempts++;
        }, waitTime);
    });
};

// Get store of GoTo data required for POST requests from local storage
const getStore = async () => {
    return waitUntil(() => {
        let token, orgId;
        if (localStorage) {
            Object.keys(localStorage).forEach((key) => {
                if (key === "goto") {
                    // Get authorization token
                    token = JSON.parse(localStorage?.getItem(key))?.access_token;
                } else if (key.startsWith("goto-context_")) {
                    // Get organizational id
                    orgId = JSON.parse(localStorage?.getItem(key))?.pbx?.id;
                }
            });
        }
        return (token && orgId) ? {token, orgId} : null;
    });
};

// Make body for GoTo contact POST request
const makePOSTBody = ({name, address, phone}) => {
    return {
        "firstName": name,
        "tags": [],
        "phones": [
            {
                "type": "Work",
                "phone": phone,
                "primary": true
            }
        ],
        "addresses": [
            {
                "streetAddress": address,
                "type": "Work"
            }
        ],
        "sourceCode": "PERSONAL"
    };
};

// Send a request to add a new GoTo contact using the provide details
const createGoToRequest = async (data) => {
    let store = await getStore();

    if (!store) {
        console.log("Something went wrong fetching data from localStorage.");
        return;
    }

    let body = makePOSTBody(data);

    let headers = Object.assign({ 
        "authorization": `Bearer ${store.token}`,
        "x-organization-id": store.orgId
    }, GO_TO_POST_HEADERS);

    let fetchOptions = {
        method: "POST", 
        headers: headers, 
        body: JSON.stringify(body)
    };

    fetch(GO_TO_POST_URL, fetchOptions)
    .then(res => res.json())
    .then((data) => {
        console.log("Profile created!");
        return true;
    })
    .catch((err) => {
        console.log(err);
        return false;
    });
};

chrome.runtime.sendMessage("loaded", async (response) => {
    console.log("Initiating creation of a new GoTo profile.");
    return await createGoToRequest(response);
});
