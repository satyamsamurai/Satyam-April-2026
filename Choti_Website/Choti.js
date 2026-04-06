// Get elements
const myUsername = document.getElementById("myusrnm");
const myPassword = document.getElementById("mypswd");
const loginButton = document.getElementById("lgnbtn");

// Add click event listener
loginButton.addEventListener("click", function () {

    const usernameValue = myUsername.value.trim();
    const passwordValue = myPassword.value.trim();

    if (usernameValue === "choti" && passwordValue === "choti123") {
        // alert("Login successful!");
        window.location.href = "Choti1.html";
    } else {
        alert("Invalid username or password. Please try again.");
    }

});