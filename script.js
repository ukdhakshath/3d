/* =====================================================
   ELEMENTS
===================================================== */

const modelViewer =
    document.querySelector("#printerModel");

const hotspotStatus =
    document.querySelector("#hotspotStatus");

const featureList =
    document.querySelector("#featureList");

const videoModal =
    document.querySelector("#videoModal");

const hotspotVideo =
    document.querySelector("#hotspotVideo");

const videoSource =
    document.querySelector("#videoSource");

const videoTitle =
    document.querySelector("#videoTitle");

const closeVideo =
    document.querySelector("#closeVideo");


/* =====================================================
   STATE
===================================================== */

let hotspots = [];

let modelReady = false;


/* =====================================================
   LOAD HOTSPOT JSON
===================================================== */

async function initialize() {

    try {

        const response =
            await fetch(
                "./printer-hotspots.json",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Could not load printer-hotspots.json"
            );

        }


        hotspots =
            await response.json();


        console.log(
            "✅ Hotspots JSON loaded:",
            hotspots
        );


        renderFeatureList();


        /*
            If model has already loaded,
            create hotspots immediately.
        */

        if (
            modelViewer.loaded ||
            modelReady
        ) {

            refreshHotspots();

        }

    }

    catch (error) {

        console.error(
            "❌ Hotspot loading error:",
            error
        );


        hotspotStatus.textContent =
            "Hotspots unavailable";


        featureList.innerHTML =
            `
            <div class="loading-message">
                Could not load product features.
            </div>
            `;

    }

}


initialize();


/* =====================================================
   MODEL LOADED
===================================================== */

modelViewer.addEventListener(
    "load",
    () => {

        console.log(
            "✅ Printer model loaded"
        );


        modelReady = true;


        refreshHotspots();

    }
);


/* =====================================================
   MODEL ERROR
===================================================== */

modelViewer.addEventListener(
    "error",
    (event) => {

        console.error(
            "❌ Model error:",
            event
        );


        hotspotStatus.textContent =
            "Model error";

    }
);


/* =====================================================
   REFRESH HOTSPOTS

   IMPORTANT:
   Used after returning from AR.
===================================================== */

function refreshHotspots() {

    console.log(
        "🔄 Refreshing hotspots..."
    );


    /*
        Remove ONLY dynamically
        generated hotspot elements.
    */

    modelViewer
        .querySelectorAll(
            ".generated-hotspot"
        )
        .forEach(
            element =>
                element.remove()
        );


    if (
        !hotspots ||
        hotspots.length === 0
    ) {

        hotspotStatus.textContent =
            "No hotspots";

        return;

    }


    /*
        Wait for model-viewer to finish
        returning to normal rendering.

        This is especially useful when
        coming back from Android AR.
    */

    requestAnimationFrame(
        () => {

            requestAnimationFrame(
                () => {

                    hotspots.forEach(
                        (hotspot, index) => {

                            createHotspot(
                                hotspot,
                                index
                            );

                        }
                    );


                    hotspotStatus.textContent =
                        `${hotspots.length} features`;


                    console.log(
                        `✅ ${hotspots.length} hotspots visible`
                    );

                }
            );

        }
    );

}


/* =====================================================
   CREATE ONE HOTSPOT
===================================================== */

function createHotspot(
    hotspot,
    index
) {

    const button =
        document.createElement(
            "button"
        );


    button.className =
        "hotspot generated-hotspot";


    /*
        Unique slot is required.
    */

    button.slot =
        `hotspot-${index + 1}`;


    button.type =
        "button";


    button.setAttribute(
        "aria-label",
        hotspot.name || "Product feature"
    );


    /* =================================================
       POSITION
    ================================================= */

    if (
        hotspot.position
    ) {

        button.setAttribute(
            "data-position",
            hotspot.position
        );

    }


    /* =================================================
       NORMAL
    ================================================= */

    if (
        hotspot.normal
    ) {

        button.setAttribute(
            "data-normal",
            hotspot.normal
        );

    }


    /* =================================================
       SURFACE

       Use exact surface data generated
       from Hotspot Editor.
    ================================================= */

    if (
        hotspot.surface
    ) {

        button.setAttribute(
            "data-surface",
            hotspot.surface
        );

    }


    /* =================================================
       DOT
    ================================================= */

    const dot =
        document.createElement(
            "span"
        );


    dot.className =
        "hotspot-dot";


    /* =================================================
       LABEL
    ================================================= */

    const label =
        document.createElement(
            "span"
        );


    label.className =
        "hotspot-label";


    label.textContent =
        hotspot.name ||
        `Feature ${index + 1}`;


    button.appendChild(
        dot
    );


    button.appendChild(
        label
    );


    /* =================================================
       HOTSPOT CLICK
    ================================================= */

    button.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            event.stopPropagation();


            openFeature(
                hotspot
            );

        }
    );


    /*
        Add hotspot back to
        <model-viewer>
    */

    modelViewer.appendChild(
        button
    );

}


/* =====================================================
   FEATURE LIST
===================================================== */

function renderFeatureList() {

    if (
        !hotspots ||
        hotspots.length === 0
    ) {

        featureList.innerHTML =
            `
            <div class="loading-message">
                No product features available.
            </div>
            `;

        return;

    }


    featureList.innerHTML =
        "";


    hotspots.forEach(
        (hotspot, index) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "feature-card";


            card.innerHTML =
                `
                <div class="feature-number">
                    ${index + 1}
                </div>

                <div class="feature-name">
                    ${escapeHTML(
                        hotspot.name ||
                        `Feature ${index + 1}`
                    )}
                </div>

                <div class="feature-action">
                    View feature →
                </div>
                `;


            card.addEventListener(
                "click",
                () => {

                    openFeature(
                        hotspot
                    );

                }
            );


            featureList.appendChild(
                card
            );

        }
    );

}


/* =====================================================
   OPEN FEATURE
===================================================== */

function openFeature(
    hotspot
) {

    console.log(
        "Opening:",
        hotspot.name
    );


    if (
        !hotspot.video
    ) {

        alert(
            `${hotspot.name}\n\nNo video assigned.`
        );

        return;

    }


    hotspotVideo.pause();


    hotspotVideo.currentTime =
        0;


    videoSource.src =
        hotspot.video;


    hotspotVideo.load();


    videoTitle.textContent =
        hotspot.name ||
        "Product Feature";


    videoModal.classList.add(
        "show"
    );


    hotspotVideo
        .play()
        .catch(
            error => {

                console.log(
                    "Video autoplay blocked:",
                    error
                );

            }
        );

}


/* =====================================================
   CLOSE VIDEO
===================================================== */

function closeVideoModal() {

    hotspotVideo.pause();


    hotspotVideo.currentTime =
        0;


    videoModal.classList.remove(
        "show"
    );

}


closeVideo.addEventListener(
    "click",
    closeVideoModal
);


videoModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            videoModal
        ) {

            closeVideoModal();

        }

    }
);


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "Escape"
        ) {

            closeVideoModal();

        }

    }
);


/* =====================================================
   AR STATUS

   Works for WebXR AR.
===================================================== */

modelViewer.addEventListener(
    "ar-status",
    event => {

        const status =
            event.detail.status;


        console.log(
            "📱 AR status:",
            status
        );


        if (
            status ===
            "session-started"
        ) {

            closeVideoModal();

        }


        /*
            When WebXR returns to
            normal 3D mode.
        */

        if (
            status ===
            "not-presenting"
        ) {

            console.log(
                "⬅ Returned from WebXR AR"
            );


            /*
                Small delay gives
                model-viewer time to
                restore its normal renderer.
            */

            setTimeout(
                () => {

                    refreshHotspots();

                },
                250
            );

        }

    }
);


/* =====================================================
   PAGE VISIBILITY

   VERY IMPORTANT FOR ANDROID SCENE VIEWER.

   Scene Viewer can leave the browser
   and open Google's external AR viewer.

   When user presses Back and returns
   to Chrome, this event runs.
===================================================== */

document.addEventListener(
    "visibilitychange",
    () => {

        console.log(
            "Page visibility:",
            document.visibilityState
        );


        if (
            document.visibilityState ===
            "visible"
        ) {

            console.log(
                "⬅ Page visible again"
            );


            setTimeout(
                () => {

                    refreshHotspots();

                },
                350
            );

        }

    }
);


/* =====================================================
   WINDOW FOCUS

   Extra Android fallback.

   Some devices return focus without
   behaving exactly the same way with
   visibilitychange.
===================================================== */

window.addEventListener(
    "focus",
    () => {

        console.log(
            "⬅ Window focused again"
        );


        setTimeout(
            () => {

                refreshHotspots();

            },
            350
        );

    }
);


/* =====================================================
   PAGE SHOW

   Handles browser restoring page
   from back/forward cache.
===================================================== */

window.addEventListener(
    "pageshow",
    () => {

        console.log(
            "📄 Page shown"
        );


        setTimeout(
            () => {

                if (
                    modelViewer.loaded ||
                    modelReady
                ) {

                    refreshHotspots();

                }

            },
            250
        );

    }
);


/* =====================================================
   SAFE HTML
===================================================== */

function escapeHTML(
    value
) {

    return String(
        value
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}