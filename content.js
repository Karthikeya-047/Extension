console.log("Content script loaded!");

function getProblemTitle() {

    // LeetCode
    const leetcodeTitle =
        document.querySelector("div.text-title-large")?.innerText;

    if (leetcodeTitle) {
        console.log("LeetCode title found:", leetcodeTitle);
        return leetcodeTitle;
    }

    // GeeksforGeeks
    const gfgTitle =
        document.querySelector("h3.g-m-0")?.innerText;

    if (gfgTitle) {
        console.log("GFG title found:", gfgTitle);
        return gfgTitle;
    }

    console.log("No supported problem title found.");
    return null;
}

function getTopics() {

    // TODO:
    // Add LeetCode topic selectors
    const leetcodeTopics = Array.from(
        document.querySelectorAll('a[href^="/tag/"]')
    ).map(topic => topic.innerText);
    if (leetcodeTopics.length > 0) {
        console.log("LeetCode topics found:", leetcodeTopics);
        return leetcodeTopics;
    }
    // Add GFG topic selectors
    // GeeksforGeeks
    const gfgTopics = Array.from(
        document.querySelectorAll('a[href^="/explore?category"]')
    ).map(topic => topic.innerText);

    if (gfgTopics.length > 0) {
        console.log("GFG topics found:", gfgTopics);
        return gfgTopics;
    }

    console.log("No topics found.");
    return [];
}

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        console.log("Received request:", request.action);

        if (request.action === "getTitle") {

            sendResponse({
                title: getProblemTitle()
            });

            return;
        }
        console.log("Request action not recognized:", request.action);
        if (request.action === "getTopics") {
            console.log("getTopics request received");
            const topics = getTopics();

            console.log("Topics found:", topics);
            sendResponse({
                topics: topics
            });

            return;
        }
    }
);