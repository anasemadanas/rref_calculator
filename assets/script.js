
let steps=[];
const EPSILON=1e-10;
const SOUND_FILES={
    soundCalculate:"btn-calculate.wav",
    soundClick:"btn-click.wav",
    soundRemove:"btn-remove.wav",
    soundError:"error.wav"
};
const soundCache=new Map();
let uiSoundsBound=false;

function getSoundSource(id){
    const fileName=SOUND_FILES[id];

    if(!fileName){
        return null;
    }

    const basePath=window.location.pathname.includes("/pages/") ? "../sounds/" : "sounds/";
    return basePath + fileName;
}

function getSound(id){
    const existing=document.getElementById(id);

    if(existing){
        return existing;
    }

    if(!soundCache.has(id)){
        const source=getSoundSource(id);

        if(!source){
            return null;
        }

        soundCache.set(id,new Audio(source));
    }

    return soundCache.get(id);
}

function bindUiSounds(){
    if(uiSoundsBound){
        return;
    }

    uiSoundsBound=true;

    document.querySelectorAll(".navbar a, .footer-links a").forEach(link=>{
        link.addEventListener("click",()=>playSound("soundClick"));
    });

    document.querySelectorAll(".buttons button").forEach(button=>{
        const text=(button.textContent || "").trim();
        const inlineHandler=button.getAttribute("onclick") || "";

        if(inlineHandler.includes("soundClick")){
            return;
        }

        if(/^(Solve REF|Solve RREF|REF|RREF|Reset All|Clear)$/i.test(text)){
            return;
        }

        button.addEventListener("click",()=>playSound("soundClick"));
    });
}

if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",bindUiSounds);
}else{
    bindUiSounds();
}

//create matrix input table
function createMatrix(){
    let rows =
    Number(document.getElementById("rows").value);

    let cols =
    Number(document.getElementById("cols").value) + 1;
	
    let div=document.getElementById("matrixInput");
    div.innerHTML="";
    let table=document.createElement("table");

    for(let i=0;i<rows;i++){

        let tr=document.createElement("tr");
        for(let j=0;j<cols;j++){
            let td=document.createElement("td");
            td.innerHTML=
           `<input class="cell" type="number" placeholder="0">`;
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    div.appendChild(table);
}

function zeroMatrix(){

    let inputs=document.querySelectorAll(".cell");
    inputs.forEach(input=>{input.value=0;}
    );

}
function randomMatrix(){
    let inputs=document.querySelectorAll(".cell");

    inputs.forEach(input=>{
        let random=Math.floor(Math.random()*13);
        input.value=random;    }
    );
}

function clearAll(){

    document.getElementById("matrixInput").innerHTML="";
    document.getElementById("result").innerHTML="";
    document.getElementById("steps").innerHTML="";

    document.getElementById("originalEquations").innerHTML="";
    document.getElementById("solutionEquations").innerHTML="";
    document.getElementById("solutionType").innerHTML="";
}

//------------------ solve --------------------------------------
function solveREF(){

    if(document.querySelectorAll(".cell").length===0){

        playSound("soundError");

        alert("Please generate a matrix first");

        return;
    }

    let matrix=getMatrix();

    document.getElementById("originalEquations").innerHTML =
    matrixToEquation(matrix).join("<br>");
    let result=REF(matrix);

    display(result);
    document.getElementById("solutionType").innerHTML =
        "";
    document.getElementById("solutionEquations").innerHTML =
    matrixToEquation(result).join("<br>");


}

function solveRREF(){

    if(document.querySelectorAll(".cell").length===0){

        playSound("soundError");

        alert("Please generate a matrix first");

        return;
    }

    let matrix=getMatrix();

    // Original System
    document.getElementById("originalEquations").innerHTML =
    matrixToEquation(matrix).join("<br>");

    let result=RREF(matrix);

    display(result);

    document.getElementById("solutionEquations").innerHTML =
    solutionFromRREF(result).join("<br>");

    document.getElementById("solutionType").innerHTML =
    analyzeSolution(result);
}
//--------------------------------------------------------

function getMatrix(){

    let inputs = document.querySelectorAll(".cell");

    let rows =
    Number(document.getElementById("rows").value);

    let cols =
    Number(document.getElementById("cols").value) + 1;


    let matrix=[];
    let index=0;


    for(let i=0;i<rows;i++){

        let row=[];

        for(let j=0;j<cols;j++){

            row.push(
                Number(inputs[index++].value)
            );

        }

        matrix.push(row);
    }

    return matrix;
}

function copyMatrix(m){

    return JSON.parse(JSON.stringify(m));

}

function saveStep(text,matrix){
    steps.push({
        operation:text,
        matrix:copyMatrix(matrix)
    });
}

function formatOperation(text){
    return text
        .replace(/R(\d+)/g, "R<sub>$1</sub>");
}

function decimalToFraction(value){
    if(Number.isInteger(value))
        return value;

    let negative = value < 0;

    value = Math.abs(value);

    let tolerance = 1.0E-6;
    let h1=1;
    let h2=0;
    let k1=0;
    let k2=1;
    let b=value;

    do{
        let a=Math.floor(b);
        let aux=h1;
        h1=a*h1+h2;
        h2=aux;

        aux=k1;
        k1=a*k1+k2;
        k2=aux;

        b=1/(b-a);

    }while(
        Math.abs(value-h1/k1)>value*tolerance
    );

    let result=`${h1}/${k1}`;

    return negative ? "-" + result : result;
}

function swapRows(m,a,b){
    let temp=m[a];
    m[a]=m[b];
    m[b]=temp;
}

function isNearZero(value){
    return Math.abs(value)<EPSILON;
}

function cleanRow(row){
    for(let i=0;i<row.length;i++){
        if(isNearZero(row[i])){
            row[i]=0;
        }
    }
}

function findPivotRow(m,startRow,col){
    let pivot=-1;
    let maxAbs=EPSILON;

    for(let i=startRow;i<m.length;i++){
        let value=Math.abs(m[i][col]);

        if(value>maxAbs){
            maxAbs=value;
            pivot=i;
        }
    }

    return pivot;
}

function leadingCoefficientIndex(row,variableCount){
    for(let j=0;j<variableCount;j++){
        if(!isNearZero(row[j])){
            return j;
        }
    }

    return -1;
}

function inspectReducedMatrix(matrix){
    const variables=matrix[0].length-1;
    const pivotColumns=new Set();
    const pivotByColumn=new Map();
    let inconsistent=false;

    for(let i=0;i<matrix.length;i++){
        const pivotColumn=leadingCoefficientIndex(matrix[i],variables);

        if(pivotColumn===-1){
            if(!isNearZero(matrix[i][variables])){
                inconsistent=true;
            }
            continue;
        }

        pivotColumns.add(pivotColumn);
        pivotByColumn.set(pivotColumn,i);
    }

    return {
        variables,
        pivotColumns,
        pivotByColumn,
        inconsistent
    };
}

function REF(matrix){
    steps=[];
    let m=copyMatrix(matrix);

    let rows=m.length;
    let cols=m[0].length-1;
    let pivotRow=0;

    for(let col=0; col<cols && pivotRow<rows; col++){

        let pivot=findPivotRow(m,pivotRow,col);

        if(pivot===-1) continue;


        if(pivot!=pivotRow){
            swapRows(m,pivot,pivotRow);
            saveStep(`Swap R${pivot+1} and R${pivotRow+1}`,m);
        }

        cleanRow(m[pivotRow]);

        let pivotValue=m[pivotRow][col];

        if(isNearZero(pivotValue)){
            continue;
        }


        for(let i=pivotRow+1;i<rows;i++){

            let factor=m[i][col]/pivotValue;

            if(isNearZero(factor))
                continue;


            for(let j=col;j<m[0].length;j++){
                m[i][j]-=factor*m[pivotRow][j];

                if(isNearZero(m[i][j])){
                    m[i][j]=0;
                }
            }

            cleanRow(m[i]);


            saveStep(
              `R${i+1} = R${i+1} - ${decimalToFraction(factor)}R${pivotRow+1}`,
              m
            );
        }

        pivotRow++;
    }

    return m;
}

function RREF(matrix){

    let m=REF(matrix);

    let rows=m.length;
    let cols=m[0].length-1;
    let inconsistent=false;

    for(let i=0;i<rows;i++){

        let pivot=leadingCoefficientIndex(m[i],cols);

        if(pivot===-1 && !isNearZero(m[i][cols])){
            inconsistent=true;
            for(let j=0;j<cols;j++){
                m[i][j]=0;
            }
            m[i][cols]=1;
        }
    }


    for(let i=rows-1;i>=0;i--){

        let pivot=leadingCoefficientIndex(m[i],cols);


        if(pivot===-1)
            continue;


        let value=m[i][pivot];

        if(isNearZero(value)){
            continue;
        }


        // normalize row
        for(let j=0;j<=cols;j++){
            m[i][j]/=value;

            if(isNearZero(m[i][j])){
                m[i][j]=0;
            }
        }


        saveStep(
            `Normalize R${i+1}`,
            m
        );


        // eliminate above
        for(let r=0;r<i;r++){

            let factor=m[r][pivot];


            if(isNearZero(factor))
                continue;


            for(let c=0;c<=cols;c++){

                m[r][c]-=factor*m[i][c];

                if(isNearZero(m[r][c])){
                    m[r][c]=0;
                }

            }

            cleanRow(m[r]);


            saveStep(
                `R${r+1} = R${r+1} - ${decimalToFraction(factor)}R${i+1}`,
                m
            );
        }
    }


    return m;
}



function display(matrix){

    document.getElementById("result").innerHTML=
    matrixHTML(matrix);

    let div=document.getElementById("steps");


    div.innerHTML="";

    steps.forEach((s,i)=>{


        div.innerHTML+=
        `
        <div class="step">

        <h3>Step ${i+1}</h3>

		<p class="operation">
		${formatOperation(s.operation)}
		</p>

        ${matrixHTML(s.matrix)}

        </div>
        `;

    });

}


function matrixHTML(m){

    let html="<table class='matrix-table'>";


    for(let i=0;i<m.length;i++){

        html+="<tr>";

        for(let j=0;j<m[i].length;j++){

            let value = Number(m[i][j].toFixed(3));
            let cls="";
            // leading 1
            if(value===1){

                let isLeading=true;


                for(let k=0;k<j;k++){

                    if(Math.abs(m[i][k])>1e-10){
                        isLeading=false;
                    }
                }

                if(isLeading)
                    cls="leading-one";
            }

            if(value===0)
                cls="zero";

            let border="";
            if(j === m[i].length-1){
                border="augmented";
            }
            html+=`
            <td class="${cls} ${border}">
            ${value}
            </td>
            `;

        }
        html+="</tr>";

    }
    html+="</table>";
    return html;

}

function matrixToEquation(matrix){

    let equations=[];

    let vars = matrix[0].length - 1;

    for(let i=0;i<matrix.length;i++){

        let eq="";

        for(let j=0;j<vars;j++){

            let value=matrix[i][j];

            if(Math.abs(value)<1e-10)
                continue;

            if(eq!="" && value>0)
                eq+=" + ";

            if(value==-1)
                eq+="-";
            else if(value!=1)
                eq+=value;

            eq+="x<sub>"+(j+1)+"</sub>";

        }

        eq+=" = "+matrix[i][vars];
        equations.push(eq);
    }
    return equations;

}

function analyzeSolution(matrix) {
    const analysis=inspectReducedMatrix(matrix);

    if (analysis.inconsistent) {
        return "No Solution";
    }

    if (analysis.pivotColumns.size === analysis.variables) {
        return "Unique Solution";
    }

    return "Infinite Solutions";
}

function solutionFromRREF(matrix) {
    const analysis=inspectReducedMatrix(matrix);
    const variables = analysis.variables;
    const result = [];
    const formatValue = (value) => {
        const rounded = Math.round(value * 1000) / 1000;

        if (Math.abs(rounded) < 1e-10) {
            return "0";
        }

        if (Number.isInteger(rounded)) {
            return String(rounded);
        }

        return rounded
            .toFixed(3)
            .replace(/\.0+$/, "")
            .replace(/(\.\d*?)0+$/, "$1");
    };

    if (analysis.inconsistent) {
        return ["No Solution"];
    }

    const freeColumns = [];
    for (let col = 0; col < variables; col++) {
        if (!analysis.pivotColumns.has(col)) {
            freeColumns.push(col);
        }
    }

    const parameterNames = freeColumns.map((_, index) => `t<sub>${index + 1}</sub>`);
    const parameterByColumn = new Map();

    for (let i = 0; i < freeColumns.length; i++) {
        parameterByColumn.set(freeColumns[i], parameterNames[i]);
    }

    const orderedSolutions = [];

    for (let col = 0; col < variables; col++) {
        let expression;

        if (parameterByColumn.has(col)) {
            expression = parameterByColumn.get(col);
        } else {
            const row = analysis.pivotByColumn.get(col);

            if (row === undefined) {
                expression = "0";
            } else {
                expression = formatValue(matrix[row][variables]);

                for (let i = 0; i < freeColumns.length; i++) {
                    const freeColumn = freeColumns[i];
                    const coefficient = -matrix[row][freeColumn];

                    if (Math.abs(coefficient) < 1e-10) {
                        continue;
                    }

                    const parameterName = parameterNames[i];
                    const magnitude = Math.abs(coefficient) === 1 ? "" : formatValue(Math.abs(coefficient));
                    const term = `${magnitude}${parameterName}`;

                    if (coefficient > 0) {
                        expression += ` + ${term}`;
                    } else {
                        expression += ` - ${term}`;
                    }
                }
            }
        }

        orderedSolutions.push({
            index: col,
            text: `x<sub>${col + 1}</sub> = ${expression}`
        });
    }

    orderedSolutions.sort((a, b) => a.index - b.index);

    for (let i = 0; i < orderedSolutions.length; i++) {
        result.push(orderedSolutions[i].text);
    }

    return result;
}

function playSound(id){

    let sound=getSound(id);

    if(sound){

        sound.currentTime=0;
        sound.play().catch(()=>{});

    }

}