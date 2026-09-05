/* =========================
   GET ELEMENTS
========================= */

const modelViewer =
    document.querySelector("#printerModel");

const videoModal =
    document.querySelector("#videoModal");

const hotspotVideo =
    document.querySelector("#hotspotVideo");

const videoSource =
    document.querySelector("#videoSource");

const closeVideo =
    document.querySelector("#closeVideo");

const hotspots =
    document.querySelectorAll(".hotspot");



/* =========================
   MODEL LOADED
========================= */

modelViewer.addEventListener(
    "load",
    () => {

        console.log(
            "3D Model Loaded Successfully"
        );

    }
);



/* =========================
   MODEL ERROR
========================= */

modelViewer.addEventListener(
    "error",
    (event) => {

        console.error(
            "3D Model Error:",
            event
        );

    }
);



/* =========================
   AR STATUS
========================= */

/*
    When AR starts:

    - Hide all hotspots
    - Close video if open
*/

modelViewer.addEventListener(
    "ar-status",
    (event) => {

        const status =
            event.detail.status;


        console.log(
            "AR Status:",
            status
        );


        /* =========================
           AR SESSION STARTED
        ========================= */

        if (
            status === "session-started"
        ) {

            /* Hide hotspots */

            hotspots.forEach(
                (hotspot) => {

                    hotspot.style.display =
                        "none";

                }
            );


            /* Close video modal */

            closeVideoModal();

        }


        /* =========================
           AR SESSION ENDED
        ========================= */

        if (
            status === "not-presenting"
        ) {

            /* Show hotspots again */

            hotspots.forEach(
                (hotspot) => {

                    hotspot.style.display =
                        "";

                }
            );

        }

    }
);



/* =========================
   HOTSPOT CLICK
========================= */

hotspots.forEach(
    (hotspot) => {

        hotspot.addEventListener(
            "click",
            () => {

                const videoPath =
                    hotspot.dataset.video;


                console.log(
                    "Hotspot clicked:",
                    videoPath
                );


                /* Stop old video */

                hotspotVideo.pause();

                hotspotVideo.currentTime = 0;


                /* Set selected video */

                videoSource.src =
                    videoPath;


                /* Reload video */

                hotspotVideo.load();


                /* Open modal */

                videoModal.classList.add(
                    "show"
                );


                /* Play video */

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
        );

    }
);



/* =========================
   CLOSE VIDEO FUNCTION
========================= */

function closeVideoModal() {

    /* Pause video */

    hotspotVideo.pause();


    /* Reset video */

    hotspotVideo.currentTime = 0;


    /* Close modal */

    videoModal.classList.remove(
        "show"
    );

}



/* =========================
   CLOSE BUTTON
========================= */

closeVideo.addEventListener(
    "click",
    closeVideoModal
);



/* =========================
   CLICK OUTSIDE VIDEO
========================= */

videoModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target === videoModal
        ) {

            closeVideoModal();

        }

    }
);



/* =========================
   ESC KEY
========================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape"
        ) {

            closeVideoModal();

        }

    }
);