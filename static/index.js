$("#logged-in").hide();
$("article").children().hide();
$("#mandelbrot-page").show();
$("#save-snapshot-button").prop("disabled", true);

fetchMe((response) => {
    if (response) {
        displayLoggedIn(response["username"]);
    } else {
        console.log("Not logged in");
    }
})

function displayLoggedIn(username) {
    $("#login-form").hide();
    $("#logged-in").show();
    $("#username-label").html(`Logged in as: ${username}`);
    $("#save-snapshot-button").prop("disabled", false);
    loadUsers(username);
    loadSnapshots(username);
}

function displayLoggedOut() {
    $("#username-input").val("");
    $("#password-input").val("");
    $("#login-form").show();
    $("#logged-in").hide();
    $("#save-snapshot-button").prop("disabled", true);
    loadUsers();
    loadSnapshots();
}

function fetchMe(success) {
    $.ajax({
        url: "/api/users/me",
        type: "GET",
        success: (response) => {
            if (!response) {
                displayLoggedOut();
            }
            success(response);
        },
        error: (xhr, status, error) => alert(`Error: ${xhr.responseJSON['msg']}`)
    })
}

$("#login-button").on("click", () => {
    let data = {
        username: $("#username-input").val(),
        password: $("#password-input").val()
    };
    console.log(data);
    $.ajax({
        url: "/token/auth",
        type: "POST",
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: (response) => {
            console.log(response);
            displayLoggedIn(data.username);
        },
        error: (xhr, status, error) => alert(`Error: ${xhr.responseJSON['msg']}`)
    })
})

$("#logout-button").on("click", () => {
    $.ajax({
        url: "/token/remove",
        type: "POST",
        contentType: 'application/json',
        success: (response) => {
            console.log(response);
            displayLoggedOut();
        },
        error: (xhr, status, error) => alert(`Error: ${xhr.responseJSON['msg']}`)
    })
})

$("#about-button").on("click", () => {
    $("article").children().hide();
    $("#about-page").show();
})

$("#home-button").on("click", () => {
    $("article").children().hide();
    $("#mandelbrot-page").show();
})

$("#register-button").on("click", () => {
    const data = {
        username: $("#username-input").val(),
        password: $("#password-input").val()
    };

    $.ajax({
        url: "/api/register",
        type: "POST",
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: (response) => {
            loadUsers();
            alert(response["msg"]);
        },
        error: (xhr, status, error) => alert(`Error: ${xhr.responseJSON['msg']}`)
    })
})