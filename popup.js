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
                        topicsDiv.innerText = "No topics found.";
                        topicsDiv.style.fontWeight = "bold";
                    }
                }
            );
        });
    // Show Description Button Click
    document
        .getElementById("descriptionBtn")
        .addEventListener("click", () => {

            chrome.tabs.sendMessage(
                tab.id,
                { action: "getDescription" },
                (response) => {

                    console.log("Description Response:", response);

                    const descriptionDiv =
                        document.getElementById("description");

                    if (response?.description) {

                        descriptionDiv.innerText =
                            response.description;

                    } else {

                        descriptionDiv.innerText =
                            "No description found.";

                        descriptionDiv.style.fontWeight =
                            "bold";
                    }
                }
            );
        });
    document
        .getElementById("hintBtn")
        .addEventListener("click", async () => {

            const response = await fetch(
                "http://localhost:3000/hint",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        title:
                            document.getElementById("title")
                                .innerText,
                                topics: Array.from(
                            document.querySelectorAll(
                                "#topics .topic-tag"
                            )
                        ).map(el => el.innerText),
                        description:
                            document.getElementById("description")
                                .innerText
                        
                    })
                }
            );

            const data =
                await response.json();

            document
                .getElementById("hint")
                .innerText = data.hint;
        });
});