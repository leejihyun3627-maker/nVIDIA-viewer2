let allData = [];

window.loadFiles = function () {

    const files =
        document.getElementById("csvFile").files;

    if (files.length === 0) {

        alert("CSV 파일을 선택하세요.");
        return;
    }

    Array.from(files).forEach(file => {

        Papa.parse(file, {

            header: true,

            skipEmptyLines: true,

            complete: function (results) {

                console.log(results);

                allData.push(...results.data);

                alert(
                    file.name +
                    " 업로드 완료 : " +
                    results.data.length +
                    "건"
                );

                renderTable(allData);

            }

        });

    });

};

window.searchData = function () {

    alert(
        "데이터 수 : " +
        allData.length
    );

};

function renderTable(data) {

    const tbody =
        document.querySelector(
            "#resultTable tbody"
        );

    if (!tbody) return;

    tbody.innerHTML = "";

    data.forEach(row => {

        tbody.innerHTML += `

            <tr>

                <td>
                ${row["Release Date"] || ""}
                </td>

                <td>
                ${row["Production Order Number"] || ""}
                </td>

                <td>
                ${row["Production Order Build-As Part"] || ""}
                </td>

                <td>
                ${row["New Build-As Batch"] || ""}
                </td>

                <td>
                ${row["Ship To"] || ""}
                </td>

            </tr>

        `;

    });

}
