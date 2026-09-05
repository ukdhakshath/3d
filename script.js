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

let isARActive = false;


/* =====================================================
   INITIALIZE
===================================================== */

async function initialize() {

    try {

        console.log("Loading hotspot JSON...");


        const response =
            await fetch(
                "./printer-hotspots.json",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Hotspot JSON error: ${response.status}`
            );

        }


        hotspots =
            await response.json();


        console.log(
            "✅ Hotspots loaded:",
            hotspots
        );


        /* =============================================
           FEATURE LIST
        ============================================= */

        renderFeatureList();


        /*
            Sometimes the model may already
            be loaded before JSON finishes.
        */

        if (
            modelViewer.loaded ||
            modelReady
        ) {

            renderHotspots();

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
                Product features could not be loaded.
            </div>
            `;

    }

}


/* =====================================================
   START
===================================================== */

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


        /*
            Create hotspots only in
            normal 3D mode.
        */

        if (!isARActive) {

            renderHotspots();

        }

    }
);


/* =====================================================
   MODEL ERROR
===================================================== */

modelViewer.addEventListener(
    "error",
    (event) => {

        console.error(
            "❌ 3D model error:",
            event
        );


        hotspotStatus.textContent =
            "Model error";

    }
);


/* =====================================================
   RENDER HOTSPOTS
===================================================== */

function renderHotspots() {

    /*
        Do not show hotspots while
        AR is active.
    */

    if (isARActive) {

        console.log(
            "AR active. Hotspots will not be rendered."
        );

        return;

    }


    /*
        Remove old generated hotspots.

        This prevents duplicates.
    */

    modelViewer
        .querySelectorAll(
            ".generated-hotspot"
        )
        .forEach(
            (element) => {

                element.remove();

            }
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
        Create all hotspots from JSON.
    */

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
        `✅ ${hotspots.length} hotspots rendered`
    );

}


/* =====================================================
   CREATE HOTSPOT
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


    button.type =
        "button";


    /*
        Every model-viewer hotspot
        needs a unique slot.
    */

    button.slot =
        `hotspot-${index + 1}`;


    button.setAttribute(
        "aria-label",
        hotspot.name ||
        `Feature ${index + 1}`
    );


    /* =================================================
       POSITION
    ================================================= */

    if (hotspot.position) {

        button.setAttribute(
            "data-position",
            hotspot.position
        );

    }


    /* =================================================
       NORMAL
    ================================================= */

    if (hotspot.normal) {

        button.setAttribute(
            "data-normal",
            hotspot.normal
        );

    }


    /* =================================================
       SURFACE

       Exact surface information created
       by your Hotspot Editor.
    ================================================= */

    if (hotspot.surface) {

        button.setAttribute(
            "data-surface",
            hotspot.surface
        );

    }


    /* =================================================
       HOTSPOT DOT
    ================================================= */

    const dot =
        document.createElement(
            "span"
        );


    dot.className =
        "hotspot-dot";


    /* =================================================
       HOTSPOT LABEL
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


            /*
                Safety:

                Hotspot should do nothing
                if AR is active.
            */

            if (isARActive) {

                return;

            }


            openFeature(
                hotspot
            );

        }
    );


    /* =================================================
       ADD TO MODEL VIEWER
    ================================================= */

    modelViewer.appendChild(
        button
    );

}


/* =====================================================
   HIDE HOTSPOTS

   Called when entering AR.
===================================================== */

function hideHotspots() {

    console.log(
        "🙈 Hiding hotspots"
    );


    modelViewer
        .querySelectorAll(
            ".generated-hotspot"
        )
        .forEach(
            (hotspot) => {

                hotspot.style.display =
                    "none";

            }
        );


    hotspotStatus.textContent =
        "AR Mode";

}


/* =====================================================
   SHOW HOTSPOTS

   Called after returning from AR.
===================================================== */

function showHotspots() {

    /*
        Don't show if AR is
        actually still running.
    */

    if (isARActive) {

        return;

    }


    console.log(
        "👁 Showing hotspots"
    );


    const existingHotspots =
        modelViewer.querySelectorAll(
            ".generated-hotspot"
        );


    /*
        If hotspots somehow disappeared
        during AR, rebuild them.
    */

    if (
        existingHotspots.length !==
        hotspots.length
    ) {

        console.log(
            "Some hotspots missing. Rebuilding..."
        );


        renderHotspots();

        return;

    }


    /*
        Otherwise simply show them again.
    */

    existingHotspots.forEach(
        (hotspot) => {

            hotspot.style.display =
                "flex";

        }
    );


    hotspotStatus.textContent =
        `${hotspots.length} features`;

}


/* =====================================================
   RESTORE AFTER AR

   Android Scene Viewer may need a small
   amount of time before model-viewer is
   ready again.
===================================================== */

function restoreNormalView() {

    console.log(
        "⬅ Restoring normal 3D view"
    );


    isARActive =
        false;


    /*
        First attempt.
    */

    setTimeout(
        () => {

            showHotspots();

        },
        300
    );


    /*
        Second fallback.

        Useful on slower phones.
    */

    setTimeout(
        () => {

            showHotspots();

        },
        700
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

                    /*
                        Feature list also
                        shouldn't work in AR.
                    */

                    if (isARActive) {

                        return;

                    }


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
   OPEN FEATURE VIDEO
===================================================== */

function openFeature(
    hotspot
) {

    /*
        Extra AR protection.
    */

    if (isARActive) {

        return;

    }


    console.log(
        "Opening feature:",
        hotspot.name
    );


    if (!hotspot.video) {

        alert(
            `${hotspot.name}\n\nNo video assigned for this feature.`
        );

        return;

    }


    /*
        Stop previous video.
    */

    hotspotVideo.pause();


    hotspotVideo.currentTime =
        0;


    /*
        Set new video.
    */

    videoSource.src =
        hotspot.video;


    hotspotVideo.load();


    /*
        Set title.
    */

    videoTitle.textContent =
        hotspot.name ||
        "Product Feature";


    /*
        Open modal.
    */

    videoModal.classList.add(
        "show"
    );


    /*
        Try to play.

        Some browsers may block autoplay.
    */

    hotspotVideo
        .play()
        .catch(
            (error) => {

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


/* =====================================================
   CLOSE BUTTON
===================================================== */

closeVideo.addEventListener(
    "click",
    closeVideoModal
);


/* =====================================================
   CLICK OUTSIDE VIDEO
===================================================== */

videoModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            videoModal
        ) {

            closeVideoModal();

        }

    }
);


/* =====================================================
   ESC KEY
===================================================== */

document.addEventListener(
    "keydown",
    (event) => {

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

   Mainly used for WebXR.
===================================================== */

modelViewer.addEventListener(
    "ar-status",
    (event) => {

        const status =
            event.detail.status;


        console.log(
            "📱 AR status:",
            status
        );


        /* =============================================
           AR STARTED
        ============================================= */

        if (
            status ===
            "session-started"
        ) {

            console.log(
                "📱 Entered AR"
            );


            isARActive =
                true;


            /*
                Video should never remain
                open while entering AR.
            */

            closeVideoModal();


            /*
                Hide all normal 3D hotspots.
            */

            hideHotspots();

        }


        /* =============================================
           RETURNED FROM WEBXR AR
        ============================================= */

        if (
            status ===
            "not-presenting"
        ) {

            console.log(
                "⬅ AR stopped"
            );


            restoreNormalView();

        }


        /* =============================================
           AR FAILED
        ============================================= */

        if (
            status ===
            "failed"
        ) {

            console.log(
                "AR failed / cancelled"
            );


            restoreNormalView();

        }

    }
);


/* =====================================================
   PAGE VISIBILITY

   IMPORTANT FOR ANDROID SCENE VIEWER.

   Android may open Scene Viewer outside
   Chrome.

   When user returns to Chrome,
   visibility becomes "visible".
===================================================== */

document.addEventListener(
    "visibilitychange",
    () => {

        console.log(
            "Visibility:",
            document.visibilityState
        );


        /* =============================================
           LEFT BROWSER FOR EXTERNAL AR
        ============================================= */

        if (
            document.visibilityState ===
            "hidden"
        ) {

            /*
                We don't automatically assume
                every hidden event means AR.

                But if model-viewer has just
                launched Scene Viewer, hiding
                hotspots is harmless.
            */

            closeVideoModal();

        }


        /* =============================================
           RETURNED TO BROWSER
        ============================================= */

        if (
            document.visibilityState ===
            "visible"
        ) {

            console.log(
                "⬅ Browser visible again"
            );


            restoreNormalView();

        }

    }
);


/* =====================================================
   WINDOW FOCUS

   Additional Android fallback.
===================================================== */

window.addEventListener(
    "focus",
    () => {

        /*
            Ignore initial focus before
            model is ready.
        */

        if (!modelReady) {

            return;

        }


        console.log(
            "⬅ Browser focused"
        );


        /*
            Only restore if page is visible.
        */

        if (
            document.visibilityState ===
            "visible"
        ) {

            restoreNormalView();

        }

    }
);


/* =====================================================
   PAGE SHOW

   Handles Chrome restoring the webpage
   from its back/forward cache.
===================================================== */

window.addEventListener(
    "pageshow",
    () => {

        if (!modelReady) {

            return;

        }


        console.log(
            "📄 Page shown"
        );


        if (
            document.visibilityState ===
            "visible"
        ) {

            restoreNormalView();

        }

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