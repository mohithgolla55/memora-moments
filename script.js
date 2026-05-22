document.addEventListener("DOMContentLoaded", () => {

    const sections = document.querySelectorAll(
    ".gallery img, .service-box");

    sections.forEach((item, index) => {

        item.style.opacity = "0";
        item.style.transform = "translateY(50px)";

        setTimeout(() => {

            item.style.transition = "all 1s ease";

            item.style.opacity = "1";

            item.style.transform = "translateY(0)";

        }, index * 150);

    });

});
window.addEventListener("load", () => {

    const loader =
    document.getElementById("loader");

    setTimeout(() => {

        loader.style.opacity = "0";

        loader.style.visibility = "hidden";

    }, 2000);

});
/* SCROLL PROGRESS */

window.addEventListener("scroll", () => {

    const scrollTop =
    document.documentElement.scrollTop;

    const scrollHeight =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;

    const scrollPercent =
    (scrollTop / scrollHeight) * 100;

    document.getElementById(
    "progress-bar").style.width =
    scrollPercent + "%";

});
