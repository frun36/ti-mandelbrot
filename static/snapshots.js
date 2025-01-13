
function snapshotCard(name, username, zoom, x, y, thumb) {
    return `
        <div class="snapshot-card">
            <img src="${thumb}" />
            <h2>${name}</h2>
            <h3>Author: ${username}</h3>
            <button onclick="openSnapshot(${zoom}, ${x}, ${y})">Open</button>
        </div>
    `
}

function viewSnapshots(userId) {
    console.log("Called");

    $("article").children().hide();
    $("#snapshots-page").show();

    $.ajax({
        url: userId ? `/api/snapshots/${userId}` : "/api/snapshots",
        type: "GET",
        success: (response) => {
            const html = response.map(
                s => snapshotCard(s['name'], s['username'], s['zoom'], s['x'], s['y'], s['thumb_base64'])
            ).join("\n");

            $("#snapshots-page").html(html == "" ? "<p>No data</p>" : html);
        },
        error: (xhr, status, error) => alert(`Error: ${xhr.responseJSON['message']}`)
    })
}

$("#snapshots-button").on("click", () => {
    viewSnapshots();
})

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