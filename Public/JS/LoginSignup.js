const signupBTN = document.getElementById("signup-page-direct-btn");
const signupPage = document.querySelector(".signup-container");
const loginBTN = document.getElementById("login-page-direct-btn");
const loginPage = document.querySelector(".login-container");

signupBTN.addEventListener("click", function(){
    loginPage.classList.add("slide-out-left");
    setTimeout(() => {
        loginPage.style.display = "none";
        signupPage.style.display = "flex";
        signupPage.classList.add("slide-in-right");
    }, 500);
    setTimeout(() => {
        loginPage.classList.remove("slide-out-left");
        signupPage.classList.remove("slide-in-right");
    }, 1000);
});

loginBTN.addEventListener("click", function(){
    signupPage.classList.add("slide-out-right");
    setTimeout(() => {
        signupPage.style.display = "none";
        loginPage.style.display = "flex";
        loginPage.classList.add("slide-in-left");
    }, 500);
    setTimeout(() => {
        signupPage.classList.remove("slide-out-right");
        loginPage.classList.remove("slide-in-left");
    }, 1000);
});
