let rawData = JSON.parse(
    localStorage.getItem("NV2_RAW_DATA") || "[]"
);

let currentTab = "ALL";

function saveData() {
    localStorage.setItem(
        "NV2_RAW_DATA",
        JSON.stringify(rawData)
    );
}

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

            complete: function (result) {

                result.data.forEach(row => {

                    row.__fileName = file.name;
                    row.__isRevision =
                        file.name.includes("_CHA_");

                    const exists =
                        rawData.some(x =>
                            x["Production Order Number"] === row["Production Order Number"] &&
                            x.__fileName === file.name
                        );

                    if (!exists) {
                        rawData.push(row);
                    }

                });

                saveData();
                refreshTargetDevice();
                renderLatestData();

                alert(
                    `${file.name} 업로드 완료`
                );

            }

        });

    });

};

window.resetSearch = function () {

    document.getElementById("targetDevice").value = "";
    document.getElementById("po").value = "";
    document.getElementById("batch").value = "";
    document.getElementById("bridge").value = "";
    document.getElementById("fromDate").value = "";
    document.getElementById("toDate").value = "";

    renderLatestData();

};

window.clearAllData = function () {

    if (!confirm("전체 데이터 삭제?"))
        return;

    rawData = [];

    saveData();

    renderLatestData();

};

window.setTab = function (tab) {

    currentTab = tab;

    renderLatestData();

};

function refreshTargetDevice() {

    let list =
        document.getElementById("targetList");

    if (!list) {

        list =
            document.createElement("datalist");

        list.id = "targetList";

        document.body.appendChild(list);

        document
            .getElementById("targetDevice")
            .setAttribute("list", "targetList");

    }

    const targets = [

        ...new Set(
            rawData
                .map(x =>
                    x["Production Order Build-As Part"]
                )
                .filter(Boolean)
        )

    ];

    list.innerHTML = "";

    targets
        .sort()
        .forEach(v => {

            list.innerHTML +=
                `<option value="${v}">`;

        });

}

function extractBridgeTokens(str) {

    if (!str) return [];

    const result = [];

    str.split("#").forEach(part => {

        part.split("~").forEach(v => {

            result.push(v.trim());

        });

    });

    return result;

}

function parseReleaseDate(str) {

    if (!str) return null;

    const p = str.split("/");

    return new Date(
        p[2],
        p[0] - 1,
        p[1]
    );

}

function latestMap() {

    const map = {};

    rawData.forEach(row => {

        const po =
            row["Production Order Number"];

        if (!po) return;

        if (!map[po]) {

            map[po] = row;
            return;

        }

        if (
            !map[po].__isRevision &&
            row.__isRevision
        ) {

            map[po] = row;

        }

    });

    return map;

}

window.searchData = function () {

    renderLatestData();

};

function renderLatestData() {

    const latest =
        Object.values(
            latestMap()
        );

    applyFilter(latest);

}

function applyFilter(data) {

    const target =
        document.getElementById("targetDevice")
            .value
            .toLowerCase();

    const po =
        document.getElementById("po")
            .value
            .toLowerCase();

    const batch =
        document.getElementById("batch")
            .value
            .toLowerCase();

    const bridge =
        document.getElementById("bridge")
            .value
            .toLowerCase();

    const fromDate =
        document.getElementById("fromDate")
            .value;

    const toDate =
        document.getElementById("toDate")
            .value;

    const filtered = data.filter(row => {

        const routing =
            row["Routing"] || "";

        if (
            currentTab === "ASSY" &&
            !routing.includes("ASSY#SHIP")
        ) return false;

        if (
            currentTab === "BUMP" &&
            !routing.includes("BUMP#SHIP")
        ) return false;

        const releaseDate =
            parseReleaseDate(
                row["Release Date"]
            );

        if (
            fromDate &&
            releaseDate < new Date(fromDate)
        ) return false;

        if (
            toDate &&
            releaseDate > new Date(toDate)
        ) return false;

        const bridgeText =
            extractBridgeTokens(
                row["Bridge Batches"] || ""
            )
                .join(" ")
                .toLowerCase();

        return (

            (row["Production Order Build-As Part"] || "")
                .toLowerCase()
                .includes(target)

            &&

            (row["Production Order Number"] || "")
                .toLowerCase()
                .includes(po)

            &&

            (row["New Build-As Batch"] || "")
                .toLowerCase()
                .includes(batch)

            &&

            bridgeText.includes(bridge)

        );

    });

    drawTable(filtered);

}

function drawTable(rows) {

    const tbody =
        document.querySelector(
            "#resultTable tbody"
        );

    tbody.innerHTML = "";

    document.getElementById(
        "resultCount"
    ).innerHTML =
        "조회 건수 : " +
        rows.length;

    rows.sort((a, b) => {

        return (
            parseReleaseDate(
                a["Release Date"]
            ) -
            parseReleaseDate(
                b["Release Date"]
            )
        );

    });

    rows.forEach(r => {

        const revisionStatus =
            r.__isRevision
                ? "<span class='rev'>UPDATED</span>"
                : "";

        tbody.innerHTML += `

        <tr>

        <td>${r["Release Date"] || ""}</td>

        <td>

        <a
        class="po-link"
        onclick="showHistory('${r["Production Order Number"]}')"
        >

        ${
