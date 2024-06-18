document.addEventListener('DOMContentLoaded', () => {
    const profilePicUpload = document.getElementById('profile-pic-upload');
    const profilePic = document.querySelector('.profile-pic img');
    const formElement = document.getElementById("edit-profile-form");

    profilePic.addEventListener('click', () => {
        profilePicUpload.click();
    });

    profilePicUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profilePic.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.target.closest('.user-card').remove();
        });
    });

});
