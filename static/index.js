$("#logged-in").hide();
$("article").children().hide();
$("#mandelbrot-page").show();
$("#save-snapshot-button").prop("disabled", true);

let accessToken;
let loggedInUsername;

$("#login-button").on("click", () => {
    let data = {
        username: $("#username-input").val(),
        password: $("#password-input").val()
    };
    console.log(data);
    $.ajax({
        url: "/api/login",
        type: "POST",
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: (response) => {
            accessToken = response['accessToken'];
            loggedInUsername = data.username;
            $("#login-form").hide();
            $("#logged-in").show();
            $("#username-label").html(`Logged in as: ${data.username}`);
            $("#save-snapshot-button").prop("disabled", false);
            loadUsers();
            loadSnapshots();
        },
        error: (xhr, status, error) => alert(`Error: ${xhr.responseJSON['message']}`)
    })
})

$("#logout-button").on("click", () => {
    accessToken = null;
    loggedInUsername = null;
    $("#username-input").val("");
    $("#password-input").val("");
    $("#login-form").show();
    $("#logged-in").hide();
    $("#save-snapshot-button").prop("disabled", true);
    loadUsers();
    loadSnapshots();
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
            alert(response["message"]);
        },
        error: (xhr, status, error) => alert(`Error: ${xhr.responseJSON['message']}`)
    })
})