/*
Helpful Documentation:
 - https://developer.chrome.com/docs/extensions/reference/api/webRequest
*/

/*

*/

console.log("Warm Line Integration - Service Worker is running.");

const I_CAROL_NEW_ADD_NEW_URL = "https://na0.icarol.com/secure/profiles/ProfileView2.aspx";
const GO_TO_POST_URL = "*://api.jive.com/contacts/v6/associated-contacts";
const I_CAROL_SCRIPT_NAME = "i-carol"
const pendingContacts = {/*[tabId]: {name, phone, address}*/};

const handleMessage = (msg, sender, sendResponse) => {
    if (
        sender.url === I_CAROL_NEW_ADD_NEW_URL 
        && sender.tab.id in pendingContacts
    ){
        sendResponse(pendingContacts[sender.tab.id]);
        delete pendingContacts[sender.tab.id];
    }
};

const initiateNewICarolProfile = (data) => {
    let tab = chrome.tabs.create({
        url: I_CAROL_NEW_ADD_NEW_URL,
        active: false
    }, async (tab) => {
        pendingContacts[tab.id] = data;
        chrome.scripting.registerContentScripts([{
            id: `i-carol${new Date().getTime()}`,
            js: [`${I_CAROL_SCRIPT_NAME}.js`],
            persistAcrossSessions: false,
            matches: [I_CAROL_NEW_ADD_NEW_URL]
        }])  
        .catch((err) => console.warn("Error registering content script: ", err))
    });
};

const interceptNewGoToContacts = () => {
    let decode = (raw) => JSON.parse(decodeURIComponent(String.fromCharCode.apply(null,
        new Uint8Array(raw[0].bytes))));
    let filter = {urls: [GO_TO_POST_URL]};
    let extraInfoSpec = ["requestBody"];
    chrome.runtime.onMessage.addListener(handleMessage);
    chrome.webRequest.onBeforeRequest.addListener((details)=>{
        const data = decode(details.requestBody.raw);
        // Remove all non-numeric characters from phone string
        const strippedPhone = data.phones?.[0]?.phone.replace(/[^0-9]/g, '');
        const formattedData =  {
            name: `${data.firstName}${data.lastName ? " " : ""}${data.lastName || ""}`,
            address: data.addresses?.[0]?.streetAddress || "",
            phone: strippedPhone
        };
        initiateNewICarolProfile(formattedData);

    }, filter, extraInfoSpec);
};

chrome.runtime.onInstalled.addListener(()=>{
    interceptNewGoToContacts();
});
