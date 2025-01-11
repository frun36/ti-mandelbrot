function userCard(userId, username, snapshotCount) {
    return `
        <div class="user-card">
            <h2>${username}</h2>
            <p>Saved snapshots: ${snapshotCount}</p>
            <button onclick="viewSnapshots(${userId})">View snapshots</button>
        </div>
    `
}

function viewUsers() {
    $("article").children().hide();
    $("#users-page").show();

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
    viewUsers();
})