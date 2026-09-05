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
   HOTSPOT CLICK
========================= */

hotspots.forEach(
    (hotspot) => {

        hotspot.addEventListener(
            "click",
            () => {

                const videoPath =
                    hotspot.dataset.video;


                /* Stop old video */

                hotspotVideo.pause();

                hotspotVideo.currentTime = 0;


                /* Set new video */

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
   CLOSE VIDEO
========================= */

function closeVideoModal() {

    hotspotVideo.pause();

    hotspotVideo.currentTime = 0;


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