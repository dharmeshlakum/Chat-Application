// Goup Form Javascript

document.getElementById('groupImage').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('group-img-icon').src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
});

document.getElementById('create-group-btn').addEventListener('click', function() {
    const formGroup = document.querySelector('.form-for-group');
    formGroup.style.display = formGroup.style.display === 'none' ? 'flex' : 'none';
});

document.body.addEventListener('click', function(event) {
    const formGroup = document.querySelector('.form-for-group');
    if (!formGroup.contains(event.target) && event.target.id !== 'create-group-btn') {
        formGroup.style.display = 'none';
    }
});

document.getElementById('group-create-form').addEventListener('submit', function(event) {
    event.preventDefault(); 
    const formData = new FormData(this);

    fetch('/create-group', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data.success) {
            alert(data.message);
            window.location.href = '/home';
        } else {
            alert('Error: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while creating the group.');
    });
});