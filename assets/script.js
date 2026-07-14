
let steps=[];



function createMatrix(){


    let rows =
    Number(document.getElementById("rows").value);


    let cols =
    Number(document.getElementById("cols").value);



    let div=document.getElementById("matrixInput");


    div.innerHTML="";


    let table=document.createElement("table");


    for(let i=0;i<rows;i++){

        let tr=document.createElement("tr");


        for(let j=0;j<cols;j++){

            let td=document.createElement("td");


            td.innerHTML=
            `<input class="cell" type="number" value="0">`;


            tr.appendChild(td);

        }

        table.appendChild(tr);

    }


    div.appendChild(table);


}





function getMatrix(){


    let inputs=
    document.querySelectorAll(".cell");


    let rows=
    Number(document.getElementById("rows").value);


    let cols=
    Number(document.getElementById("cols").value);



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


    return `${h1}/${k1}`;

}

function swapRows(m,a,b){

    let temp=m[a];

    m[a]=m[b];

    m[b]=temp;

}




function REF(matrix){


    steps=[];


    let m=copyMatrix(matrix);


    let rows=m.length;

    let cols=m[0].length;



    let pivotRow=0;



    for(let col=0; col<cols && pivotRow<rows; col++){


        let pivot=pivotRow;


        while(
            pivot<rows &&
            Math.abs(m[pivot][col])<1e-10
        ){

            pivot++;

        }



        if(pivot==rows)
            continue;



        if(pivot!=pivotRow){

            swapRows(m,pivot,pivotRow);


            saveStep(
                `Swap R${pivot+1} and R${pivotRow+1}`,
                m
            );

        }



        for(let i=pivotRow+1;i<rows;i++){


            let factor=
            m[i][col]/m[pivotRow][col];


            for(let j=col;j<cols;j++){

                m[i][j]-=
                factor*m[pivotRow][j];

            }


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

    let cols=m[0].length;



    for(let i=rows-1;i>=0;i--){


        let pivot=-1;



        for(let j=0;j<cols;j++){

            if(Math.abs(m[i][j])>1e-10){

                pivot=j;
                break;

            }

        }


        if(pivot==-1)
            continue;



        let value=m[i][pivot];



        for(let j=0;j<cols;j++)
            m[i][j]/=value;



        saveStep(
            `Normalize R${i+1}`,
            m
        );



        for(let r=0;r<i;r++){


            let factor=m[r][pivot];



            for(let c=0;c<cols;c++){

                m[r][c]-=
                factor*m[i][c];

            }



            saveStep(
                `R${r+1} = R${r+1} - ${decimalToFraction(factor)}R${i+1}`,
                m
            );


        }



    }



    return m;


}







function solveREF(){


    let matrix=getMatrix();



    document.getElementById("originalEquations").innerHTML =
    matrixToEquation(matrix).join("<br>");


    let result=REF(matrix);


    display(result);


    document.getElementById("solutionEquations").innerHTML =
    matrixToEquation(result).join("<br>");


}



function solveRREF(){


    let matrix=getMatrix();



    // Original System
    document.getElementById("originalEquations").innerHTML =
    matrixToEquation(matrix).join("<br>");



    let result=RREF(matrix);



    display(result);



    document.getElementById("solutionEquations").innerHTML =
    solutionFromRREF(result).join("<br>");


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


            html+=
            `<td class="${cls}">
            ${value}
            </td>`;

        }


        html+="</tr>";

    }


    html+="</table>";


    return html;

}





function clearAll(){

    document.getElementById("matrixInput").innerHTML="";
    document.getElementById("result").innerHTML="";
    document.getElementById("steps").innerHTML="";

    document.getElementById("originalEquations").innerHTML="";
    document.getElementById("solutionEquations").innerHTML="";

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

function solutionFromRREF(matrix){

    let result=[];


    for(let i=0;i<matrix.length;i++){

        let pivot=-1;


        for(let j=0;j<matrix[i].length-1;j++){

            if(Math.abs(matrix[i][j]-1)<1e-10){

                pivot=j;
                break;

            }

        }


        if(pivot!=-1){

            result.push(
                `x<sub>${pivot+1}</sub> = 
                ${matrix[i][matrix[i].length-1]}`
            );

        }

    }


    return result;

}
