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
  "Flutter Developer...",
  "IOT Developer...",
  "Udemy Instructor...",
  "Python Developer...",
  "Data Sciencetist...",
  "Mojo Developer...",
  "JAVA Developer...",
  "C/C++ Developer...",
  "Cyber security Expert...",
  "Founder of FEKXS...",
  "Team Lead at FEKXS...",
  "PHP Developer...",
  "Founder of ResourceHuB...",
  "Founder of 124...",
  "C# developer...",
  "React Developer...",
  "MERN Developer...",
  "Angular Developer...",
  "ML Developer...",
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
