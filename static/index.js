$("#logged-in").hide();
$("article").children().hide();
$("#mandelbrot-page").show();

let accessToken;

$("#login-button").on("click", () => {
    let data = {
        username: $("#username-input").val(),
        password: $("#password-input").val()
    };
    console.log(data);
    $.ajax({
        url: "/api/auth",
        type: "POST",
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: (response) => {
            accessToken = response['accessToken'];
            $("#login-form").hide();
            $("#logged-in").show();
            $("#username-label").html(`Logged in as: ${data.username}`);
            $("#save-view-button").prop("disabled", false);
        },
        error: (xhr, status, error) => alert(`Error: ${xhr.responseJSON['message']}`)
    })
})

$("#logout-button").on("click", () => {
    accessToken = null;
    $("#username-input").val("");
    $("#password-input").val("");
    $("#login-form").show();
    $("#logged-in").hide();
    $("#save-view-button").prop("disabled", true);
})

$("#about-button").on("click", () => {
    $("article").children().hide();
    $("#about-page").show();
})

$("#home-button").on("click", () => {
    $("article").children().hide();
    $("#mandelbrot-page").show();
})

$("#users-button").on("click", () => {
    $("article").children().hide();
    $("#users-page").show();
})

$("#snapshots-button").on("click", () => {
    $("article").children().hide();
    $("#snapshots-page").show();
})