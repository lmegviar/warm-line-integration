function querySelectorDeep(selector, root = document) {
    // TO DO: Update to look for multiple elements at a time

    // First, try to find the element in the current (root) document
    let element = root.querySelector(selector);
    if (element) {
      return element;
    }
    // If not found, traverse the shadow DOMs
    let shadowRoots = Array.from(root.querySelectorAll('*'))
                           .filter(e => e.shadowRoot)
                           .map(e => e.shadowRoot);
  
    for (let shadowRoot of shadowRoots) {
      element = querySelectorDeep(selector, shadowRoot);
      if (element) {
        return element;
      }
    }
    // If not found in any of these, return null
    return null;
}
  
const createGoToProfile = ({name, address, phone}) => {
    const elements = {
        submitButton: querySelectorDeep('[data-test="create-contact-submit"]'),
        firstName: querySelectorDeep('[name="firstName"]'),
        address: querySelectorDeep('[name="streetAddress"]'),
        phone: querySelectorDeep('[name="textFieldValue"][aria-label="Phone number"]')
    }
    const submitButton = document.getElementById(selectors.submitButton);
    const inputs = {
        firstName: {
            element: elements.submitButton,
            value: name
        },
        address: {
            element: elements.address,
            value: address
        },
        phone: {
            element: elements.phone,
            value: phone
        },
        submitButton: {
            element: elements.submitButton,
        }
    }

    console.log("ELS & INS: ", elements, inputs);

    for (const type in inputs) {
        if (type == "submitButton") { return };
        inputs[type].element.value = inputs[type].value;
    }

    elements.submitButton.click();
};  

chrome.runtime.sendMessage("loaded", (response) => {
    console.log("Initiating creation of a new GoTo profile for :", response);
    createGoToProfile(response);
});