/* =====================================================
   ELEMENTS
===================================================== */

const modelViewer =
    document.querySelector(
        "#printerModel"
    );


const hotspotStatus =
    document.querySelector(
        "#hotspotStatus"
    );


const featureList =
    document.querySelector(
        "#featureList"
    );


const videoModal =
    document.querySelector(
        "#videoModal"
    );


const hotspotVideo =
    document.querySelector(
        "#hotspotVideo"
    );


const videoSource =
    document.querySelector(
        "#videoSource"
    );


const videoTitle =
    document.querySelector(
        "#videoTitle"
    );


const closeVideo =
    document.querySelector(
        "#closeVideo"
    );


/* =====================================================
   HOTSPOT DATA
===================================================== */

let hotspots =
    [];


/* =====================================================
   START
===================================================== */

async function initialize() {

    try {

        /*
            Load the exported JSON created
            using your Hotspot Editor.
        */

        const response =
            await fetch(
                "./printer-hotspots.json"
            );


        if (
            !response.ok
        ) {

            throw new Error(
                "Could not load hotspot JSON."
            );

        }


        hotspots =
            await response.json();


        console.log(
            "Hotspots loaded:",
            hotspots
        );


        /*
            Wait for model-viewer model
            before adding hotspot DOM.
        */

        if (
            modelViewer.loaded
        ) {

            renderHotspots();

        }


        renderFeatureList();

    } catch (
        error
    ) {

        console.error(
            "Hotspot loading error:",
            error
        );


        hotspotStatus.textContent =
            "Hotspots unavailable";


        featureList.innerHTML =
            `
            <div class="loading-message">
                Product hotspot information
                could not be loaded.
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


        renderHotspots();

    }
);


/* =====================================================
   MODEL ERROR
===================================================== */

modelViewer.addEventListener(
    "error",
    (event) => {

        console.error(
            "3D model error:",
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
        Remove any previously generated
        hotspot buttons first.
    */

    modelViewer
        .querySelectorAll(
            ".generated-hotspot"
        )
        .forEach(
            (element) =>
                element.remove()
        );


    if (
        hotspots.length ===
        0
    ) {

        hotspotStatus.textContent =
            "No hotspots";

        return;
    }


    hotspots.forEach(
        (
            hotspot,
            index
        ) => {

            createHotspot(
                hotspot,
                index
            );

        }
    );


    hotspotStatus.textContent =
        `${hotspots.length} features`;

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


    /*
        Important:

        Each hotspot requires
        its own unique slot.
    */

    button.slot =
        `hotspot-${index + 1}`;


    button.setAttribute(
        "aria-label",
        hotspot.name
    );


    /*
        Position + normal are kept.

        They are a reliable fallback
        even when surface isn't available.
    */

    if (
        hotspot.position
    ) {

        button.setAttribute(
            "data-position",
            hotspot.position
        );

    }


    if (
        hotspot.normal
    ) {

        button.setAttribute(
            "data-normal",
            hotspot.normal
        );

    }


    /*
        Prefer exact surface attachment.

        This was generated using the
        Hotspot Editor.
    */

    if (
        hotspot.surface
    ) {

        button.setAttribute(
            "data-surface",
            hotspot.surface
        );

    }


    /* =========================
       DOT
    ========================= */

    const dot =
        document.createElement(
            "span"
        );


    dot.className =
        "hotspot-dot";


    /* =========================
       LABEL
    ========================= */

    const label =
        document.createElement(
            "span"
        );


    label.className =
        "hotspot-label";


    label.textContent =
        hotspot.name;


    button.appendChild(
        dot
    );


    button.appendChild(
        label
    );


    /* =========================
       CLICK
    ========================= */

    button.addEventListener(
        "click",
        (
            event
        ) => {

            /*
                Don't let click interfere
                with model rotation.
            */

            event.stopPropagation();


            openFeature(
                hotspot
            );

        }
    );


    modelViewer.appendChild(
        button
    );

}


/* =====================================================
   FEATURE LIST
===================================================== */

function renderFeatureList() {

    if (
        hotspots.length ===
        0
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
        (
            hotspot,
            index
        ) => {

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
                        hotspot.name
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
   OPEN FEATURE VIDEO
===================================================== */

function openFeature(
    hotspot
) {

    console.log(
        "Opening hotspot:",
        hotspot.name
    );


    if (
        !hotspot.video
    ) {

        alert(
            `${hotspot.name}\n\nNo video is assigned for this feature.`
        );

        return;
    }


    /*
        Stop previously playing video.
    */

    hotspotVideo.pause();


    hotspotVideo.currentTime =
        0;


    /*
        Load selected video.
    */

    videoSource.src =
        hotspot.video;


    hotspotVideo.load();


    /*
        Modal title.
    */

    videoTitle.textContent =
        hotspot.name;


    videoModal.classList.add(
        "show"
    );


    /*
        Try autoplay.

        Browser may block autoplay,
        but controls are still available.
    */

    hotspotVideo
        .play()
        .catch(
            (error) => {

                console.log(
                    "Autoplay blocked:",
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
    (
        event
    ) => {

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
    (
        event
    ) => {

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
===================================================== */

modelViewer.addEventListener(
    "ar-status",
    (
        event
    ) => {

        const status =
            event.detail.status;


        console.log(
            "AR status:",
            status
        );


        /*
            Close video if user
            enters AR.
        */

        if (
            status ===
            "session-started"
        ) {

            closeVideoModal();

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