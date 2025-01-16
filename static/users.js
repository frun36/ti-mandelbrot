function userCard(userId, username, snapshotCount, loggedIn) {
    return `
        <div class="user-card">
            <h2>${username}${loggedIn ? " (you)" : ""}</h2>
            <p>Saved snapshots: ${snapshotCount}</p>
            <button onclick="viewUserSnapshots(${userId})">View snapshots</button>
        </div>
    `
}

function viewUserSnapshots(userId) {
    $("article").children().hide();
    $("#snapshots-page").show();

    fetchMe(response => {
        loadSnapshots(response?.username, userId);
    });
}

function loadUsers(loggedInUsername = null) {
    $.ajax({
        url: "/api/users",
        type: "GET",
        success: (response) => {
            const html = response.map(
                u => userCard(u['id'], u['username'], u['snapshot_count'], u['username'] === loggedInUsername)
            ).join("\n");

            $("#users-page").html(html == "" ? "<p>No data</p>" : html);
        },
        error: (xhr, status, error) => alert(`Error: ${xhr.responseJSON['msg']}`)
    })
}

$("#users-button").on("click", () => {
    $("article").children().hide();
    $("#users-page").show();

    fetchMe(response => {
        loadUsers(response?.username);
    });
})