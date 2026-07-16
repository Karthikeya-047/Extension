document.addEventListener("DOMContentLoaded", async () => {

    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    console.log(tab);
    console.log("Sending message to tab:", tab.id);
    document.getElementById('descriptionBtn').style.display = 'none';
    document.getElementById('description').style.display = 'none';
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

                    // 1. If topics are already showing, clear them (Hide effect)
                    if (topicsDiv.innerHTML !== "") {
                        topicsDiv.innerHTML = "";
                        return; // Stop execution here
                    }

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
    // document
    //     .getElementById("descriptionBtn")
    //     .addEventListener("click", () => {

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
    // });
    document
        .getElementById("hintBtn")
        .addEventListener("click", async () => {

            const spinner =
                document.getElementById("hintSpinner");

            const list =
                document.getElementById("my-list");

            spinner.style.display = "flex";



            try {

                const response =
                    await fetch(
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
                                    document.getElementById(
                                        "description"
                                    ).innerText
                            })
                        }
                    );

                const data =
                    await response.json();
                const newItem = document.createElement('li');
                newItem.textContent = data.hint;

                const listItems = document.querySelectorAll('#my-list li');
                // 2. Loop through each item
                listItems.forEach(item => {
                    // 3. Check if the text matches (trimmed to ignore accidental spaces)
                    if (item.textContent.trim() === "Failed to generate hint.") {
                        // 4. Remove the item from the DOM
                        item.remove();
                    }
                });

                list.appendChild(newItem);

            } catch (error) {
                if (error.response && error.response.status === 500) {
                    console.log("Caught an Internal Server Error (500)!");

                    // DO SOMETHING HERE

                } else {
                    console.log("Some other error occurred:", error.message);
                }
                hintDiv.innerText =
                    "Failed to generate hint.";

                console.error(error);

            } finally {

                spinner.style.display = "none";

            }
        });
});