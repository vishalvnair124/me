// Function to handle sidebar and menu button behavior based on screen size
function adjustSidebarAndMenuButton() {
  const menuToggle = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");
  const menuBtn = document.querySelector(".menu-btn");

  // Add event listener for menu toggle change
  menuToggle.addEventListener("change", function () {
    if (this.checked) {
      sidebar.classList.add("open");
      if (window.innerWidth <= 639) {
        menuBtn.style.display = "none"; // Hide menu toggle button on mobile
      }
    } else {
      sidebar.classList.remove("open");
      if (window.innerWidth <= 639) {
        menuBtn.style.display = "inline-block"; // Show menu toggle button on mobile
      }
    }
  });

  // Add event listener for close button click
  document.getElementById("closeBtn").addEventListener("click", function () {
    menuToggle.checked = false;
    sidebar.classList.remove("open");
    if (window.innerWidth <= 639) {
      menuBtn.style.display = "inline-block"; // Show menu toggle button on mobile when sidebar is closed
    }
  });

  // Add event listener for theme toggle change
  // document
  //   .getElementById("theme-toggle")
  //   .addEventListener("change", function () {
  //     document.body.classList.toggle("dark");
  //   });

  // Function to adjust menu button visibility based on screen width
  function adjustMenuButtonVisibility() {
    if (window.innerWidth <= 639) {
      // For mobile screens
      if (sidebar.classList.contains("open")) {
        menuBtn.style.display = "none"; // Hide menu toggle button when sidebar is open
      } else {
        menuBtn.style.display = "inline-block"; // Show menu toggle button when sidebar is closed
      }
    } else {
      // For laptop screens and larger
      menuBtn.style.display = "none"; // Always hide menu toggle button on larger screens
    }
  }

  // Initial adjustment on page load
  adjustMenuButtonVisibility();

  // Event listener for window resize to adjust menu button visibility
  window.addEventListener("resize", adjustMenuButtonVisibility);
}

// Call the adjustSidebarAndMenuButton function to initialize behavior
adjustSidebarAndMenuButton();

function toggleColorScheme() {
  const body = document.body;
  const switches = document.querySelectorAll("#theme-toggle");
  const isDarkMode = body.classList.toggle("dark");
  // console.log(isDarkMode);
  // Save the current theme mode to localStorage
  localStorage.setItem("mode", isDarkMode ? "dark" : "light");

  // Update the switches
  switches.forEach((switchEl) => (switchEl.checked = isDarkMode));
}

function didChangeColor() {
  const savedMode = localStorage.getItem("mode");
  // console.log(savedMode);
  // Apply the saved mode if it exists
  if (savedMode) {
    const isDarkMode = savedMode === "dark";
    document.body.classList.toggle("dark", isDarkMode);

    // Update the switches
    const switches = document.querySelectorAll("#theme-toggle");
    switches.forEach((switchEl) => (switchEl.checked = isDarkMode));
  }
}

// Initialize the color scheme on page load
didChangeColor();

function toggleMenu() {}

var texts = [
  "Web Developer...",
  "JAVA Developer...",
  "Python Developer...",
  "PHP Developer...",
  "Spring Boot Developer...",
  "Founder of NoBugTech Solution...",
  "Flutter Developer...",
  // "Devops Engineer",
  // "Cloud Engineer",
  // "ML Developer...",
  // "ex Team Lead at NoBugTech Solution...",
  // "C/C++ Developer...",
  // "IOT Developer...",
  // "Udemy Instructor...",
  // "Founder of ResourceHuB...",
  // "Founder of 124...",
  
];

var currentTextIndex = 0;
var currentCharIndex = 0;
var speed = 100;

function typewriter() {
  if (currentTextIndex < texts.length) {
    var currentText = texts[currentTextIndex];
    if (currentCharIndex < currentText.length) {
      document.getElementById("typing-msg").innerHTML +=
        currentText.charAt(currentCharIndex);
      currentCharIndex++;
      setTimeout(typewriter, speed);
    } else {
      // Move to the next line of text after a short delay
      setTimeout(() => {
        document.getElementById("typing-msg").innerHTML = ""; // Clear the content
        currentTextIndex++;
        currentCharIndex = 0; // Reset character index for the new line
        if (currentTextIndex >= texts.length) {
          currentTextIndex = 0; // Reset text index to restart
        }
        typewriter();
      }, 1000); // Adjust delay as needed
    }
  }
}

typewriter();

const scrollers = document.querySelectorAll(".scroller");

// If a user hasn't opted in for recuded motion, then we add the animation
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  addAnimation();
}

function addAnimation() {
  scrollers.forEach((scroller) => {
    // add data-animated="true" to every `.scroller` on the page
    scroller.setAttribute("data-animated", true);

    // Make an array from the elements within `.scroller-inner`
    const scrollerInner = scroller.querySelector(".scroller__inner");
    const scrollerContent = Array.from(scrollerInner.children);

    // For each item in the array, clone it
    // add aria-hidden to it
    // add it into the `.scroller-inner`
    scrollerContent.forEach((item) => {
      const duplicatedItem = item.cloneNode(true);
      duplicatedItem.setAttribute("aria-hidden", true);
      duplicatedItem.inert = true;
      scrollerInner.appendChild(duplicatedItem);
    });
  });
}

const certificateScroller = document.querySelector(".certificate-scroller");
const certificateDialog = document.querySelector(".certificate-dialog");

if (
  certificateScroller &&
  certificateDialog &&
  typeof certificateDialog.showModal === "function"
) {
  const certificateDialogTitle = certificateDialog.querySelector(
    "#certificate-dialog-title",
  );
  const certificateDialogImage = certificateDialog.querySelector(
    ".certificate-dialog-image",
  );

  certificateScroller.querySelectorAll(".certificate-card img").forEach((image) => {
    const setOrientation = () => {
      const isPortrait = image.naturalHeight > image.naturalWidth;
      image.closest(".certificate-card").dataset.orientation = isPortrait
        ? "portrait"
        : "landscape";
    };

    if (image.complete && image.naturalWidth > 0) {
      setOrientation();
    } else {
      image.addEventListener("load", setOrientation, { once: true });
    }
  });

  certificateScroller.addEventListener("click", (event) => {
    const card = event.target.closest(".certificate-card");

    if (!card || !certificateScroller.contains(card)) {
      return;
    }

    const image = card.querySelector("img");
    certificateDialog.dataset.orientation = card.dataset.orientation;
    certificateDialogTitle.textContent = card.dataset.title;
    certificateDialogImage.src = image.currentSrc || image.src;
    certificateDialogImage.alt = card.dataset.title;
    certificateDialog.showModal();
  });

  certificateDialog
    .querySelector(".certificate-dialog-close")
    .addEventListener("click", () => certificateDialog.close());

  certificateDialog.addEventListener("click", (event) => {
    if (event.target === certificateDialog) {
      certificateDialog.close();
    }
  });

  certificateDialog.addEventListener("close", () => {
    delete certificateDialog.dataset.orientation;
  });
}

const timeline = document.querySelector(".timeline");
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

if (timeline && "IntersectionObserver" in window && !prefersReducedMotion) {
  timeline.classList.add("timeline--revealing");

  const timelineObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );

  timeline.querySelectorAll(".container").forEach((event) => {
    timelineObserver.observe(event);
  });
}
