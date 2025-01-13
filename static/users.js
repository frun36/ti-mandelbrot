function userCard(userId, username, snapshotCount) {
    return `
        <div class="user-card">
            <h2>${username}${username === loggedInUsername ? " (you)" : ""}</h2>
            <p>Saved snapshots: ${snapshotCount}</p>
            <button onclick="viewUserSnapshots(${userId})">View snapshots</button>
        </div>
    `
}

function viewUserSnapshots(userId) {
    $("article").children().hide();
    $("#snapshots-page").show();

    loadSnapshots(userId);
}

function loadUsers() {
    $.ajax({
        url: "/api/users",
        type: "GET",
        success: (response) => {
            const html = response.map(
                u => userCard(u['id'], u['username'], u['snapshot_count'])
            ).join("\n");

            $("#users-page").html(html == "" ? "<p>No data</p>" : html);
        },
        error: (xhr, status, error) => alert(`Error: ${xhr.responseJSON['message']}`)
    })
}

$("#users-button").on("click", () => {
    $("article").children().hide();
    $("#users-page").show();

    loadUsers();
})