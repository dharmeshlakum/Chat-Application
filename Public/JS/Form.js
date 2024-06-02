const loginContainer = document.querySelector(".login-form-container");
const signupContainer = document.querySelector(".signup-form-container");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const signupDirectionBTN = document.getElementById("direct-to-signup");
const loginDirectionBTN = document.getElementById("direct-to-login");

signupDirectionBTN.addEventListener("click", () => {
    loginContainer.classList.add("slide-out-left");

    setTimeout(() => {
        loginContainer.style.display = "none";
        signupContainer.style.display = "flex";
        signupContainer.classList.add("slide-in-right");
    }, 500);

    setTimeout(() => {
        loginContainer.classList.remove("slide-out-left");
        signupContainer.classList.remove("slide-in-right");
    }, 1000);
});

loginDirectionBTN.addEventListener("click", () => {
    signupContainer.classList.add("slide-out-left");

    setTimeout(() => {
        loginContainer.style.display = "flex";
        signupContainer.style.display = "none";
        loginContainer.classList.add("slide-in-left");
    }, 500);

    setTimeout(() => {
        signupContainer.classList.remove("slide-out-left");
        loginContainer.classList.remove("slide-in-left");
    }, 1000);
});

async function handleSubmit (event, url, redirectTo = null){
    event.preventDefault();
    const formData = new FormData(event.target);
    const formObject = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formObject)
        });

        if(!response.ok){
            const data = await response.json();
            alert(data);
        }

        if(redirectTo){
            window.location.href = redirectTo
        }
        
    } catch (error) {
        alert(error)
    }
}

loginForm.addEventListener("submit", (Event)=>{
    handleSubmit(Event, "/login", "/")
});

signupForm.addEventListener("submit", (Event)=>{
    handleSubmit(Event, "/signup", "/login")
})