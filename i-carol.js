const createGoToProfile = ({name, address, phone}) => {
    const submitButton = document.getElementById("TODO");
    const inputs = {
        firstName: {
            selector: "TODO",
            value: name
        },
        address: {
            selector: "TODO",
            value: address
        },
        phone: {
            selector: "TODO",
            value: phone
        },
    }

    for (const type in inputs) {
        document.querySelector(inputs[type].selector).value = inputs[type].value;
    }
    submitButton.click();
};  

chrome.runtime.sendMessage("loaded", (response) => {
    console.log("Initiating creation of a new GoTo profile for :", response);
    createGoToProfile(response);
});
