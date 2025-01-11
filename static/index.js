$("#logged-in").hide();
$("article").children().hide();
$("#mandelbrot-page").show();
$("#save-snapshot-button").prop("disabled", true);

let accessToken;

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
            $("#login-form").hide();
            $("#logged-in").show();
            $("#username-label").html(`Logged in as: ${data.username}`);
            $("#save-snapshot-button").prop("disabled", false);
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
    $("#save-snapshot-button").prop("disabled", true);
})

$("#about-button").on("click", () => {
    $("article").children().hide();
    $("#about-page").show();
})

$("#home-button").on("click", () => {
    $("article").children().hide();
    $("#mandelbrot-page").show();
})
