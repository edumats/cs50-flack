document.addEventListener('DOMContentLoaded', () => {

    // Disables submit button by default
    document.querySelector('#submit').disabled = true;

    // Activates on button release when inputting, if length is greater than 0, activates button, otherwise, stays deativated
    document.querySelector('#name').onkeyup = () => {
        if (document.querySelector('#name').value.length > 0)
            document.querySelector('#submit').disabled = false;
        else
            document.querySelector('#submit').disabled = true;
    };

    // When form is submitted, creates request
    document.querySelector('#form').onsubmit = () => {
        const request = new XMLHttpRequest();
        const displayName = document.querySelector('#name').value;
        request.open('POST', '/');
    };
});
