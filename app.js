let allData = [];

function loadFiles() {

    const files =
        document.getElementById("csvFile").files;

    if(files.length === 0){
        alert("CSV 파일을 선택하세요.");
        return;
    }

    Array.from(files).forEach(file => {

        Papa.parse(file, {

            header: true,
            skipEmptyLines: true,

            complete: function(results){

                const rows = results.data;

                rows.forEach(row=>{

                    allData.push({

                        releaseDate:
                            row["Release Date"] || "",

                        productionOrder:
                            row["Production Order Number"] || "",

                        targetDevice:
                            row["Production Order Build-As Part"] || "",

                        newBatch:
                            row["New Build-As Batch"] || "",

                        shipTo:
                            row["Ship To"] || "",

                        bridgeBatch:
                            row["Bridge Batches"] || ""

                    });

                });

                renderTable(allData);

            }

        });

    });

}

function renderTable(data){

    document.getElementById("resultCount")
    .innerHTML =
        "조회 건수 : " + data.length;

    const tbody =
        document.querySelector("#resultTable tbody");

    tbody.innerHTML = "";

    data.forEach(row=>{

        tbody.innerHTML += `

        <tr>

            <td>${row.releaseDate}</td>
            <td>${row.productionOrder}</td>
            <td>${row.targetDevice}</td>
            <td>${row.newBatch}</td>
            <td>${row.shipTo}</td>

        </tr>

        `;

    });

}

function searchData(){

    const target =
        document.getElementById("targetDevice")
        .value.toLowerCase();

    const po =
        document.getElementById("po")
        .value.toLowerCase();

    const batch =
        document.getElementById("batch")
        .value.toLowerCase();

    const bridge =
        document.getElementById("bridge")
        .value.toLowerCase();

    const result =
        allData.filter(row =>

            row.targetDevice
            .toLowerCase()
            .includes(target)

            &&

            row.productionOrder
            .toLowerCase()
            .includes(po)

            &&

            row.newBatch
            .toLowerCase()
            .includes(batch)

            &&

            row.bridgeBatch
            .toLowerCase()
            .includes(bridge)

        );

    renderTable(result);

}

function resetSearch(){

    document.getElementById("targetDevice").value="";
    document.getElementById("po").value="";
    document.getElementById("batch").value="";
    document.getElementById("bridge").value="";

    renderTable(allData);

}

function clearAllData(){

    allData = [];

    renderTable([]);

}
