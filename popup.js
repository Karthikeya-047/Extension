document.addEventListener("DOMContentLoaded", async () => {

    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    console.log(tab);
    console.log("Sending message to tab:", tab.id);

    // Get Title
    chrome.tabs.sendMessage(
        tab.id,
        { action: "getTitle" },
        (response) => {
            console.log("Response:", response);
            console.log("Last Error:", chrome.runtime.lastError);

            document.getElementById("title").innerText =
                response?.title || "Open a problem to see the title here.";
        }
    );

    // Show Topics Button Click
    document
        .getElementById("topicsBtn")
        .addEventListener("click", () => {

            chrome.tabs.sendMessage(
                tab.id,
                { action: "getTopics" },
                (response) => {

                    console.log("Topics Response:", response);

                    const topicsDiv =
                        document.getElementById("topics");

                    if (
                        response?.topics &&
                        response.topics.length > 0
                    ) {
                        topicsDiv.innerHTML = response.topics
                            .map(topic => `<span class="topic-tag">${topic}</span>`)
                            .join("");
                    } else {
                        topicsDiv.innerText ="No topics found.";
                        topicsDiv.style.fontWeight = "bold";
                    }
                }
            );
        });
});