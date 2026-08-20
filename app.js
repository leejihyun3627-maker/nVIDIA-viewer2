let rawData =
JSON.parse(
localStorage.getItem("NV2_RAW_DATA") || "[]"
);

let currentTab = "ALL";

function saveData(){
    localStorage.setItem(
        "NV2_RAW_DATA",
        JSON.stringify(rawData)
    );
}

window.loadFiles = function(){

    const files =
    document.getElementById("csvFile").files;

    if(files.length===0){

        alert("CSV 선택하세요.");
        return;

    }

    Array.from(files).forEach(file=>{

        Papa.parse(file,{

            header:true,
            skipEmptyLines:true,

            complete:function(result){

                result.data.forEach(row=>{

                    row.__fileName =
                    file.name;

                    row.__isRevision =
                    file.name.includes("_CHA_");

                    rawData.push(row);

                });

                saveData();

                refreshTargetDevice();

                renderLatestData();

            }

        });

    });

};

function refreshTargetDevice(){

    let list =
    document.getElementById(
    "targetList"
    );

    if(!list){

        list =
        document.createElement(
        "datalist"
        );

        list.id =
        "targetList";

        document.body.appendChild(
        list
        );

        document
        .getElementById(
        "targetDevice"
        )
        .setAttribute(
        "list",
        "targetList"
        );

    }

    const targets =
    [...new Set(

        rawData.map(
        x=>
        x[
        "Production Order Build-As Part"
        ]
        )
        .filter(Boolean)

    )];

    list.innerHTML="";

    targets
    .sort()
    .forEach(v=>{

        list.innerHTML +=

        `<option value="${v}">`;

    });

}

function extractBridgeTokens(str){

    if(!str)
    return [];

    let result=[];

    str.split("#")
    .forEach(part=>{

        part.split("~")
        .forEach(v=>{

            result.push(
            v.trim()
            );

        });

    });

    return result;

}

function parseReleaseDate(str){

    if(!str)
    return null;

    const p =
    str.trim().split("/");

    return new Date(
        p[2],
        p[0]-1,
        p[1]
    );

}

function latestMap(){

    const map = {};

    rawData.forEach(row=>{

        const po =
        row[
        "Production Order Number"
        ];

        if(!po)
        return;

        const filename =
        row.__fileName || "";

        const current =
        map[po];

        if(!current){

            map[po] = row;

            return;

        }

        const revCurrent =
        current.__isRevision;

        const revNew =
        row.__isRevision;

        if(
            !revCurrent &&
            revNew
        ){

            map[po] = row;

        }

    });

    return map;

}

function renderLatestData(){

    const latest =
    Object.values(
    latestMap()
    );

    applyFilter(latest);

}

window.searchData =
function(){

    const latest =
    Object.values(
    latestMap()
    );

    applyFilter(latest);

};

function applyFilter(data){

    const target =
    document
    .getElementById(
    "targetDevice"
    )
    .value
    .toLowerCase();

    const po =
    document
    .getElementById(
    "po"
    )
    .value
    .toLowerCase();

    const batch =
    document
    .getElementById(
    "batch"
    )
    .value
    .toLowerCase();

    const bridge =
    document
    .getElementById(
    "bridge"
    )
    .value
    .toLowerCase();

    const fromDate =
    document
    .getElementById(
    "fromDate"
    )
    .value;

    const toDate =
    document
    .getElementById(
    "toDate"
    )
    .value;

    const filtered =
    data.filter(row=>{

        const routing =
        (
        row["Routing"]||""
        );

        if(
        currentTab==="ASSY"
        &&
        !routing.includes(
        "ASSY#SHIP"
        ))
        return false;

        if(
        currentTab==="BUMP"
        &&
        !routing.includes(
        "BUMP#SHIP"
        ))
        return false;

        const releaseDate =
        parseReleaseDate(
        row[
        "Release Date"
        ]
        );

        if(
        fromDate &&
        releaseDate <
        new Date(fromDate)
        )
        return false;

        if(
        toDate &&
        releaseDate >
        new Date(toDate)
        )
        return false;

        const bridgeTokens =
        extractBridgeTokens(

        row[
        "Bridge Batches"
        ]||""

        )
        .join(" ")
        .toLowerCase();

        return (

        (
        row[
        "Production Order Build-As Part"
        ]||""
        )
        .toLowerCase()
        .includes(target)

        &&

        (
        row[
        "Production Order Number"
        ]||""
        )
        .toLowerCase()
        .includes(po)

        &&

        (
        row[
        "New Build-As Batch"
        ]||""
        )
        .toLowerCase()
        .includes(batch)

        &&

        bridgeTokens
        .includes(bridge)

        );

    });

    drawTable(filtered);

}

function drawTable(rows){

    const tbody =
    document.querySelector(
    "#resultTable tbody"
    );

    tbody.innerHTML="";

    document
    .getElementById(
    "resultCount"
    )
    .innerHTML =
    "조회건수 : "
    + rows.length;

    rows
    .sort((a,b)=>{

        const d1 =
        parseReleaseDate(
        a["Release Date"]
        );

        const d2 =
        parseReleaseDate(
        b["Release Date"]
        );

        return d1-d2;

    });

    rows.forEach(r=>{

        const rev =
        r.__isRevision
        ?
        "<span class='rev'>REV</span>"
        :
        "";

        const changeFlag =
        (
        r[
        "Change Order Instructions"
        ]||""
        )
        .trim() !== ""
        ?
        "⚠ CHANGE"
        :
        "";

        tbody.innerHTML +=

        `<tr>

        <td>${r["Release Date"]||""}</td>

        <td>

        ${(r["Production Order Number"] || "")
.replace(/^0+/,'')}


        </td>

        <td>${rev}</td>

        <td>
        ${r["Routing"]||""}
        </td>

        <td>
        ${r["Production Order Build-As Part"]||""}
        </td>

        <td>
        ${r["New Build-As Batch"]||""}
        </td>

        <td>
        ${r["Ship To"]||""}
        </td>

        <td>
        ${r["Production Order Quantity"]||""}
        </td>

        <td>
        ${changeFlag}
        </td>

        </tr>`;

    });

}

window.clearAllData =
function(){

    if(
    !confirm(
    "전체 삭제?"
    )
    )
    return;

    rawData=[];

    saveData();

    drawTable([]);

};

window.setTab =
function(tab){

    currentTab = tab;

    renderLatestData();

};

refreshTargetDevice();

renderLatestData();
