const loginContainer = document.querySelector(".login-form-container");
const signupContainer = document.querySelector(".signup-form-container");

const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const signupDirectionBTN = document.getElementById("direct-to-signup");
const loginDirectionBTN = document.getElementById("direct-to-login");

signupDirectionBTN.addEventListener("click", ()=>{
    loginContainer.style.display = "none";
    signupContainer.style.display = "flex";
});

loginDirectionBTN.addEventListener("click", ()=>{
    loginContainer.style.display = "flex";
    signupContainer.style.display = "none";
});