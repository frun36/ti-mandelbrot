function snapshotCard(id, name, username, zoom, x, y, thumb, deletable) {
    return `
        <div class="snapshot-card">
            <img src="${thumb}" />
            <h2>${name}</h2>
            <p>Author: ${username}</p>
            <div class="snapshot-card-buttons">
                <button onclick="openSnapshot(${zoom}, ${x}, ${y})">Open</button>
                ${deletable ?
            '<button class="delete-button" onclick="deleteSnapshot(' + id + ')">Delete</button>'
            : ""}
            </div>
        </div>
    `
}

function loadSnapshots(userId=null) {
    $.ajax({
        url: userId ? `/api/snapshots/${userId}` : "/api/snapshots",
        type: "GET",
        success: (response) => {
            const html = response.map(
                s => snapshotCard(
                    s['snapshot_id'],
                    s['name'],
                    s['username'],
                    s['zoom'],
                    s['x'],
                    s['y'],
                    s['thumb_base64'],
                    s['username'] === loggedInUsername)
            ).join("\n");

            $("#snapshots-page").html(html == "" ? "<p>No data</p>" : html);
        },
        error: (xhr, status, error) => alert(`Error: ${xhr.responseJSON['message']}`)
    })
}

$("#snapshots-button").on("click", () => {
    $("article").children().hide();
    $("#snapshots-page").show();

    loadSnapshots();
})

function deleteSnapshot(snapshotId) {
    $.ajax({
        url: `/api/snapshots/${snapshotId}`,
        type: "DELETE",
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
        success: (response) => {
            loadSnapshots();
            alert(response["message"]);
        },
        error: (xhr, status, error) => alert(`Error: ${xhr.responseJSON['message']}`)
    })
}

function openSnapshot(zoom, xCenter, yCenter) {
    import('./mandelbrot.js').then(m => {
        m.s.zoom = zoom
        m.s.xCenter = xCenter
        m.s.yCenter = yCenter

        m.s.show();
        m.draw();
    });

    $("article").children().hide();
    $("#mandelbrot-page").show();
}