/*
Helpful Documentation:
 - https://developer.chrome.com/docs/extensions/reference/api/webRequest
*/

/*

*/

console.log("Warm Line Integration - Service Worker is running.");

const GO_TO_CREATE_CONTACT_URL = "https://app.goto.com/contacts/new";
const I_CAROL_POST_URL = "*://na0.icarol.com/secure/profiles/ProfileView2.aspx*";
const GO_TO_SCRIPT_NAME = "goTo";
const pendingContacts = {/*[tabId]: {name, phone, address}*/};

const handleMessage = (msg, sender, sendResponse) => {
    if (
        sender.url === GO_TO_CREATE_CONTACT_URL 
        && sender.tab.id in pendingContacts
    ){
        sendResponse(pendingContacts[sender.tab.id]);
        delete pendingContacts[sender.tab.id];
    }
};

const initiateNewGoToProfile = (data) => {
    let tab = chrome.tabs.create({
        url: GO_TO_CREATE_CONTACT_URL,
        active: false
    }, async (tab) => {
        pendingContacts[tab.id] = data;
        chrome.scripting.registerContentScripts([{
            id: `GO_TO_SCRIPT_NAME${new Date().getTime()}`,
            js: [`${GO_TO_SCRIPT_NAME}.js`],
            persistAcrossSessions: false,
            matches: [GO_TO_CREATE_CONTACT_URL]
        }])  
        .catch((err) => console.warn("Error registering content script: ", err))
    });
};

const interceptNewICarolContacts = () => {
    let decode = (raw) => JSON.parse(decodeURIComponent(String.fromCharCode.apply(null,
        new Uint8Array(raw[0].bytes))));
    let filter = {urls: [I_CAROL_POST_URL]};
    let extraInfoSpec = ["requestBody"];
    chrome.runtime.onMessage.addListener(handleMessage);
    chrome.webRequest.onBeforeRequest.addListener((res)=>{
        // TO DO - confirm this isn't available as a request filter
        if (res?.method !== "POST") {
            return;
        }
        const data = res.requestBody.formData;
        // Remove all non-numeric characters from phone string
        const strippedPhone = data["ctl00$cphBody$txtLookupPhone"][0].replace(/[^0-9]/g, '');
        const formattedData =  {
            name: data["ctl00$cphBody$txtName"][0] || "",
            address: data["ctl00$cphBody$txtAddress"][0] || "",
            phone: strippedPhone
        };
        console.log("FORMATTED DATA: ", formattedData);
        initiateNewGoToProfile(formattedData);

    }, filter, extraInfoSpec);
};

chrome.runtime.onInstalled.addListener(()=>{
    interceptNewICarolContacts();
});
