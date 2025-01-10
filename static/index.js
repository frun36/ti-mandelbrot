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
})