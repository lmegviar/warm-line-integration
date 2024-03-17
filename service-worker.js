/*
Helpful Documentation:
 - developer.chrome.com/docs/extensions/reference/manifest
*/

console.log("🔔 Warm Line Integration - Service Worker is running. 🔔");

const GO_TO_CREATE_CONTACT_URL = "https://app.goto.com/contacts/new";
const I_CAROL_POST_URL = "*://na0.icarol.com/secure/profiles/ProfileView2.aspx?CallerNum=0";
const GO_TO_SCRIPT_NAME = "goTo";
// Keep track of which profiles have been sent out for creation in another tab
const pendingContacts = {/*  
    [tabId -> ex. "goTo1710597772365"]: {
        name -> ex. "Test Caller", 
        phone -> ex. 8040001234, 
        address -> ex. "Roanoke, VA"
    }
*/};

const handleMessage = (msg, sender, sendResponse) => {
    if (
        sender.url === GO_TO_CREATE_CONTACT_URL 
        && sender.tab.id in pendingContacts
    ){
        sendResponse(pendingContacts[sender.tab.id]);
        delete pendingContacts[sender.tab.id];

        // Close the tab where the contact was created
        // developer.chrome.com/docs/extensions/reference/api/tabs#method-remove
        // We'll need to do this in an event driven way to close after completion
        //chrome.tabs.remove(sender.tab.id);
    }
};

const initiateNewGoToProfile = (data) => {
    let tab = chrome.tabs.create({
        url: GO_TO_CREATE_CONTACT_URL,
        active: false
    }, async (tab) => {
        pendingContacts[tab.id] = data;
        //developer.chrome.com/docs/extensions/reference/api/scripting#type-RegisteredContentScript
        chrome.scripting.registerContentScripts([{
            id: `GO_TO_SCRIPT_NAME${new Date().getTime()}`,
            js: [`${GO_TO_SCRIPT_NAME}.js`],
            persistAcrossSessions: false,
            matches: [GO_TO_CREATE_CONTACT_URL]
        }])  
        .catch((err) => console.warn("Error registering content script: ", err))
    });
};

/* 
    When a user saves an iCarol profile, intercept it and initiate 
    creating a corresponding profile in GoTo.
*/
const interceptNewICarolContacts = () => {
    let decode = (raw) => JSON.parse(decodeURIComponent(String.fromCharCode.apply(null,
        new Uint8Array(raw[0].bytes))));
    //developer.chrome.com/docs/extensions/reference/api/webRequest#type-RequestFilter
    let filter = {urls: [I_CAROL_POST_URL]};
    let extraInfoSpec = ["requestBody"];
    //developer.chrome.com/docs/extensions/reference/api/runtime#event-onMessage
    chrome.runtime.onMessage.addListener(handleMessage);
    //developer.chrome.com/docs/extensions/reference/api/webRequest#event-onBeforeRequest
    chrome.webRequest.onBeforeRequest.addListener((res)=>{
        if (res?.method !== "POST") { return; }

        const data = res.requestBody.formData;
        if (!data) { return; }

        // Remove all non-numeric characters from phone string
        const strippedPhone = data["ctl00$cphBody$txtLookupPhone"]?.[0]?.replace(/[^0-9]/g, '');
        const formattedData =  {
            name: data["ctl00$cphBody$txtName"]?.[0] || "",
            address: data["ctl00$cphBody$txtAddress"]?.[0] || "",
            phone: strippedPhone
        };
        initiateNewGoToProfile(formattedData);

    }, filter, extraInfoSpec);
};

// developer.chrome.com/docs/extensions/reference/api/runtime#event-onInstalled
chrome.runtime.onInstalled.addListener(()=>{
    console.log("Chrome runtime installed.");
    interceptNewICarolContacts();
});
