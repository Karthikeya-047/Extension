// Stores the current problem description internally.
// It is NOT displayed in the side panel.
let currentDescription = "";


// ==========================================
// SIDE PANEL INITIALIZATION
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // Load current problem
    loadProblem();

    // Add button listeners only once
    setupButtonListeners();
});


// ==========================================
// LISTEN FOR TAB CHANGES
// ==========================================

// User switches browser tabs
chrome.tabs.onActivated.addListener(() => {

    console.log("Active tab changed");

    resetUI();

    loadProblem();
});


// Current page loads / changes
chrome.tabs.onUpdated.addListener(
    (tabId, changeInfo, tab) => {

        if (changeInfo.status === "complete") {

            console.log("Page updated");

            resetUI();

            loadProblem();
        }
    }
);


// ==========================================
// RESET UI
// ==========================================

function resetUI() {

    document.getElementById("title").innerText =
        "Loading problem...";

    document.getElementById("topics").innerHTML = "";

    document.getElementById("my-list").innerHTML = "";

    document.getElementById("no-problem").innerText = "";

    document.getElementById("hintSpinner").style.display =
        "none";

    // Clear stored description
    currentDescription = "";
}


// ==========================================
// LOAD CURRENT PROBLEM
// ==========================================

async function loadProblem() {

    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });


    if (!tab || !tab.id) {

        showNoProblem();

        return;
    }


    console.log("Current tab:", tab);
    console.log("Loading problem from tab:", tab.id);


    // ======================================
    // GET TITLE
    // ======================================

    chrome.tabs.sendMessage(
        tab.id,
        { action: "getTitle" },
        (response) => {

            if (chrome.runtime.lastError) {

                console.log(
                    "Title error:",
                    chrome.runtime.lastError.message
                );

                showNoProblem();

                return;
            }


            if (response?.title) {

                document.getElementById("title")
                    .innerText = response.title;

            } else {

                showNoProblem();
            }
        }
    );


    // ======================================
    // GET DESCRIPTION
    // ======================================

    chrome.tabs.sendMessage(
        tab.id,
        { action: "getDescription" },
        (response) => {

            if (chrome.runtime.lastError) {

                console.log(
                    "Description error:",
                    chrome.runtime.lastError.message
                );

                currentDescription = "";

                return;
            }


            if (response?.description) {

                // Store description internally.
                // We DO NOT display it.
                currentDescription =
                    response.description;

                console.log(
                    "Description stored internally."
                );

            } else {

                currentDescription = "";

                console.log(
                    "No description found."
                );
            }
        }
    );
}


// ==========================================
// NO PROBLEM FOUND
// ==========================================

function showNoProblem() {

    document.getElementById("title").innerText =
        "Open a problem to see the title here.";

    document.getElementById("topics").innerHTML = "";

    document.getElementById("my-list").innerHTML = "";

    document.getElementById("no-problem").innerText = "";

    currentDescription = "";
}


// ==========================================
// BUTTON EVENT LISTENERS
// ==========================================

function setupButtonListeners() {


    // ======================================
    // SHOW TOPICS BUTTON
    // ======================================

    document
        .getElementById("topicsBtn")
        .addEventListener("click", async () => {

            const topicsDiv =
                document.getElementById("topics");


            // Hide topics if already visible
            if (topicsDiv.innerHTML !== "") {

                topicsDiv.innerHTML = "";

                return;
            }


            const [tab] = await chrome.tabs.query({
                active: true,
                currentWindow: true
            });


            if (!tab || !tab.id) {
                return;
            }


            chrome.tabs.sendMessage(
                tab.id,
                { action: "getTopics" },
                (response) => {

                    if (chrome.runtime.lastError) {

                        console.log(
                            "Topics error:",
                            chrome.runtime.lastError.message
                        );

                        topicsDiv.innerText =
                            "Please open a problem to identify the topics.";

                        return;
                    }


                    if (
                        response?.topics &&
                        response.topics.length > 0
                    ) {

                        topicsDiv.innerHTML =
                            response.topics
                                .map(
                                    topic =>
                                        `<span class="topic-tag">${topic}</span>`
                                )
                                .join("");

                    } else {

                        topicsDiv.innerText =
                            "No topics found.";
                    }
                }
            );
        });


    // ======================================
    // GET HINT BUTTON
    // ======================================

    document
        .getElementById("hintBtn")
        .addEventListener("click", async () => {
            const button = document.getElementById("hintBtn");
            button.disabled = true;
            const title =
                document.getElementById("title")
                    .innerText;

            const spinner =
                document.getElementById(
                    "hintSpinner"
                );

            const list =
                document.getElementById(
                    "my-list"
                );

            const noProblem =
                document.getElementById(
                    "no-problem"
                );


            // ==================================
            // CHECK IF PROBLEM EXISTS
            // ==================================

            if (
                title ===
                "Open a problem to see the title here." ||
                title ===
                "Loading problem..."
            ) {

                noProblem.innerText =
                    "Please open a problem to generate a hint.";

                return;
            }


            // Clear previous error
            noProblem.innerText = "";


            // Show loading spinner
            spinner.style.display =
                "flex";


            try {

                // ==================================
                // SEND DATA TO BACKEND
                // ==================================

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

                                title: title,

                                topics: Array.from(
                                    document.querySelectorAll(
                                        "#topics .topic-tag"
                                    )
                                ).map(
                                    el => el.innerText
                                ),

                                // Description comes from
                                // our JavaScript variable
                                description:
                                    currentDescription
                            })
                        }
                    );


                // ==================================
                // HANDLE SERVER ERROR
                // ==================================

                if (!response.ok) {

                    throw new Error(
                        `Server error: ${response.status}`
                    );
                }


                const data =
                    await response.json();


                // ==================================
                // DISPLAY HINT
                // ==================================

                const newItem =
                    document.createElement(
                        "li"
                    );

                newItem.textContent =
                    data.hint;

                list.appendChild(
                    newItem
                );


            } catch (error) {

                console.error(
                    "Hint generation failed:",
                    error
                );

                noProblem.innerText =
                    "Failed to generate hint. Please try again.";

            } finally {

                // Always hide spinner
                spinner.style.display =
                    "none";
                // Re-enable the button
                const button = document.getElementById("hintBtn");
                button.disabled = false;
            }
        });
}