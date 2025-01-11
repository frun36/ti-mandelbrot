
function snapshotCard(thumb, name) {
    return `
        <div class="snapshot-card">
            <img src="${thumb}" />
            <h2>${name}</h2>
            <button>Open</button>
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
                s => snapshotCard(s['thumb_base64'], s['name'])
            ).join("\n");

            $("#snapshots-page").html(html == "" ? "<p>No data</p>" : html);
        },
        error: (xhr, status, error) => alert(`Error: ${xhr.responseJSON['message']}`)
    })
}

$("#snapshots-button").on("click", () => {
    viewSnapshots();
})