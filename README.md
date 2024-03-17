# Warm Line Integration
## A chrome extension that automatically creates a new [GoTo Connect](https://app.goto.com/) profile when a new [iCarol](https://na0.icarol.com/) profile is created.

### Running an Unpacked Version for Testing
1. [Download the extension directiory](https://github.com/lmegviar/warm-line-integration#:~:text=with%20GitHub%20Desktop-,Download%20ZIP) as a zip file.
   - Unzip the downloaded directory.
3. Go to [chrome://extensions/](chrome://extensions/) and make sure the "Developer Mode" switch is toggled **on**.
4. Click the "Load unpacked" button and select the unzipped warm-line-integration directory.
5. Once the extension is loaded, open it in your Chrome extensions menu (this is usually a puzzle-piece shaped icon to the right of the URL bar in Chrome).
   - When you click on the bell icon, you should see some basic instructions.
6. Log in to your iCarol and GoTo Connect accounts.
7. Create a new profile in iCarol.
   - A new tab will open in the background, and a profile will also be created in GoTo.
---
### Testing without an iCarol or GoTo Connect Account
- If you don't have an iCarol or GoTo Connect account, you can still contribute to the project using sample data created locally.
  - For example, mocking data like the pending contacts queue described [here](https://github.com/lmegviar/warm-line-integration/blob/b882f378e7a20f0c36f7fe103201f29c07bb6a4f/service-worker.js#L12).
